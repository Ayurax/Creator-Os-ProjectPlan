import prisma from '../config/prisma';

export class PaymentRepository {
  findById(id: number) {
    return prisma.payment.findUnique({ where: { id }, include: { contract: true } });
  }
  listForBrand(brandId: number) {
    return prisma.payment.findMany({
      where: { contract: { brandId } },
      include: { contract: true },
      orderBy: { createdAt: 'desc' },
    });
  }
  listForCreator(creatorId: number) {
    return prisma.payment.findMany({
      where: { contract: { creatorId } },
      include: { contract: true },
      orderBy: { createdAt: 'desc' },
    });
  }
  listForTalentManager(talentManagerId: number) {
    return prisma.payment.findMany({
      where: { contract: { talentManagerId } },
      include: { contract: true },
      orderBy: { createdAt: 'desc' },
    });
  }
  listForFreelancer(freelancerId: number) {
    return prisma.payment.findMany({
      where: { contract: { tasks: { some: { assigneeId: freelancerId } } } },
      include: { contract: true },
      orderBy: { createdAt: 'desc' },
    });
  }
  updateStatus(id: number, status: string, paidAt?: Date) {
    return prisma.payment.update({ where: { id }, data: { status, paidAt } });
  }
}

export const paymentRepository = new PaymentRepository();