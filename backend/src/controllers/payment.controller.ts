import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { paymentService } from '../services/payment.service';

export const paymentController = {
  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await paymentService.listForUser(req.user!);
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },
  async pay(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const data = await paymentService.markPaid(id, req.user!);
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },
  async refund(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const data = await paymentService.refund(id, req.user!);
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },
};