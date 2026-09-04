import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../config/prisma';
import { reviewRepository } from '../repositories/review.repository';
import { HttpError } from '../utils/errors';

export const reviewController = {
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { campaignId, creatorId, rating, comment } = req.body;
      if (!campaignId || !creatorId || rating === undefined) {
        throw new HttpError(400, 'campaignId, creatorId and rating are required');
      }
      const data = await reviewRepository.create({ campaignId, creatorId, rating, comment });
      res.status(201).json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },
  async listByCampaign(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const campaignId = Number(req.params.campaignId);
      const data = await reviewRepository.listByCampaign(campaignId);
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },
  async listByCreator(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const creatorId = Number(req.params.creatorId);
      const data = await reviewRepository.listByCreator(creatorId);
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },
  async listAll(_req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await reviewRepository.listAll();
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },
};