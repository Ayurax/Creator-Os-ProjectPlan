import prisma from '../config/prisma';

export class PortfolioRepository {
  create(data: { creatorId: number; title: string; description?: string; mediaUrl?: string }) {
    return prisma.portfolio.create({ data });
  }
  findById(id: number) {
    return prisma.portfolio.findUnique({ where: { id } });
  }
  update(id: number, data: { title?: string; description?: string; mediaUrl?: string | null }) {
    return prisma.portfolio.update({ where: { id }, data });
  }
  delete(id: number) {
    return prisma.portfolio.delete({ where: { id } });
  }
  listByCreator(creatorId: number) {
    return prisma.portfolio.findMany({ where: { creatorId }, orderBy: { createdAt: 'desc' } });
  }
}

export const portfolioRepository = new PortfolioRepository();
