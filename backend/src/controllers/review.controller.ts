import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../config/prisma';
import { reviewRepository } from '../repositories/review.repository';
import { HttpError } from '../utils/errors';

export const reviewController = {
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const campaignId = Number(req.body.campaignId);
      const creatorId = Number(req.body.creatorId);
      const rating = Number(req.body.rating);
      const comment = typeof req.body.comment === 'string' ? req.body.comment.trim() : undefined;
      if (!Number.isInteger(campaignId) || campaignId <= 0 || !Number.isInteger(creatorId) || creatorId <= 0 || !Number.isInteger(rating) || rating < 1 || rating > 5) {
        throw new HttpError(400, 'campaignId, creatorId and rating are required');
      }
      if (req.user?.role !== 'BRAND') throw new HttpError(403, 'Only brands can create reviews');
      const brand = await prisma.brand.findUnique({ where: { userId: req.user.userId } });
      const campaign = await prisma.campaign.findUnique({
        where: { id: campaignId },
        include: { collaborationRequests: { where: { creatorId, status: 'ACCEPTED' } } },
      });
      if (!brand || !campaign || campaign.brandId !== brand.id || campaign.collaborationRequests.length === 0) {
        throw new HttpError(403, 'You can only review creators from your accepted collaborations');
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
      if (!Number.isInteger(campaignId) || campaignId <= 0) throw new HttpError(400, 'Invalid campaign id');
      await assertCampaignAccess(campaignId, req.user!);
      const data = await reviewRepository.listByCampaign(campaignId);
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },
  async listByCreator(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const creatorId = Number(req.params.creatorId);
      if (!Number.isInteger(creatorId) || creatorId <= 0) throw new HttpError(400, 'Invalid creator id');
      await assertCreatorAccess(creatorId, req.user!);
      const data = await reviewRepository.listByCreator(creatorId);
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },
  async listAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (req.user?.role === 'BRAND') {
        const brand = await prisma.brand.findUnique({ where: { userId: req.user.userId } });
        if (!brand) throw new HttpError(404, 'Brand profile not found');
        const data = await prisma.review.findMany({ where: { campaign: { brandId: brand.id } } });
        return res.json({ success: true, data });
      }
      if (req.user?.role === 'CREATOR') {
        const creator = await prisma.creator.findUnique({ where: { userId: req.user.userId } });
        if (!creator) throw new HttpError(404, 'Creator profile not found');
        const data = await reviewRepository.listByCreator(creator.id);
        return res.json({ success: true, data });
      }
      throw new HttpError(403, 'Forbidden');
    } catch (e) {
      next(e);
    }
  },
};

async function assertCampaignAccess(campaignId: number, user: { userId: number; role: string }) {
  const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } });
  if (!campaign) throw new HttpError(404, 'Campaign not found');
  if (user.role === 'BRAND') {
    const brand = await prisma.brand.findUnique({ where: { userId: user.userId } });
    if (!brand || brand.id !== campaign.brandId) throw new HttpError(403, 'Forbidden');
    return;
  }
  if (user.role === 'CREATOR') {
    const creator = await prisma.creator.findUnique({ where: { userId: user.userId } });
    const linked = creator && await prisma.collaborationRequest.findFirst({ where: { campaignId, creatorId: creator.id } });
    if (!linked) throw new HttpError(403, 'Forbidden');
    return;
  }
  throw new HttpError(403, 'Forbidden');
}

async function assertCreatorAccess(creatorId: number, user: { userId: number; role: string }) {
  const creator = await prisma.creator.findUnique({ where: { id: creatorId } });
  if (!creator) throw new HttpError(404, 'Creator not found');
  if (user.role === 'CREATOR') {
    if (creator.userId !== user.userId) throw new HttpError(403, 'Forbidden');
    return;
  }
  if (user.role === 'BRAND') {
    const brand = await prisma.brand.findUnique({ where: { userId: user.userId } });
    const linked = brand && await prisma.collaborationRequest.findFirst({ where: { brandId: brand.id, creatorId } });
    if (!linked) throw new HttpError(403, 'Forbidden');
    return;
  }
  throw new HttpError(403, 'Forbidden');
}