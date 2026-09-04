import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { contractService } from '../services/contract.service';
import { ContractStatus } from '../types';

export const contractController = {
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await contractService.create(req.body, req.user!);
      res.status(201).json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },
  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await contractService.listForUser(req.user!);
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },
  async get(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const data = await contractService.getById(id, req.user!);
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },
  async updateStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const status = req.body.status as ContractStatus;
      const data = await contractService.updateStatus(id, status, req.user!);
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },
};