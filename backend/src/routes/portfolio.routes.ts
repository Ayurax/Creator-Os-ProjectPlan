import { Router } from 'express';
import { portfolioController } from '../controllers/portfolio.controller';
import { authMiddleware } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';

const router = Router();

router.use(authMiddleware);

router.get('/mine', requireRole('CREATOR'), portfolioController.listMine);
router.get('/creator/:creatorId', portfolioController.listByCreator);
router.post('/', requireRole('CREATOR'), portfolioController.create);
router.put('/:id', requireRole('CREATOR'), portfolioController.update);
router.delete('/:id', requireRole('CREATOR'), portfolioController.remove);

export default router;