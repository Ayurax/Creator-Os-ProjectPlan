import prisma from '../config/prisma';

export class CollaborationRequestRepository {
  create(data: {
    campaignId: number;
    brandId?: number;
    creatorId: number;
    talentManagerId?: number;
    status?: string;
  }) {
    return prisma.collaborationRequest.create({ data });
  }
  findById(id: number) {
    return prisma.collaborationRequest.findUnique({
      where: { id },
      include: {
        campaign: true,
        brand: true,
        creator: {
          include: {
            user: { select: { id: true, email: true, role: true, createdAt: true, updatedAt: true } },
          },
        },
        talentManager: true,
        contract: true,
      },
    });
  }
  listForBrand(brandId: number) {
    return prisma.collaborationRequest.findMany({
      where: { brandId },
      include: {
        campaign: true,
        creator: {
          include: {
            user: { select: { id: true, email: true, role: true, createdAt: true, updatedAt: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
  listForCreator(creatorId: number) {
    return prisma.collaborationRequest.findMany({
      where: { creatorId },
      include: { campaign: true, brand: true },
      orderBy: { createdAt: 'desc' },
    });
  }
  listForTalentManager(talentManagerId: number) {
    return prisma.collaborationRequest.findMany({
      where: { talentManagerId },
      include: {
        campaign: true,
        creator: {
          include: {
            user: { select: { id: true, email: true, role: true, createdAt: true, updatedAt: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
  updateStatus(id: number, status: string) {
    return prisma.collaborationRequest.update({ where: { id }, data: { status } });
  }
}

export const collaborationRequestRepository = new CollaborationRequestRepository();