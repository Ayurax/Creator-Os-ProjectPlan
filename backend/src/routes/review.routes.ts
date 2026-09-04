import { Router } from 'express';
import { reviewController } from '../controllers/review.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.get('/', reviewController.listAll);
router.get('/campaign/:campaignId', reviewController.listByCampaign);
router.get('/creator/:creatorId', reviewController.listByCreator);
router.post('/', reviewController.create);

export default router;