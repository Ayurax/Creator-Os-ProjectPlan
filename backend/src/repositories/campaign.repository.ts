import prisma from '../config/prisma';

export class CampaignRepository {
  create(data: {
    brandId: number;
    name: string;
    description?: string;
    startDate?: Date;
    endDate?: Date;
    budget?: number;
    talentManagerId?: number;
  }) {
    return prisma.campaign.create({ data });
  }
  findById(id: number) {
    return prisma.campaign.findUnique({
      where: { id },
      include: {
        brand: {
          include: { user: { select: { id: true, email: true, role: true, createdAt: true, updatedAt: true } } },
        },
        collaborationRequests: true,
      },
    });
  }
  listByBrand(brandId: number) {
    return prisma.campaign.findMany({
      where: { brandId },
      include: { brand: true },
      orderBy: { createdAt: 'desc' },
    });
  }
  listAll() {
    return prisma.campaign.findMany({ include: { brand: true }, orderBy: { createdAt: 'desc' } });
  }
  update(
    id: number,
    data: Partial<{
      name: string;
      description: string;
      startDate: Date;
      endDate: Date;
      budget: number;
      talentManagerId: number;
    }>,
  ) {
    return prisma.campaign.update({ where: { id }, data });
  }
  updateStatus(id: number, status: string) {
    return prisma.campaign.update({ where: { id }, data: { status } });
  }
  delete(id: number) {
    return prisma.campaign.delete({ where: { id } });
  }
}

export const campaignRepository = new CampaignRepository();