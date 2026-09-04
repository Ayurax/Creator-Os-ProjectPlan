import { Router } from 'express';
import { paymentController } from '../controllers/payment.controller';
import { authMiddleware } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';

const router = Router();

router.use(authMiddleware);

router.get('/', paymentController.list);
router.post('/:id/pay', requireRole('BRAND'), paymentController.pay);
router.post('/:id/refund', requireRole('BRAND'), paymentController.refund);

export default router;