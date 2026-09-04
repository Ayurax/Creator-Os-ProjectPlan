import { Router } from 'express';
import { collaborationController } from '../controllers/collaboration.controller';
import { authMiddleware } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';

const router = Router();

router.use(authMiddleware);

router.get('/', collaborationController.list);
router.post('/', requireRole('BRAND', 'TALENT_MANAGER'), collaborationController.create);
router.patch('/:id/status', requireRole('BRAND', 'CREATOR'), collaborationController.updateStatus);
router.patch('/:id/accept', requireRole('CREATOR'), collaborationController.accept);
router.patch('/:id/reject', requireRole('CREATOR'), collaborationController.reject);

export default router;