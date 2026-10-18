import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { taskService } from '../services/task.service';
import { TaskStatus } from '../types';
import { HttpError } from '../utils/errors';

export const taskController = {
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await taskService.create(req.body, req.user!);
      res.status(201).json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },
  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await taskService.listForUser(req.user!);
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },
  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id <= 0) throw new HttpError(400, 'Invalid task id');
      const data: { status?: TaskStatus; assigneeId?: number } = {};
      const allowed: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'DONE'];
      if (req.body.status) {
        if (!allowed.includes(req.body.status as TaskStatus)) throw new HttpError(400, 'Invalid task status');
        data.status = req.body.status;
      }
      if (req.body.assigneeId !== undefined) data.assigneeId = req.body.assigneeId;
      const result = await taskService.update(id, data, req.user!);
      res.json({ success: true, data: result });
    } catch (e) {
      next(e);
    }
  },
  async addDeliverable(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id <= 0) throw new HttpError(400, 'Invalid task id');
      const result = await taskService.addDeliverable(id, req.body, req.user!);
      res.status(201).json({ success: true, data: result });
    } catch (e) {
      next(e);
    }
  },
};