import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { env } from '../config/env';

/**
 * POST /api/auth/login
 * - Vérifie nom + mot de passe
 * - Génère un JWT si OK
 * - ⚠️ N'expose jamais passwordHash ni githubToken dans la réponse
 */
export async function login(req: Request, res: Response) {
    const { name, password } = req.body as { name?: string; password?: string };

    // ✅ Validation basique d'entrée
    if (!name || !password) {
        return res.status(400).json({ message: 'Nom et mot de passe requis' });
    }

    // 🔎 Cherche l'utilisateur par son nom
    const user = await User.findOne({ name });
    if (!user) {
        return res.status(401).json({ message: 'Identifiants invalides' });
    }

    // 🔐 Compare le mot de passe saisi avec le hash en base
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
        return res.status(401).json({ message: 'Identifiants invalides' });
    }

    // 🪙 Génère le JWT (payload minimal)
    const token = jwt.sign(
        { sub: user.id, name: user.name }, // sub = subject (id utilisateur)
        env.JWT_SECRET,
        { expiresIn: '1d' } // token valable 24h
    );

    // ✅ Réponse sans informations sensibles
    return res.json({
        token,
        user: { id: user.id, name: user.name },
    });
}
