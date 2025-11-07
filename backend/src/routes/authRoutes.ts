import { Router } from 'express';
import { login } from '../controllers/authController';

const router = Router();

// Route de connexion
router.post('/login', login);

export default router;
