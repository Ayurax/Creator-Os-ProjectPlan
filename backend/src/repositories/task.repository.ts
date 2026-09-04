import prisma from '../config/prisma';

export class TaskRepository {
  create(data: { contractId: number; description: string; assigneeId?: number; dueDate?: Date; status?: string }) {
    return prisma.task.create({ data });
  }
  findById(id: number) {
    return prisma.task.findUnique({ where: { id }, include: { contract: true, assignee: true } });
  }
  update(
    id: number,
    data: Partial<{ description: string; assigneeId: number; dueDate: Date; status: string }>,
  ) {
    return prisma.task.update({ where: { id }, data });
  }
  listForBrand(brandId: number) {
    return prisma.task.findMany({
      where: { contract: { brandId } },
      include: { contract: true, assignee: true },
      orderBy: { createdAt: 'desc' },
    });
  }
  listForTalentManager(talentManagerId: number) {
    return prisma.task.findMany({
      where: { contract: { talentManagerId } },
      include: { contract: true, assignee: true },
      orderBy: { createdAt: 'desc' },
    });
  }
  listForCreator(creatorId: number) {
    return prisma.task.findMany({
      where: { contract: { creatorId } },
      include: { contract: true, assignee: true },
      orderBy: { createdAt: 'desc' },
    });
  }
  listForFreelancer(freelancerId: number) {
    return prisma.task.findMany({
      where: { assigneeId: freelancerId },
      include: { contract: true, assignee: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}

export const taskRepository = new TaskRepository();