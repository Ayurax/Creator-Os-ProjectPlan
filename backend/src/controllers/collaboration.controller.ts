import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { collaborationService } from '../services/collaboration.service';
import { CollaborationRequestStatus } from '../types';

export const collaborationController = {
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await collaborationService.create(req.body, req.user!);
      res.status(201).json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },
  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await collaborationService.listForUser(req.user!);
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },
  async updateStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const status = req.body.status as CollaborationRequestStatus;
      const data = await collaborationService.updateStatus(id, status, req.user!);
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },
  async accept(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const data = await collaborationService.accept(id, req.user!);
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },
  async reject(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const data = await collaborationService.reject(id, req.user!);
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },
};