import { Router } from 'express';
import { getProjectPublic, createGroupPublic } from '../controllers/publicController';

const router = Router();

// Pas d'auth ici
router.get('/projects/:slug', getProjectPublic);
router.post('/projects/:slug/groups', createGroupPublic);

export default router;
