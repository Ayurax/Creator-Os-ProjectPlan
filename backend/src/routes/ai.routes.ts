import { Router } from 'express';
import { aiController } from '../controllers/ai.controller';
import { authMiddleware } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';

const router = Router();

router.use(authMiddleware);

router.post('/recommend-creators', requireRole('BRAND', 'TALENT_MANAGER'), aiController.recommendCreators);
router.post('/recommend-brands', requireRole('CREATOR'), aiController.recommendBrands);
router.post('/estimate-price', aiController.estimatePrice);
router.post('/generate-email', requireRole('BRAND', 'TALENT_MANAGER'), aiController.generateEmail);
router.post('/analytics-summary', requireRole('BRAND', 'CREATOR', 'TALENT_MANAGER'), aiController.summarizeAnalytics);
router.post('/content-plan', aiController.generateContentPlan);
router.post('/campaign-summary', requireRole('BRAND', 'CREATOR', 'TALENT_MANAGER'), aiController.summarizeCampaign);
router.post('/chat', aiController.chat);

export default router;