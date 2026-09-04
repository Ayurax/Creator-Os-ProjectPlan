import prisma from '../config/prisma';
import { contractRepository } from '../repositories/contract.repository';
import { collaborationRequestRepository } from '../repositories/collaboration.repository';
import { HttpError } from '../utils/errors';
import { ContractStatus } from '../types';

export class ContractService {
  async create(
    input: { collaborationRequestId: number; terms?: string; startDate?: Date | string; endDate?: Date | string },
    user: { userId: number; role: string },
  ) {
    if (user.role !== 'BRAND') {
      throw new HttpError(403, 'Only brands can create contracts');
    }
    const brand = await prisma.brand.findUnique({ where: { userId: user.userId } });
    if (!brand) throw new HttpError(404, 'Brand profile not found');

    const cr = await collaborationRequestRepository.findById(input.collaborationRequestId);
    if (!cr) throw new HttpError(404, 'Collaboration request not found');
    if (cr.brandId !== brand.id) throw new HttpError(403, 'Forbidden');

    const existing = await contractRepository.findByCollaborationRequestId(cr.id);
    if (existing) throw new HttpError(409, 'Contract already exists');

    return contractRepository.create({
      collaborationRequestId: cr.id,
      brandId: brand.id,
      creatorId: cr.creatorId,
      talentManagerId: cr.talentManagerId ?? undefined,
      terms: input.terms,
      startDate: input.startDate ? new Date(input.startDate) : undefined,
      endDate: input.endDate ? new Date(input.endDate) : undefined,
      campaignId: cr.campaignId,
    });
  }

  async listForUser(user: { userId: number; role: string }) {
    if (user.role === 'BRAND') {
      const brand = await prisma.brand.findUnique({ where: { userId: user.userId } });
      if (!brand) throw new HttpError(404, 'Brand profile not found');
      return contractRepository.listForBrand(brand.id);
    }
    if (user.role === 'CREATOR') {
      const creator = await prisma.creator.findUnique({ where: { userId: user.userId } });
      if (!creator) throw new HttpError(404, 'Creator profile not found');
      return contractRepository.listForCreator(creator.id);
    }
    if (user.role === 'TALENT_MANAGER') {
      const tm = await prisma.talentManager.findUnique({ where: { userId: user.userId } });
      if (!tm) throw new HttpError(404, 'Talent manager profile not found');
      return contractRepository.listForTalentManager(tm.id);
    }
    if (user.role === 'FREELANCER') {
      const fl = await prisma.freelancer.findUnique({ where: { userId: user.userId } });
      if (!fl) throw new HttpError(404, 'Freelancer profile not found');
      return contractRepository.listForFreelancer(fl.id);
    }
    throw new HttpError(403, 'Forbidden');
  }

  async getById(id: number, _user: { userId: number; role: string }) {
    const contract = await contractRepository.findById(id);
    if (!contract) throw new HttpError(404, 'Contract not found');
    return contract;
  }

  async updateStatus(id: number, status: ContractStatus, user: { userId: number; role: string }) {
    const contract = await contractRepository.findById(id);
    if (!contract) throw new HttpError(404, 'Contract not found');

    if (user.role === 'BRAND') {
      const brand = await prisma.brand.findUnique({ where: { userId: user.userId } });
      if (!brand || brand.id !== contract.brandId) throw new HttpError(403, 'Forbidden');
    } else if (user.role !== 'TALENT_MANAGER' && user.role !== 'CREATOR') {
      throw new HttpError(403, 'Forbidden');
    }
    return contractRepository.updateStatus(id, status);
  }
}

export const contractService = new ContractService();