import { Router } from 'express';
import { contractController } from '../controllers/contract.controller';
import { authMiddleware } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';

const router = Router();

router.use(authMiddleware);

router.get('/', contractController.list);
router.get('/:id', contractController.get);
router.post('/', requireRole('BRAND'), contractController.create);
router.patch('/:id/status', requireRole('BRAND', 'CREATOR', 'TALENT_MANAGER'), contractController.updateStatus);

export default router;