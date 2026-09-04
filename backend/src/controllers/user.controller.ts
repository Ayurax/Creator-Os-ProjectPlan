import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { userService } from '../services/user.service';
import { HttpError } from '../utils/errors';

export const userController = {
  async me(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new HttpError(401, 'Unauthorized');
      const data = await userService.getProfile(req.user.userId);
      if (!data) throw new HttpError(404, 'User not found');
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },

  async updateMe(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new HttpError(401, 'Unauthorized');
      const data = await userService.updateProfile(req.user.userId, req.body);
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },
};
