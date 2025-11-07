import { Request, Response } from 'express';
import axios from 'axios';
import { env } from '../config/env';

// Petit cache mémoire par utilisateur pour éviter de taper l’API à chaque fois (TTL 5 min)
type Cached = { orgs: Array<{ id: number; login: string; avatar_url?: string }>; expiresAt: number };
const cache = new Map<string, Cached>();
const TTL_MS = 5 * 60 * 1000;

export async function getMyGithubOrgs(req: Request, res: Response) {
    const user = req.user as { id?: string; getDecryptedToken?: () => string };
    if (!user?.getDecryptedToken || !user?.id) {
        return res.status(500).json({ message: 'Token GitHub indisponible' });
    }

    // ✅ Anti-sursollicitation : servez depuis le cache si dispo
    const now = Date.now();
    const hit = cache.get(user.id!);
    if (hit && hit.expiresAt > now) {
        return res.json({ orgs: hit.orgs });
    }

    const token = user.getDecryptedToken();

    try {
        // 🔹 Ajout User-Agent + pagination (jusqu’à 100 orgs)
        const gh = await axios.get('https://api.github.com/user/orgs?per_page=100', {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/vnd.github+json',
                'User-Agent': env.GITHUB_USER_AGENT || 'git-teams-app', // ← important pour GitHub
            },
            timeout: 10_000,
            // Pas de retries automatiques
            validateStatus: (s) => s < 400 || s === 401 || s === 403 || s === 429,
        });

        if (gh.status === 401) {
            return res.status(401).json({ message: 'Token GitHub invalide (401). Vérifiez les droits du token.' });
        }
        if (gh.status === 403 || gh.status === 429) {
            const remaining = gh.headers['x-ratelimit-remaining'];
            const reset = gh.headers['x-ratelimit-reset'];
            const resetDate = reset ? new Date(Number(reset) * 1000).toLocaleString() : 'bientôt';
            return res.status(403).json({
                message: `Limite d’API GitHub atteinte. Réessaye après ${resetDate}.`,
                remaining,
                reset: resetDate,
            });
        }

        const orgs = (gh.data as any[]).map((o) => ({
            id: o.id,
            login: o.login,
            avatar_url: o.avatar_url,
        }));

        // ✅ Mise en cache 5 minutes
        cache.set(user.id!, { orgs, expiresAt: now + TTL_MS });
        return res.json({ orgs });
    } catch (err: any) {
        return res.status(500).json({ message: 'Erreur lors de la récupération des organisations GitHub' });
    }
}
