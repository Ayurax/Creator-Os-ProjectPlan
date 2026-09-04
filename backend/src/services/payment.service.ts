import prisma from '../config/prisma';
import { paymentRepository } from '../repositories/payment.repository';
import { HttpError } from '../utils/errors';
import { PaymentStatus } from '../types';

export class PaymentService {
  async listForUser(user: { userId: number; role: string }) {
    if (user.role === 'BRAND') {
      const brand = await prisma.brand.findUnique({ where: { userId: user.userId } });
      if (!brand) throw new HttpError(404, 'Brand profile not found');
      return paymentRepository.listForBrand(brand.id);
    }
    if (user.role === 'CREATOR') {
      const creator = await prisma.creator.findUnique({ where: { userId: user.userId } });
      if (!creator) throw new HttpError(404, 'Creator profile not found');
      return paymentRepository.listForCreator(creator.id);
    }
    if (user.role === 'TALENT_MANAGER') {
      const tm = await prisma.talentManager.findUnique({ where: { userId: user.userId } });
      if (!tm) throw new HttpError(404, 'Talent manager profile not found');
      return paymentRepository.listForTalentManager(tm.id);
    }
    if (user.role === 'FREELANCER') {
      const fl = await prisma.freelancer.findUnique({ where: { userId: user.userId } });
      if (!fl) throw new HttpError(404, 'Freelancer profile not found');
      return paymentRepository.listForFreelancer(fl.id);
    }
    throw new HttpError(403, 'Forbidden');
  }

  async markPaid(id: number, user: { userId: number; role: string }) {
    if (user.role !== 'BRAND') {
      throw new HttpError(403, 'Only brands can mark payments as paid');
    }
    const payment = await paymentRepository.findById(id);
    if (!payment) throw new HttpError(404, 'Payment not found');

    const brand = await prisma.brand.findUnique({ where: { userId: user.userId } });
    if (!brand || payment.contract.brandId !== brand.id) throw new HttpError(403, 'Forbidden');

    return paymentRepository.updateStatus(id, 'PAID' as PaymentStatus, new Date());
  }

  async refund(id: number, user: { userId: number; role: string }) {
    if (user.role !== 'BRAND') {
      throw new HttpError(403, 'Only brands can refund');
    }
    const payment = await paymentRepository.findById(id);
    if (!payment) throw new HttpError(404, 'Payment not found');
    const brand = await prisma.brand.findUnique({ where: { userId: user.userId } });
    if (!brand || payment.contract.brandId !== brand.id) throw new HttpError(403, 'Forbidden');
    return paymentRepository.updateStatus(id, 'REFUNDED' as PaymentStatus);
  }
}

export const paymentService = new PaymentService();