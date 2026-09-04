import prisma from '../config/prisma';

export class ContractRepository {
  create(data: {
    collaborationRequestId: number;
    brandId: number;
    creatorId: number;
    talentManagerId?: number;
    terms?: string;
    startDate?: Date;
    endDate?: Date;
    status?: string;
    campaignId?: number;
  }) {
    return prisma.contract.create({ data });
  }
  findById(id: number) {
    return prisma.contract.findUnique({
      where: { id },
      include: {
        collaborationRequest: true,
        brand: { include: { user: true } },
        creator: { include: { user: true } },
        talentManager: true,
        campaign: true,
        tasks: true,
        payments: true,
      },
    });
  }
  findByCollaborationRequestId(collaborationRequestId: number) {
    return prisma.contract.findUnique({ where: { collaborationRequestId } });
  }
  listForBrand(brandId: number) {
    return prisma.contract.findMany({
      where: { brandId },
      include: { campaign: true, creator: true },
      orderBy: { createdAt: 'desc' },
    });
  }
  listForCreator(creatorId: number) {
    return prisma.contract.findMany({
      where: { creatorId },
      include: { campaign: true, brand: true },
      orderBy: { createdAt: 'desc' },
    });
  }
  listForTalentManager(talentManagerId: number) {
    return prisma.contract.findMany({
      where: { talentManagerId },
      include: { campaign: true },
      orderBy: { createdAt: 'desc' },
    });
  }
  listForFreelancer(freelancerId: number) {
    return prisma.contract.findMany({
      where: { tasks: { some: { assigneeId: freelancerId } } },
      include: { campaign: true },
      orderBy: { createdAt: 'desc' },
    });
  }
  updateStatus(id: number, status: string) {
    return prisma.contract.update({ where: { id }, data: { status } });
  }
}

export const contractRepository = new ContractRepository();