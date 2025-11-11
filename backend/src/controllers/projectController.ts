import { Request, Response } from 'express';
import Project from '../models/Project';
import Group from '../models/Group';

export const listMyProjects = async (req: Request, res: Response) => {
    const userId = (req as any).userId;
    if (!userId) return res.status(401).json({ message: 'Utilisateur non authentifié' });

    const rows = await Project.find({ userId }).sort({ createdAt: -1 }).lean();
    return res.json({
        projects: rows.map(p => ({
            id: p._id.toString(),
            title: p.title,
            org: p.org,
            description: p.description ?? 'aucune description',
            minPeople: p.minPeople,
            maxPeople: p.maxPeople,
            createdAt: p.createdAt,
            // inviteKey non nécessaire ici, on le garde pour le détail
        })),
    });
};

export const createProject = async (req: Request, res: Response) => {
    const userId = (req as any).userId;
    if (!userId) return res.status(401).json({ message: 'Utilisateur non authentifié' });

    const { title, org, description, minPeople, maxPeople } = req.body ?? {};
    const min = Number(minPeople);
    const max = Number(maxPeople);

    if (!title?.trim()) return res.status(400).json({ message: 'title requis' });
    if (!org?.trim())   return res.status(400).json({ message: 'org requis' });
    if (!Number.isFinite(min) || min < 1) return res.status(400).json({ message: 'minPeople invalide (≥1)' });
    if (!Number.isFinite(max) || max < 1) return res.status(400).json({ message: 'maxPeople invalide (≥1)' });
    if (max < min) return res.status(400).json({ message: 'maxPeople doit être ≥ minPeople' });

    const doc = await Project.create({
        userId,
        title: title.trim(),
        org: org.trim(),
        description: (description?.trim() || null),
        minPeople: min,
        maxPeople: max,
    });

    return res.status(201).json({
        project: {
            id: doc._id.toString(),
            title: doc.title,
            org: doc.org,
            description: doc.description ?? 'aucune description',
            minPeople: doc.minPeople,
            maxPeople: doc.maxPeople,
            inviteSlug: (doc as any).inviteSlug, // si tu l’as encore dans le modèle
            inviteKey: (doc as any).inviteKey,    // ✅ doc, pas project
            createdAt: doc.createdAt,
        },
    });
};

export const getProjectById = async (req: Request, res: Response) => {
    const userId = (req as any).userId;
    const { id } = req.params;

    if (!userId) return res.status(401).json({ message: 'Utilisateur non authentifié' });

    const project = await Project.findOne({ _id: id, userId }).lean();
    if (!project) return res.status(404).json({ message: 'Projet introuvable' });

    const groups = await Group.find({ projectId: project._id }).sort({ number: 1 }).lean();

    return res.json({
        project: {
            id: project._id.toString(),
            title: project.title,
            org: project.org,
            description: project.description ?? 'aucune description',
            minPeople: project.minPeople,
            maxPeople: project.maxPeople,
            inviteSlug: (project as any).inviteSlug,
            inviteKey: (project as any).inviteKey, // ✅ project, pas doc
            createdAt: project.createdAt,
        },
        groups: groups.map(g => ({
            id: g._id.toString(),
            number: g.number,
            participants: g.participants.map(p => ({ username: p.username, email: p.email })),
        })),
    });
};

export const deleteProject = async (req: Request, res: Response) => {
    const userId = (req as any).userId;
    const { id } = req.params;

    if (!userId) return res.status(401).json({ message: 'Utilisateur non authentifié' });

    // 1) Vérifier que le projet existe et appartient bien à l’utilisateur
    const project = await Project.findOne({ _id: id, userId });
    if (!project) return res.status(404).json({ message: 'Projet introuvable' });

    // 2) Supprimer les groupes liés
    await Group.deleteMany({ projectId: project._id });

    // 3) Supprimer le projet
    await Project.deleteOne({ _id: project._id });

    // 4) Répondre (204 = No Content)
    return res.status(204).send();
};