import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { brandService } from '../services/brand.service';
import { HttpError } from '../utils/errors';

export const brandController = {
  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const data = await brandService.getById(id);
      if (!data) throw new HttpError(404, 'Brand not found');
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },
};
