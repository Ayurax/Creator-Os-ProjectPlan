import prisma from '../config/prisma';

export class UserRepository {
  findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  }
  findById(id: number) {
    return prisma.user.findUnique({ where: { id } });
  }
  create(data: { email: string; passwordHash: string; role: string }) {
    return prisma.user.create({ data });
  }
  update(id: number, data: Partial<{ email: string; passwordHash: string; role: string }>) {
    return prisma.user.update({ where: { id }, data });
  }
}

export const userRepository = new UserRepository();