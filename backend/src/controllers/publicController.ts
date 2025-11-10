import { Request, Response } from 'express';
import Project from '../models/Project';
import Group from '../models/Group';
import { User } from '../models/User';
import { githubUserExists, createRepository, addCollaborator } from '../services/githubService';

export async function getProjectPublic(req: Request, res: Response) {
    const { slug } = req.params;
    const project = await Project.findOne({ inviteSlug: slug }).lean();
    if (!project) return res.status(404).json({ message: 'Projet introuvable' });

    return res.json({
        project: {
            id: project._id.toString(),
            title: project.title,
            org: project.org,
            description: project.description ?? 'aucune description',
            minPeople: project.minPeople,
            maxPeople: project.maxPeople,
        }
    });
}

/** Creation publique d’un groupe */
export async function createGroupPublic(req: Request, res: Response) {
    const { slug } = req.params;
    const { participants } = req.body as { participants: Array<{ username: string; email: string }> };

    if (!Array.isArray(participants) || participants.length === 0) {
        return res.status(400).json({ message: 'participants requis' });
    }

    const cleaned = participants.map((p) => ({
        username: String(p.username || '').trim(),
        email: String(p.email || '').trim(),
    }));
    if (cleaned.some((p) => !p.username || !p.email)) {
        return res.status(400).json({ message: 'Chaque participant doit avoir username + email' });
    }

    const usernames = cleaned.map((p) => p.username.toLowerCase());
    const dup = usernames.find((u, i) => usernames.indexOf(u) !== i);
    if (dup) return res.status(400).json({ message: `Doublon dans les participants: ${dup}` });

    const project = await Project.findOne({ inviteSlug: slug });
    if (!project) return res.status(404).json({ message: 'Projet introuvable' });

    if (cleaned.length < project.minPeople) return res.status(400).json({ message: `Minimum ${project.minPeople} participant(s)` });
    if (cleaned.length > project.maxPeople) return res.status(400).json({ message: `Maximum ${project.maxPeople} participant(s)` });

    const owner = await User.findById(project.userId);
    if (!owner || typeof (owner as any).getDecryptedToken !== 'function') {
        return res.status(500).json({ message: 'Token GitHub propriétaire introuvable' });
    }
    const ownerToken = (owner as any).getDecryptedToken() as string;

    try {
        for (const p of cleaned) {
            const ok = await githubUserExists(p.username, ownerToken);
            if (!ok) return res.status(400).json({ message: `Utilisateur GitHub introuvable: ${p.username}` });
        }
    } catch (err: any) {
        if (err?.response?.status === 403) return res.status(403).json({ message: 'Limite API GitHub atteinte' });
        return res.status(502).json({ message: 'Erreur de vérification GitHub' });
    }

    const conflict = await Group.findOne({
        projectId: project._id,
        'participants.username': { $in: cleaned.map((p) => p.username) },
    }).lean();
    if (conflict) {
        return res.status(409).json({ message: 'Un ou plusieurs participants sont déjà inscrits sur ce projet' });
    }

    const updated = await Project.findOneAndUpdate(
        { _id: project._id },
        { $inc: { nextGroupNumber: 1 } },
        { new: true }
    );
    if (!updated) return res.status(500).json({ message: 'Erreur allocation numéro de groupe' });
    const number = updated.nextGroupNumber - 1;

    const base = project.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 50);
    const repoName = `${base || 'projet'}-g${number}`;

    let repoInfo: { htmlUrl: string; fullName: string; ownerLogin: string; repoName: string };
    try {
        repoInfo = await createRepository({
            token: ownerToken,
            name: repoName,
            org: project.org || undefined,
            description: `Groupe ${number} pour le projet ${project.title}`,
            privateRepo: true,
        });
    } catch (err: any) {
        const msg = err?.response?.data?.message || 'Création du repository GitHub échouée';
        return res.status(502).json({ message: msg });
    }

    const addResults: Record<string, string> = {};
    for (const p of cleaned) {
        try {
            const result = await addCollaborator({
                token: ownerToken,
                owner: repoInfo.ownerLogin,
                repo: repoInfo.repoName,
                username: p.username,
            });
            addResults[p.username] = result;
        } catch {
            addResults[p.username] = 'error';
        }
    }

    const group = await Group.create({
        projectId: project._id,
        number,
        participants: cleaned,
    });

    return res.status(201).json({
        group: { id: group._id.toString(), number: group.number },
        repository: { url: repoInfo.htmlUrl, fullName: repoInfo.fullName },
        collaborators: addResults,
    });
}
