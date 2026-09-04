import prisma from '../config/prisma';

export class AIRecommendationRepository {
  create(data: { userId?: number; campaignId?: number; type: string; result: string }) {
    return prisma.aIRecommendation.create({ data });
  }
}

export const aiRecommendationRepository = new AIRecommendationRepository();