import { Router } from "express";
import { protect } from "../middleware/auth.ts";
import User from "../models/User.ts";
import { decryptToken } from "../utils/encryption.ts";

const router = Router();

router.get("/dashboard", protect, async (req, res) => {
    try {
        const user = await User.findById(req.userId).select("username githubToken").exec();
        if (!user) return res.status(404).json({ message: "User not found" });

        let githubTokenPlain = "";
        try {
            githubTokenPlain = decryptToken(user.githubToken);
        } catch (err) {
            console.error("decrypt error:", err);
        }

        return res.json({
            id: user._id,
            username: user.username,
            githubToken: githubTokenPlain,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

export default router;
