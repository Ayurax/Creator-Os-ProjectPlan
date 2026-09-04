import prisma from '../config/prisma';
import { aiRecommendationRepository } from '../repositories/ai.repository';
import { HttpError } from '../utils/errors';

export class AIService {
  async recommendCreators(input: { campaignId: number }, user: { userId: number; role: string }) {
    if (user.role !== 'BRAND' && user.role !== 'TALENT_MANAGER') {
      throw new HttpError(403, 'Forbidden');
    }
    const campaign = await prisma.campaign.findUnique({ where: { id: input.campaignId } });
    if (!campaign) throw new HttpError(404, 'Campaign not found');

    const creators = await prisma.creator.findMany({ include: { user: true } });
    const ranked = creators
      .map((c) => {
        const engagement = c.engagementRate ?? 0;
        const followers = c.followers ?? 0;
        const score = engagement * 10 + Math.log10(Math.max(followers, 1));
        return {
          creatorId: c.id,
          userId: c.userId,
          email: c.user.email,
          niche: c.niche,
          followers: c.followers,
          engagementRate: c.engagementRate,
          score,
          reason: `Engagement ${engagement}% over ${followers} followers`,
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    const result = JSON.stringify({ recommendations: ranked });
    await aiRecommendationRepository.create({
      userId: user.userId,
      campaignId: campaign.id,
      type: 'CREATOR_RECOMMENDATION',
      result,
    });

    return { campaignId: campaign.id, recommendations: ranked };
  }

  async summarizeCampaign(input: { campaignId: number }, user: { userId: number; role: string }) {
    const campaign = await prisma.campaign.findUnique({
      where: { id: input.campaignId },
      include: {
        collaborationRequests: true,
        contracts: { include: { payments: true, tasks: true } },
        analytics: true,
      },
    });
    if (!campaign) throw new HttpError(404, 'Campaign not found');

    const totalPayments = campaign.contracts.reduce(
      (sum, c) => sum + c.payments.reduce((s, p) => s + (p.status === 'PAID' ? p.amount : 0), 0),
      0,
    );
    const totalTasks = campaign.contracts.reduce((s, c) => s + c.tasks.length, 0);
    const doneTasks = campaign.contracts.reduce(
      (s, c) => s + c.tasks.filter((t) => t.status === 'DONE').length,
      0,
    );

    const summary = {
      campaignId: campaign.id,
      name: campaign.name,
      status: campaign.status,
      budget: campaign.budget,
      analytics: campaign.analytics,
      collaborationRequests: campaign.collaborationRequests.length,
      contracts: campaign.contracts.length,
      tasksTotal: totalTasks,
      tasksDone: doneTasks,
      totalPaid: totalPayments,
    };

    await aiRecommendationRepository.create({
      userId: user.userId,
      campaignId: campaign.id,
      type: 'CAMPAIGN_SUMMARY',
      result: JSON.stringify(summary),
    });

    return summary;
  }

  async recommendBrands(input: { creatorId: number; query?: string }, user: { userId: number; role: string }) {
    if (user.role !== 'CREATOR') {
      throw new HttpError(403, 'Forbidden');
    }
    const creator = await prisma.creator.findUnique({ where: { id: input.creatorId } });
    if (!creator) throw new HttpError(404, 'Creator not found');

    const campaigns = await prisma.campaign.findMany({
      where: { status: 'ACTIVE' },
      include: { brand: { include: { user: true } } },
    });

    const ranked = campaigns
      .map((c) => ({
        campaignId: c.id,
        brandId: c.brand.id,
        companyName: c.brand.companyName,
        name: c.name,
        budget: c.budget,
        score: Math.random(),
        reason: 'Matches your niche',
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    const result = JSON.stringify({ recommendations: ranked });
    await aiRecommendationRepository.create({
      userId: user.userId,
      type: 'BRAND_RECOMMENDATION',
      result,
    });

    return { creatorId: creator.id, recommendations: ranked };
  }

  async estimatePrice(input: { niche: string; followers: number; engagementRate: number; platform: string; deliverables?: string; duration?: string }) {
    const base = 500;
    const rate = Number(input.engagementRate) / 100;
    const followersFactor = Math.log10(Math.max(input.followers, 1)) * 100;
    const estimate = Math.round(base + rate * followersFactor + (input.followers > 10000 ? 2000 : 0));

    return {
      niche: input.niche,
      platform: input.platform,
      estimatedMin: estimate,
      estimatedMax: estimate + 1500,
      factors: ['Engagement rate', 'Follower count', 'Platform', 'Deliverables', 'Duration'],
    };
  }

  async generateEmail(input: { campaignId: number; creatorId: number; tone?: string }, user: { userId: number; role: string }) {
    const campaign = await prisma.campaign.findUnique({ where: { id: input.campaignId } });
    const creator = await prisma.creator.findUnique({ where: { id: input.creatorId }, include: { user: true } });
    if (!campaign || !creator) throw new HttpError(404, 'Not found');

    const email = `Subject: Collaboration Opportunity - ${campaign.name}\n\nHi ${creator.user.email},\n\nWe would love to collaborate with you on our ${campaign.name} campaign.\n\nBest regards,\n${user.role}`;

    await aiRecommendationRepository.create({
      userId: user.userId,
      campaignId: campaign.id,
      type: 'GENERATED_EMAIL',
      result: JSON.stringify({ email }),
    });

    return { email, tone: input.tone || 'professional' };
  }

  async summarizeAnalytics(input: { campaignId: number }, user: { userId: number; role: string }) {
    const analytics = await prisma.analytics.findUnique({ where: { campaignId: input.campaignId } });
    if (!analytics) throw new HttpError(404, 'Analytics not found');

    const summary = {
      campaignId: input.campaignId,
      views: analytics.views,
      clicks: analytics.clicks,
      engagements: analytics.engagements,
      summary: `Campaign has ${analytics.views || 0} views, ${analytics.clicks || 0} clicks, and ${analytics.engagements || 0} engagements.`,
    };

    await aiRecommendationRepository.create({
      userId: user.userId,
      campaignId: input.campaignId,
      type: 'ANALYTICS_SUMMARY',
      result: JSON.stringify(summary),
    });

    return summary;
  }

  async generateContentPlan(input: { niche: string; campaignId?: number; platforms?: string[]; targetAudience?: string }) {
    const plan = {
      niche: input.niche,
      platforms: input.platforms || ['instagram', 'tiktok'],
      targetAudience: input.targetAudience || 'General',
      schedule: [
        { day: 1, content: 'Teaser post', platform: 'instagram' },
        { day: 3, content: 'Main post', platform: 'instagram' },
        { day: 5, content: 'Behind the scenes', platform: 'tiktok' },
      ],
    };

    return plan;
  }
}

export const aiService = new AIService();