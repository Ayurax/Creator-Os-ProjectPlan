import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { portfolioRepository } from '../repositories/portfolio.repository';
import prisma from '../config/prisma';
import { HttpError } from '../utils/errors';

export const portfolioController = {
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (req.user!.role !== 'CREATOR') {
        throw new HttpError(403, 'Only creators can add portfolio items');
      }
      const creator = await prisma.creator.findUnique({ where: { userId: req.user!.userId } });
      if (!creator) throw new HttpError(404, 'Creator profile not found');
      const { title, description, mediaUrl } = req.body;
      if (!title) throw new HttpError(400, 'title is required');
      const data = await portfolioRepository.create({ creatorId: creator.id, title, description, mediaUrl });
      res.status(201).json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },
  async listByCreator(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const creatorId = Number(req.params.creatorId);
      const data = await portfolioRepository.listByCreator(creatorId);
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },
  async listMine(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (req.user!.role !== 'CREATOR') throw new HttpError(403, 'Forbidden');
      const creator = await prisma.creator.findUnique({ where: { userId: req.user!.userId } });
      if (!creator) throw new HttpError(404, 'Creator profile not found');
      const data = await portfolioRepository.listByCreator(creator.id);
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },
};