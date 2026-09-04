import prisma from '../config/prisma';

export class PortfolioRepository {
  create(data: { creatorId: number; title: string; description?: string; mediaUrl?: string }) {
    return prisma.portfolio.create({ data });
  }
  findById(id: number) {
    return prisma.portfolio.findUnique({ where: { id } });
  }
  listByCreator(creatorId: number) {
    return prisma.portfolio.findMany({ where: { creatorId }, orderBy: { createdAt: 'desc' } });
  }
}

export const portfolioRepository = new PortfolioRepository();