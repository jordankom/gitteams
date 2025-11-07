import { Request, Response } from 'express';
import Project from '../models/Project';

console.log('DEBUG typeof Project =', typeof Project); // doit afficher "function"

export const listMyProjects = async (req: Request, res: Response) => {
    const userId = (req as any).userId;
    if (!userId) return res.status(401).json({ message: 'Utilisateur non authentifié' });

    const rows = await Project.find({  userId }).sort({ createdAt: -1 });
    return res.json({ projects: rows });
};

export const createProject = async (req: Request, res: Response) => {
    const userId = (req as any).userId;
    if (!userId) return res.status(401).json({ message: 'Utilisateur non authentifié' });

    const { title, org, description, minPeople, maxPeople } = req.body ?? {};

    // conversions sécurisées
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

    return res.status(201).json({ project: doc });
};

export const getProjectById = async (req: Request, res: Response) => {
    const userId = (req as any).userId;
    const { id } = req.params;

    if (!userId) return res.status(401).json({ message: 'Utilisateur non authentifié' });

    // Cherche le projet par _id ET userId (protection multi-comptes)
    const project = await Project.findOne({ _id: id, userId });
    if (!project) return res.status(404).json({ message: 'Projet introuvable' });

    // Placeholder groupes (à implémenter plus tard)
    const groups: any[] = [];

    return res.json({ project, groups });
};

// (Optionnel) export default si tu veux importer en bloc
export default { listMyProjects, createProject };
