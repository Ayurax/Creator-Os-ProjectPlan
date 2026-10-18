import { Router } from 'express';
import { creatorController } from '../controllers/creator.controller';
import { authMiddleware } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';

const router = Router();

router.use(authMiddleware);

router.get('/', requireRole('BRAND', 'FREELANCER', 'TALENT_MANAGER'), creatorController.list);
router.get('/:id', requireRole('BRAND', 'FREELANCER', 'TALENT_MANAGER'), creatorController.getById);
router.get('/:id/portfolio', requireRole('BRAND', 'FREELANCER', 'TALENT_MANAGER'), creatorController.getPortfolio);

export default router;
