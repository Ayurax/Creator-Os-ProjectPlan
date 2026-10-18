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
      const trimmedTitle = typeof title === 'string' ? title.trim() : '';
      if (!trimmedTitle) throw new HttpError(400, 'Title is required');
      if (mediaUrl) {
        try {
          const url = new URL(mediaUrl);
          if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Unsupported protocol');
        } catch {
          throw new HttpError(400, 'Enter a valid media URL');
        }
      }
      const data = await portfolioRepository.create({ creatorId: creator.id, title: trimmedTitle, description, mediaUrl });
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
  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const portfolio = await getOwnedPortfolio(req);
      const { title, description, mediaUrl } = req.body;
      const trimmedTitle = typeof title === 'string' ? title.trim() : '';
      if (!trimmedTitle) throw new HttpError(400, 'Title is required');
      validateMediaUrl(mediaUrl);
      const data = await portfolioRepository.update(portfolio.id, {
        title: trimmedTitle,
        description: typeof description === 'string' ? description.trim() : undefined,
        mediaUrl: typeof mediaUrl === 'string' && mediaUrl.trim() ? mediaUrl.trim() : undefined,
      });
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },
  async remove(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const portfolio = await getOwnedPortfolio(req);
      await portfolioRepository.delete(portfolio.id);
      res.json({ success: true });
    } catch (e) {
      next(e);
    }
  },
};

async function getOwnedPortfolio(req: AuthRequest) {
  if (req.user!.role !== 'CREATOR') throw new HttpError(403, 'Only creators can manage portfolio items');
  const creator = await prisma.creator.findUnique({ where: { userId: req.user!.userId } });
  if (!creator) throw new HttpError(404, 'Creator profile not found');
  const portfolio = await portfolioRepository.findById(Number(req.params.id));
  if (!portfolio) throw new HttpError(404, 'Portfolio item not found');
  if (portfolio.creatorId !== creator.id) throw new HttpError(403, 'Forbidden');
  return portfolio;
}

function validateMediaUrl(mediaUrl: unknown) {
  if (!mediaUrl) return;
  if (typeof mediaUrl !== 'string') throw new HttpError(400, 'Enter a valid media URL');
  try {
    const url = new URL(mediaUrl);
    if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Unsupported protocol');
  } catch {
    throw new HttpError(400, 'Enter a valid media URL');
  }
}