import { Request, Response } from 'express';
import Project from '../models/Project';
import Group from '../models/Group';

export async function getProjectPublic(req: Request, res: Response) {
    const { id, key } = req.params;           // ✅ ICI (pas req.query)
    if (!id || !key) return res.status(400).json({ message: 'clé secrète manquante' });

    const project = await Project.findOne({ _id: id, inviteKey: key }).lean();
    if (!project) return res.status(404).json({ message: 'Projet introuvable ou clé invalide' });
    //console.log('PUBLIC GET params =>', req.params);

    return res.json({
        project: {
            id: project._id.toString(),
            title: project.title,
            org: project.org,
            description: project.description ?? 'aucune description',
            minPeople: project.minPeople,
            maxPeople: project.maxPeople,
        },
    });
}

export async function createGroupPublic(req: Request, res: Response) {
    const { id, key } = req.params;           // ✅ ICI aussi
    if (!id || !key) return res.status(400).json({ message: 'clé secrète manquante' });

    const project = await Project.findOne({ _id: id, inviteKey: key });
    if (!project) return res.status(404).json({ message: 'Projet introuvable ou clé invalide' });

    const { participants = [] } = req.body ?? {};
    // … validations et création du groupe …
    const last = await Group.findOne({ projectId: project._id }).sort({ number: -1 }).lean();
    const nextNumber = (last?.number ?? 0) + 1;

    const group = await Group.create({
        projectId: project._id,
        number: nextNumber,
        participants,
    });

    return res.status(201).json({
        group: {
            id: group._id.toString(),
            number: group.number,
        },
    });
}
