import prisma from '../config/prisma';

export class FreelancerRepository {
  findByUserId(userId: number) {
    return prisma.freelancer.findUnique({ where: { userId } });
  }
  findById(id: number) {
    return prisma.freelancer.findUnique({ where: { id } });
  }
  create(data: { userId: number; skills?: string; hourlyRate?: number; availability?: string }) {
    return prisma.freelancer.create({ data });
  }
  update(id: number, data: Partial<{ skills: string; hourlyRate: number; availability: string }>) {
    return prisma.freelancer.update({ where: { id }, data });
  }
}

export const freelancerRepository = new FreelancerRepository();