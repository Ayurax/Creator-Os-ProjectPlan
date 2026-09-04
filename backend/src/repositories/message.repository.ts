import prisma from '../config/prisma';

export class MessageRepository {
  create(data: { senderId: number; receiverId: number; content: string }) {
    return prisma.message.create({ data });
  }
  listForUser(userId: number) {
    return prisma.message.findMany({
      where: { OR: [{ senderId: userId }, { receiverId: userId }] },
      include: { sender: true, receiver: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}

export const messageRepository = new MessageRepository();