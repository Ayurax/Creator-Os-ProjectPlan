import { Router } from 'express';
import { taskController } from '../controllers/task.controller';
import { authMiddleware } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';

const router = Router();

router.use(authMiddleware);

router.get('/', taskController.list);
router.post('/', requireRole('BRAND', 'TALENT_MANAGER'), taskController.create);
router.patch('/:id', requireRole('BRAND', 'TALENT_MANAGER', 'FREELANCER'), taskController.update);
router.post('/:id/deliverables', requireRole('FREELANCER'), taskController.addDeliverable);

export default router;