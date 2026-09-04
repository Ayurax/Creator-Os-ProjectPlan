import { Router } from 'express';
import { creatorController } from '../controllers/creator.controller';
import { portfolioController } from '../controllers/portfolio.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.get('/', creatorController.list);
router.get('/:id', creatorController.getById);
router.get('/:id/portfolio', creatorController.getPortfolio);
router.post('/:id/portfolio', portfolioController.create);

export default router;
