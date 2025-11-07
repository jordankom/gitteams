import { Router } from 'express';
import protect from '../middleware/auth';                       // ✅ DEFAULT import
import { listMyProjects, createProject, getProjectById } from '../controllers/projectController'; // ✅ NAMED imports

const router = Router();

console.log('protect is function?', typeof protect);                 // doit afficher 'function'
console.log('listMyProjects is function?', typeof listMyProjects);   // doit afficher 'function'
console.log('createProject is function?', typeof createProject);     // doit afficher 'function'

router.get('/', protect, listMyProjects);
router.post('/', protect, createProject);
router.get('/:id', protect, getProjectById);
export default router;
