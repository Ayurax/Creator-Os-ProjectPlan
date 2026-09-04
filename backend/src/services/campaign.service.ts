import prisma from '../config/prisma';
import { campaignRepository } from '../repositories/campaign.repository';
import { HttpError } from '../utils/errors';
import { CampaignStatus } from '../types';

export class CampaignService {
  async create(
    input: {
      name: string;
      description?: string;
      startDate?: Date | string;
      endDate?: Date | string;
      budget?: number;
      talentManagerId?: number;
    },
    user: { userId: number; role: string },
  ) {
    if (user.role !== 'BRAND') {
      throw new HttpError(403, 'Only brands can create campaigns');
    }
    const brand = await prisma.brand.findUnique({ where: { userId: user.userId } });
    if (!brand) {
      throw new HttpError(404, 'Brand profile not found');
    }
    return campaignRepository.create({
      brandId: brand.id,
      name: input.name,
      description: input.description,
      startDate: input.startDate ? new Date(input.startDate) : undefined,
      endDate: input.endDate ? new Date(input.endDate) : undefined,
      budget: input.budget,
      talentManagerId: input.talentManagerId,
    });
  }

  async list(_user: { userId: number; role: string }) {
    return campaignRepository.listAll();
  }

  async getById(id: number) {
    const campaign = await campaignRepository.findById(id);
    if (!campaign) {
      throw new HttpError(404, 'Campaign not found');
    }
    return campaign;
  }

  async update(
    id: number,
    data: {
      name?: string;
      description?: string;
      startDate?: Date | string;
      endDate?: Date | string;
      budget?: number;
      status?: CampaignStatus;
    },
    user: { userId: number; role: string },
  ) {
    const existing = await campaignRepository.findById(id);
    if (!existing) {
      throw new HttpError(404, 'Campaign not found');
    }
    if (user.role === 'BRAND') {
      const brand = await prisma.brand.findUnique({ where: { userId: user.userId } });
      if (!brand || brand.id !== existing.brandId) {
        throw new HttpError(403, 'Forbidden');
      }
    } else if (user.role !== 'TALENT_MANAGER') {
      throw new HttpError(403, 'Forbidden');
    }
    const { status, ...rest } = data;
    const payload: Record<string, unknown> = { ...rest };
    if (startDateKey('startDate', rest)) payload.startDate = new Date(rest.startDate as string);
    if (endDateKey('endDate', rest)) payload.endDate = new Date(rest.endDate as string);
    if (status) payload.status = status;
    return campaignRepository.update(id, payload as never);
  }

  async remove(id: number, user: { userId: number; role: string }) {
    const existing = await campaignRepository.findById(id);
    if (!existing) {
      throw new HttpError(404, 'Campaign not found');
    }
    if (user.role !== 'BRAND') {
      throw new HttpError(403, 'Forbidden');
    }
    const brand = await prisma.brand.findUnique({ where: { userId: user.userId } });
    if (!brand || brand.id !== existing.brandId) {
      throw new HttpError(403, 'Forbidden');
    }
    await campaignRepository.delete(id);
    return { success: true };
  }
}

function startDateKey(k: string, obj: Record<string, unknown>): unknown {
  return obj[k];
}
function endDateKey(k: string, obj: Record<string, unknown>): unknown {
  return obj[k];
}

export const campaignService = new CampaignService();