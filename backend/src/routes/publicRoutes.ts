import { Router } from "express";
import { getProjectPublic, createGroupPublic } from "../controllers/publicController";

const router = Router();


console.log('getProjectPublic is function?', typeof getProjectPublic);
console.log('createGroupPublic is function?', typeof createGroupPublic);

// ✅ Pas de query string, clé dans le chemin
router.get("/projects/:id/:key", getProjectPublic);
router.post("/projects/:id/:key/groups", createGroupPublic);

export default router;
