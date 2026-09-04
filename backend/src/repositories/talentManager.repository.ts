import prisma from '../config/prisma';

export class TalentManagerRepository {
  findByUserId(userId: number) {
    return prisma.talentManager.findUnique({ where: { userId } });
  }
  findById(id: number) {
    return prisma.talentManager.findUnique({ where: { id } });
  }
  create(data: { userId: number }) {
    return prisma.talentManager.create({ data });
  }
}

export const talentManagerRepository = new TalentManagerRepository();