import prisma from '../config/prisma';
import { taskRepository } from '../repositories/task.repository';
import { HttpError } from '../utils/errors';
import { TaskStatus } from '../types';

export class TaskService {
  async create(
    input: { contractId: number; description: string; assigneeId?: number; dueDate?: Date | string },
    user: { userId: number; role: string },
  ) {
    const contract = await prisma.contract.findUnique({ where: { id: input.contractId } });
    if (!contract) throw new HttpError(404, 'Contract not found');

    if (user.role === 'BRAND') {
      const brand = await prisma.brand.findUnique({ where: { userId: user.userId } });
      if (!brand || brand.id !== contract.brandId) throw new HttpError(403, 'Forbidden');
    } else if (user.role === 'TALENT_MANAGER') {
      const tm = await prisma.talentManager.findUnique({ where: { userId: user.userId } });
      if (!tm || contract.talentManagerId !== tm.id) throw new HttpError(403, 'Forbidden');
    } else {
      throw new HttpError(403, 'Forbidden');
    }

    if (input.assigneeId) {
      const fl = await prisma.freelancer.findUnique({ where: { id: input.assigneeId } });
      if (!fl) throw new HttpError(404, 'Assignee not found');
    }

    return taskRepository.create({
      contractId: input.contractId,
      description: input.description,
      assigneeId: input.assigneeId,
      dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
    });
  }

  async listForUser(user: { userId: number; role: string }) {
    if (user.role === 'BRAND') {
      const brand = await prisma.brand.findUnique({ where: { userId: user.userId } });
      if (!brand) throw new HttpError(404, 'Brand profile not found');
      return taskRepository.listForBrand(brand.id);
    }
    if (user.role === 'CREATOR') {
      const creator = await prisma.creator.findUnique({ where: { userId: user.userId } });
      if (!creator) throw new HttpError(404, 'Creator profile not found');
      return taskRepository.listForCreator(creator.id);
    }
    if (user.role === 'TALENT_MANAGER') {
      const tm = await prisma.talentManager.findUnique({ where: { userId: user.userId } });
      if (!tm) throw new HttpError(404, 'Talent manager profile not found');
      return taskRepository.listForTalentManager(tm.id);
    }
    if (user.role === 'FREELANCER') {
      const fl = await prisma.freelancer.findUnique({ where: { userId: user.userId } });
      if (!fl) throw new HttpError(404, 'Freelancer profile not found');
      return taskRepository.listForFreelancer(fl.id);
    }
    throw new HttpError(403, 'Forbidden');
  }

  async update(id: number, data: { status?: TaskStatus; assigneeId?: number }, user: { userId: number; role: string }) {
    const existing = await taskRepository.findById(id);
    if (!existing) throw new HttpError(404, 'Task not found');

    if (user.role === 'FREELANCER') {
      const fl = await prisma.freelancer.findUnique({ where: { userId: user.userId } });
      if (!fl || fl.id !== existing.assigneeId) throw new HttpError(403, 'Forbidden');
    } else if (user.role !== 'BRAND' && user.role !== 'TALENT_MANAGER') {
      throw new HttpError(403, 'Forbidden');
    }

    return taskRepository.update(id, data);
  }

  async addDeliverable(taskId: number, input: { description?: string; mediaUrl?: string }, user: { userId: number; role: string }) {
    const task = await taskRepository.findById(taskId);
    if (!task) throw new HttpError(404, 'Task not found');

    if (user.role !== 'FREELANCER') {
      throw new HttpError(403, 'Only freelancers can submit deliverables');
    }

    const fl = await prisma.freelancer.findUnique({ where: { userId: user.userId } });
    if (!fl || fl.id !== task.assigneeId) throw new HttpError(403, 'Forbidden');

    return prisma.deliverable.create({
      data: {
        taskId,
        description: input.description,
        mediaUrl: input.mediaUrl,
      },
    });
  }
}

export const taskService = new TaskService();