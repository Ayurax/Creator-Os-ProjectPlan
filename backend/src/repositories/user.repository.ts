import prisma from '../config/prisma';
import type { Prisma } from '@prisma/client';

export class UserRepository {
  findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  }
  findById(id: number) {
    return prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, role: true, displayName: true, createdAt: true, updatedAt: true },
    });
  }
  create(data: Prisma.UserCreateInput) {
    return prisma.user.create({ data });
  }
  update(id: number, data: Partial<{ email: string; passwordHash: string; role: string; displayName: string }>) {
    return prisma.user.update({ where: { id }, data });
  }
}

export const userRepository = new UserRepository();