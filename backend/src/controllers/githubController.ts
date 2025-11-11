import { Request, Response } from "express";
import axios from "axios";
import { env } from "../config/env";

// Cache mémoire 5 min par utilisateur pour limiter les appels GitHub
type Org = { id: number; login: string; avatar_url?: string };
type Cached = { orgs: Org[]; expiresAt: number };

const cache = new Map<string, Cached>();
const TTL_MS = 5 * 60 * 1000;

export async function getMyGithubOrgs(req: Request, res: Response) {
    const user = req.user as { id?: string; getDecryptedToken?: () => string };
    if (!user?.getDecryptedToken || !user?.id) {
        return res.status(500).json({ message: "Token GitHub indisponible" });
    }

    // Servez depuis le cache si encore valide
    const now = Date.now();
    const hit = cache.get(user.id);
    if (hit && hit.expiresAt > now) {
        return res.json({ orgs: hit.orgs });
    }

    const token = user.getDecryptedToken();

    try {
        const gh = await axios.get("https://api.github.com/user/orgs?per_page=100", {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/vnd.github+json",
                "User-Agent": env.GITHUB_USER_AGENT || "git-teams-app",
            },
            timeout: 10_000,
            // 🔧 typer l’argument pour éviter "implicitly has an 'any' type"
            validateStatus: (status: number): boolean =>
                status < 400 || status === 401 || status === 403 || status === 429,
        });

        if (gh.status === 401) {
            return res
                .status(401)
                .json({ message: "Token GitHub invalide (401). Vérifiez les droits du token." });
        }
        if (gh.status === 403 || gh.status === 429) {
            const remaining = gh.headers["x-ratelimit-remaining"];
            const reset = gh.headers["x-ratelimit-reset"];
            const resetDate = reset ? new Date(Number(reset) * 1000).toLocaleString() : "bientôt";
            return res.status(403).json({
                message: `Limite d’API GitHub atteinte. Réessaye après ${resetDate}.`,
                remaining,
                reset: resetDate,
            });
        }

        const orgs: Org[] = (gh.data as any[]).map((o) => ({
            id: o.id,
            login: o.login,
            avatar_url: o.avatar_url,
        }));

        cache.set(user.id, { orgs, expiresAt: now + TTL_MS });
        return res.json({ orgs });
    } catch {
        return res
            .status(500)
            .json({ message: "Erreur lors de la récupération des organisations GitHub" });
    }
}
