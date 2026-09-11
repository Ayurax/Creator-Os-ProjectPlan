import prisma from '../config/prisma';

export class UserRepository {
  findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  }
  findById(id: number) {
    return prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, role: true, createdAt: true, updatedAt: true },
    });
  }
  create(data: { email: string; passwordHash: string; role: string }) {
    return prisma.user.create({ data });
  }
  update(id: number, data: Partial<{ email: string; passwordHash: string; role: string }>) {
    return prisma.user.update({ where: { id }, data });
  }
}

export const userRepository = new UserRepository();