import { Router } from 'express';
import protect from '../middleware/auth';              // ⬅️ export default OU
// import { protect } from '../middleware/auth';       //     si tu préfères le named export (dans ce cas ajuste l’export)

import { getMyGithubOrgs } from '../controllers/githubController';

const router = Router();

// 🔐 protégé par JWT
router.get('/orgs', protect, getMyGithubOrgs);

export default router;
