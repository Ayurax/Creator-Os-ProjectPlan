import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { messageRepository } from '../repositories/message.repository';
import prisma from '../config/prisma';
import { HttpError } from '../utils/errors';

export const messageController = {
  async send(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { receiverId, content } = req.body;
      if (!receiverId || !content) throw new HttpError(400, 'receiverId and content are required');
      const receiver = await prisma.user.findUnique({ where: { id: Number(receiverId) } });
      if (!receiver) throw new HttpError(404, 'Receiver not found');
      const data = await messageRepository.create({
        senderId: req.user!.userId,
        receiverId: Number(receiverId),
        content: String(content),
      });
      res.status(201).json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },
  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await messageRepository.listForUser(req.user!.userId);
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },
};