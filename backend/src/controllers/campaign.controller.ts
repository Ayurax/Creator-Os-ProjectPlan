import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { campaignService } from '../services/campaign.service';

export const campaignController = {
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await campaignService.create(req.body, req.user!);
      res.status(201).json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },
  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await campaignService.list(req.user!);
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },
  async get(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const data = await campaignService.getById(id);
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },
  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const data = await campaignService.update(id, req.body, req.user!);
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },
  async remove(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const data = await campaignService.remove(id, req.user!);
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },
};