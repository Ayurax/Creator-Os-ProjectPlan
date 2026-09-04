import { Router } from 'express';
import { brandController } from '../controllers/brand.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.get('/:id', brandController.getById);

export default router;
