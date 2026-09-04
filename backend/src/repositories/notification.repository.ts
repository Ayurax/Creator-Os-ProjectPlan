import prisma from '../config/prisma';

export class NotificationRepository {
  create(data: { userId: number; type: string; content: string }) {
    return prisma.notification.create({ data });
  }
  findById(id: number) {
    return prisma.notification.findUnique({ where: { id } });
  }
  listForUser(userId: number) {
    return prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
  }
  markRead(id: number) {
    return prisma.notification.update({ where: { id }, data: { isRead: true } });
  }
}

export const notificationRepository = new NotificationRepository();