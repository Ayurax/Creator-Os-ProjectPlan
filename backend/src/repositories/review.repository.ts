import prisma from '../config/prisma';

export class ReviewRepository {
  create(data: { campaignId: number; creatorId: number; rating: number; comment?: string }) {
    return prisma.review.create({ data });
  }
  findById(id: number) {
    return prisma.review.findUnique({
      where: { id },
      include: {
        campaign: true,
        creator: {
          include: {
            user: { select: { id: true, email: true, role: true, createdAt: true, updatedAt: true } },
          },
        },
      },
    });
  }
  listByCampaign(campaignId: number) {
    return prisma.review.findMany({
      where: { campaignId },
      include: {
        creator: {
          include: {
            user: { select: { id: true, email: true, role: true, createdAt: true, updatedAt: true } },
          },
        },
      },
    });
  }
  listByCreator(creatorId: number) {
    return prisma.review.findMany({ where: { creatorId }, include: { campaign: true } });
  }
  listAll() {
    return prisma.review.findMany({
      include: {
        campaign: true,
        creator: {
          include: {
            user: { select: { id: true, email: true, role: true, createdAt: true, updatedAt: true } },
          },
        },
      },
    });
  }
}

export const reviewRepository = new ReviewRepository();