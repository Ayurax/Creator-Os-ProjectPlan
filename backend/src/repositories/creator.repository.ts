import prisma from '../config/prisma';

export class CreatorRepository {
  findByUserId(userId: number) {
    return prisma.creator.findUnique({ where: { userId } });
  }
  findById(id: number) {
    return prisma.creator.findUnique({ where: { id }, include: { user: true, portfolio: true } });
  }
  create(data: { userId: number; bio?: string; niche?: string; followers?: number; engagementRate?: number }) {
    return prisma.creator.create({ data });
  }
  update(id: number, data: Partial<{ bio: string; niche: string; followers: number; engagementRate: number }>) {
    return prisma.creator.update({ where: { id }, data });
  }
  list(filters: { niche?: string; minFollowers?: number }) {
    return prisma.creator.findMany({
      where: {
        niche: filters.niche,
        followers: filters.minFollowers ? { gte: filters.minFollowers } : undefined,
      },
      include: { user: true, portfolio: true },
    });
  }
}

export const creatorRepository = new CreatorRepository();