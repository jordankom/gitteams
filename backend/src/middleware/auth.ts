import express from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import User from "../models/User"; // <= assure-toi que le fichier s'appelle bien User.ts

const JWT_SECRET = env.JWT_SECRET;

const protect = async (
    req: express.Request & { user?: any; userId?: string; username?: string },
    res: express.Response,
    next: express.NextFunction
) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, JWT_SECRET) as {
            sub?: string; id?: string; name?: string; username?: string;
        };

        const userId = decoded.sub || decoded.id;
        if (!userId) return res.status(401).json({ message: "Invalid token payload" });

        const user = await User.findById(userId);
        if (!user) return res.status(401).json({ message: "User not found" });

        req.user = user;
        req.userId = user.id;
        req.username = decoded.name || decoded.username || user.name;
        next();
    } catch {
        return res.status(401).json({ message: "Invalid token" });
    }
};

export default protect; // ✅ export DEFAULT
