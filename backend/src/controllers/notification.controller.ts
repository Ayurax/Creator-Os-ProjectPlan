import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { notificationRepository } from '../repositories/notification.repository';
import { HttpError } from '../utils/errors';

export const notificationController = {
  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await notificationRepository.listForUser(req.user!.userId);
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },
  async markRead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const n = await notificationRepository.findById(id);
      if (!n) throw new HttpError(404, 'Notification not found');
      if (n.userId !== req.user!.userId) throw new HttpError(403, 'Forbidden');
      const data = await notificationRepository.markRead(id);
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },
};