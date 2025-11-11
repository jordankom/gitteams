// backend/src/controllers/publicController.ts
import { Request, Response } from 'express';
import axios from 'axios';
import Project from '../models/Project';
import Group from '../models/Group';
import User from '../models/User';
import { env } from '../config/env';

/** ---------- Utilitaires ---------- */

// Type fort pour la remontée du rate-limit
type RateLimited = { status: number; resetAt: string | null };

/**
 * Valide que tous les usernames existent sur GitHub.
 * Utilise le token GitHub du prof (créateur du projet) pour limiter les 403/rate limits.
 */
async function validateGithubProfiles(usernames: string[], token?: string) {
    const uniq = Array.from(new Set(usernames.map(u => u.trim()).filter(Boolean)));

    const headers: Record<string, string> = {
        Accept: 'application/vnd.github+json',
        'User-Agent': env.GITHUB_USER_AGENT || 'git-teams-app',
    };
    if (token) headers.Authorization = `Bearer ${token}`;

    const checks = await Promise.allSettled(
        uniq.map(u =>
            axios.get(`https://api.github.com/users/${encodeURIComponent(u)}`, {
                headers,
                timeout: 10_000,
                // ✨ typer le callback pour éviter l'implicit any
                validateStatus: (s: number) => s === 200 || s === 404 || s === 403 || s === 429,
            }),
        ),
    );

    const invalid: string[] = [];
    // ✨ type explicite plutôt que "let ... | null = null" non structuré
    let rateLimited: RateLimited | null = null;

    checks.forEach((r, idx) => {
        const login = uniq[idx];

        if (r.status === 'fulfilled') {
            const res = r.value;
            if (res.status === 404) invalid.push(login);

            if (res.status === 403 || res.status === 429) {
                const reset = res.headers?.['x-ratelimit-reset'] as string | undefined;
                const resetAt = reset ? new Date(Number(reset) * 1000).toISOString() : null;
                rateLimited = { status: res.status, resetAt }; // ✨ champ normalisé
            }
        } else {
            // Erreur réseau/timeout → on considère comme invalide
            invalid.push(login);
        }
    });

    return { invalid, rateLimited };
}

/** ---------- Endpoints publics ---------- */

// GET /api/public/projects/:id/:key
export async function getProjectPublic(req: Request, res: Response) {
    const { id, key } = req.params as { id: string; key: string };

    const project = await Project.findOne({ _id: id, inviteKey: key }).lean();
    if (!project) return res.status(404).json({ message: 'Projet introuvable' });

    return res.json({
        project: {
            id: project._id.toString(),
            title: project.title,
            org: project.org,
            description: project.description ?? 'aucune description',
            minPeople: (project as any).minPeople ?? 1,
            maxPeople: (project as any).maxPeople ?? 999,
            createdAt: project.createdAt,
        },
    });
}

// POST /api/public/projects/:id/:key/groups
export async function createGroupPublic(req: Request, res: Response) {
    const { id, key } = req.params as { id: string; key: string };
    const participants = (req.body?.participants ?? []) as Array<{ username: string; email: string }>;

    // 1) Projet + propriétaire
    const project = await Project.findOne({ _id: id, inviteKey: key }).lean();
    if (!project) return res.status(404).json({ message: 'Projet introuvable ou lien invalide' });

    const owner = await User.findById(project.userId);
    const ownerToken = owner?.getDecryptedToken ? owner.getDecryptedToken() : undefined;

    // 2) Payload
    if (!Array.isArray(participants) || participants.length === 0) {
        return res.status(400).json({ message: 'participants requis' });
    }

    // 3) Taille groupe
    const n = participants.length;
    const min = (project as any).minPeople ?? 1;
    const max = (project as any).maxPeople ?? 999;
    if (n < min || n > max) {
        return res.status(400).json({ message: `La taille du groupe doit être comprise entre ${min} et ${max}.` });
    }

    // 4) Profils GitHub
    const usernames = participants.map(p => p.username);
    const { invalid, rateLimited } = await validateGithubProfiles(usernames, ownerToken);

    // SOLUTION ALTERNATIVE : Créer une variable intermédiaire avec assertion de type
    const hasRateLimit = rateLimited as RateLimited | null;

    if (hasRateLimit !== null) {
        return res.status(403).json({
            message: 'Limite d’API GitHub atteinte, réessayez plus tard.',
            resetAt: hasRateLimit.resetAt,
        });
    }
    if (invalid.length) {
        return res.status(400).json({
            message: 'Certains profils GitHub sont introuvables.',
            invalidUsers: invalid,
        });
    }

    // 5) Conflits (déjà inscrits)
    const existing = await Group.find({ projectId: project._id }).lean();
    const already = new Set(existing.flatMap(g => g.participants.map(p => p.username.toLowerCase())));
    const conflicts = usernames.filter(u => already.has(u.toLowerCase()));
    if (conflicts.length) {
        return res.status(400).json({
            message: 'Certains membres sont déjà inscrits dans un autre groupe pour ce projet.',
            conflicts,
        });
    }

    // 6) Numéro de groupe auto-incrémenté
    const last = await Group.find({ projectId: project._id }).sort({ number: -1 }).limit(1).lean();
    const nextNumber = (last[0]?.number ?? 0) + 1;

    // 7) Création
    const group = await Group.create({
        projectId: project._id,
        number: nextNumber,
        // name: `Groupe ${nextNumber}`, // active si ton schéma a "name" requis
        participants: participants.map(p => ({
            username: p.username.trim(),
            email: p.email.trim(),
        })),
    });

    return res.status(201).json({
        group: {
            id: group.id,
            number: group.number,
            name: `Groupe ${group.number}`,
            participants: group.participants.map(p => ({ username: p.username, email: p.email })),
        },
    });
}