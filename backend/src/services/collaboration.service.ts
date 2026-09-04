import prisma from '../config/prisma';
import { collaborationRequestRepository } from '../repositories/collaboration.repository';
import { notificationRepository } from '../repositories/notification.repository';
import { HttpError } from '../utils/errors';
import { CollaborationRequestStatus } from '../types';

export class CollaborationService {
  async create(
    input: { campaignId: number; creatorId: number; talentManagerId?: number },
    user: { userId: number; role: string },
  ) {
    const campaignId = Number(input.campaignId);
    const creatorId = Number(input.creatorId);

    const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } });
    if (!campaign) {
      throw new HttpError(404, 'Campaign not found');
    }

    let brandId: number | undefined;
    if (user.role === 'BRAND') {
      const brand = await prisma.brand.findUnique({ where: { userId: user.userId } });
      if (!brand) throw new HttpError(403, 'Brand profile not found');
      if (brand.id !== campaign.brandId) throw new HttpError(403, 'Forbidden');
      brandId = brand.id;
    } else if (user.role === 'TALENT_MANAGER') {
      const tm = await prisma.talentManager.findUnique({ where: { userId: user.userId } });
      if (!tm) throw new HttpError(403, 'Talent manager profile not found');
      input = { ...input, talentManagerId: tm.id };
    } else {
      throw new HttpError(403, 'Forbidden');
    }

    const creator = await prisma.creator.findUnique({ where: { id: creatorId } });
    if (!creator) throw new HttpError(404, 'Creator not found');

    const cr = await collaborationRequestRepository.create({
      campaignId: campaign.id,
      brandId,
      creatorId: creator.id,
      talentManagerId: input.talentManagerId,
    });

    await notificationRepository.create({
      userId: creator.userId,
      type: 'COLLABORATION_REQUEST',
      content: `You have a new collaboration request for campaign "${campaign.name}"`,
    });

    return cr;
  }

  async listForUser(user: { userId: number; role: string }) {
    if (user.role === 'BRAND') {
      const brand = await prisma.brand.findUnique({ where: { userId: user.userId } });
      if (!brand) throw new HttpError(404, 'Brand profile not found');
      return collaborationRequestRepository.listForBrand(brand.id);
    }
    if (user.role === 'CREATOR') {
      const creator = await prisma.creator.findUnique({ where: { userId: user.userId } });
      if (!creator) throw new HttpError(404, 'Creator profile not found');
      return collaborationRequestRepository.listForCreator(creator.id);
    }
    if (user.role === 'TALENT_MANAGER') {
      const tm = await prisma.talentManager.findUnique({ where: { userId: user.userId } });
      if (!tm) throw new HttpError(404, 'Talent manager profile not found');
      return collaborationRequestRepository.listForTalentManager(tm.id);
    }
    throw new HttpError(403, 'Forbidden');
  }

  async updateStatus(
    id: number,
    status: CollaborationRequestStatus,
    user: { userId: number; role: string },
  ) {
    const existing = await collaborationRequestRepository.findById(id);
    if (!existing) throw new HttpError(404, 'Collaboration request not found');

    if (user.role === 'CREATOR') {
      const creator = await prisma.creator.findUnique({ where: { userId: user.userId } });
      if (!creator || creator.id !== existing.creatorId) throw new HttpError(403, 'Forbidden');
    } else if (user.role === 'BRAND') {
      const brand = await prisma.brand.findUnique({ where: { userId: user.userId } });
      if (!brand || brand.id !== existing.brandId) throw new HttpError(403, 'Forbidden');
    } else {
      throw new HttpError(403, 'Forbidden');
    }

    return collaborationRequestRepository.updateStatus(id, status);
  }

  async accept(id: number, user: { userId: number; role: string }) {
    return this.updateStatus(id, 'ACCEPTED', user);
  }

  async reject(id: number, user: { userId: number; role: string }) {
    return this.updateStatus(id, 'REJECTED', user);
  }
}

export const collaborationService = new CollaborationService();