import { Router } from 'express';
import { campaignController } from '../controllers/campaign.controller';
import { authMiddleware } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';

const router = Router();

router.use(authMiddleware);

router.get('/', campaignController.list);
router.get('/:id', campaignController.get);
router.post('/', requireRole('BRAND'), campaignController.create);
router.put('/:id', requireRole('BRAND', 'TALENT_MANAGER'), campaignController.update);
router.delete('/:id', requireRole('BRAND'), campaignController.remove);

export default router;