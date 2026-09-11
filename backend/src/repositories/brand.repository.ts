import prisma from '../config/prisma';

export class BrandRepository {
  findByUserId(userId: number) {
    return prisma.brand.findUnique({ where: { userId } });
  }
  findById(id: number) {
    return prisma.brand.findUnique({
      where: { id },
      include: { user: { select: { id: true, email: true, role: true, createdAt: true, updatedAt: true } } },
    });
  }
  create(data: { userId: number; companyName: string; industry?: string; description?: string }) {
    return prisma.brand.create({ data });
  }
  update(id: number, data: Partial<{ companyName: string; industry: string; description: string }>) {
    return prisma.brand.update({ where: { id }, data });
  }
}

export const brandRepository = new BrandRepository();