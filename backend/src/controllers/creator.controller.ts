import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { creatorService } from '../services/creator.service';
import { HttpError } from '../utils/errors';

export const creatorController = {
  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const niche = typeof req.query.niche === 'string' ? req.query.niche : undefined;
      const minFollowers = req.query.minFollowers ? Number(req.query.minFollowers) : undefined;
      const data = await creatorService.list({ niche, minFollowers });
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const data = await creatorService.getById(id);
      if (!data) throw new HttpError(404, 'Creator not found');
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },

  async getPortfolio(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const creatorId = Number(req.params.id);
      const data = await creatorService.getPortfolio(creatorId);
      if (!data) throw new HttpError(404, 'Creator not found');
      res.json({ success: true, data: data.portfolio || [] });
    } catch (e) {
      next(e);
    }
  },
};
