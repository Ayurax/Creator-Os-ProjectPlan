import prisma from '../config/prisma';
import { aiRecommendationRepository } from '../repositories/ai.repository';
import { HttpError } from '../utils/errors';
import type { AssistantContext } from '../types';

interface GroqResponseData {
  id?: string;
  object?: string;
  created?: number;
  model?: string;
  choices?: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason?: string;
  }[];
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
}

export class AIService {
  async recommendCreators(input: { campaignId: number }, user: { userId: number; role: string }) {
    if (user.role !== 'BRAND' && user.role !== 'TALENT_MANAGER') {
      throw new HttpError(403, 'Forbidden');
    }
    const campaign = await prisma.campaign.findUnique({ where: { id: input.campaignId } });
    if (!campaign) throw new HttpError(404, 'Campaign not found');

    const creators = await prisma.creator.findMany({
      include: { user: { select: { id: true, email: true, role: true, createdAt: true, updatedAt: true } } },
    });
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
      include: {
        brand: {
          include: { user: { select: { id: true, email: true, role: true, createdAt: true, updatedAt: true } } },
        },
      },
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
    const creator = await prisma.creator.findUnique({
      where: { id: input.creatorId },
      include: { user: { select: { id: true, email: true, role: true, createdAt: true, updatedAt: true } } },
    });
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

  async chat(
    input: { message: string; conversation?: Array<{ role: 'user' | 'assistant', content: string }> },
    user: { userId: number; role: string; email?: string },
    context?: AssistantContext,
  ) {
    if (!input.message || input.message.trim() === '') {
      throw new HttpError(400, 'Message is required');
    }

    if (input.message.length > 1000) {
      throw new HttpError(400, 'Message too long (max 1000 characters)');
    }

    const conversation = input.conversation?.slice(-10) || [];

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new HttpError(503, 'Assistant is temporarily unavailable. Please try again later.');
    }

    const model = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';

    let contextSection = '';
    if (context) {
      const lines: string[] = [];
      lines.push('CURRENT CREATOROS CONTEXT');
      lines.push(`Role: ${context.role}`);
      lines.push(`Page: ${context.page}`);
      lines.push(`Route: ${context.route}`);

      if (context.entity) {
        lines.push('');
        lines.push('Entity:');
        lines.push(`Type: ${context.entity.type}`);
        if (context.entity.id !== undefined) lines.push(`ID: ${context.entity.id}`);
        if (context.entity.name) lines.push(`Name: ${context.entity.name}`);
        if (context.entity.status) lines.push(`Status: ${context.entity.status}`);
      }

      if (context.data && Object.keys(context.data).length > 0) {
        lines.push('');
        lines.push('Relevant data:');
        for (const [key, value] of Object.entries(context.data)) {
          if (value !== undefined && value !== null && value !== '') {
            lines.push(`${key}: ${JSON.stringify(value)}`);
          }
        }
      }

      lines.push('');
      lines.push('Instructions:');
      lines.push('- Treat this as the user\'s current application context.');
      lines.push('- Use it when answering questions.');
      lines.push('- Do not invent information not present in the context.');
      lines.push('- If a requested fact is not available, say so.');
      lines.push('- Do not claim to perform actions unless the application actually performs them.');

      contextSection = lines.join('\n');
    }

    const systemPrompt = [
      'You are CreatorOS Assistant, an AI helper designed to assist users with the CreatorOS platform.',
      'You help users understand and navigate CreatorOS features including:',
      '- Campaign creation and management',
      '- Creator discovery and collaboration',
      '- Contract management and negotiations',
      '- Task and deliverable tracking',
      '- Payment processing and invoicing',
      '- Portfolio management',
      '- Reviews and feedback',
      '- Messaging and communication',
      '- AI-powered tools and features',
      '',
      'Provide concise, practical answers focused on helping users accomplish tasks within CreatorOS.',
      'Do not claim to have performed actions unless the application actually performed them.',
      'Do not invent database records or expose internal system details.',
      'Always prioritize the user\'s safety and privacy.',
      '',
      `Current user role: ${user.role}`,
      `User email: ${user.email || 'Not provided'}`,
      '',
      contextSection,
      '',
      'When answering:',
      '1. Be helpful and specific to CreatorOS workflows',
      '2. Ask for clarification only when genuinely necessary',
      '3. Use the user\'s role to provide relevant, targeted guidance',
      '4. Focus on platform navigation and feature explanations',
      '5. If unsure about specific platform details, suggest checking the relevant section or contacting support',
      '6. Keep responses concise but comprehensive',
    ]
      .filter((line) => line !== null)
      .join('\n');

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      ...conversation.map((exchange) => ({
        role: exchange.role as 'user' | 'assistant',
        content: exchange.content,
      })),
      { role: 'user' as const, content: input.message.trim() },
    ];

    try {
      const requestBody = {
        model,
        messages,
        temperature: 0.7,
        max_tokens: 500,
      };

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        let errorMessage = 'Unknown error';

        const responseText = await response.text();

        try {
          const errorDetails = JSON.parse(responseText);
          errorMessage = errorDetails.message || errorDetails.error || 'Unknown error';
        } catch {
          errorMessage = responseText || 'Unknown error';
        }

        throw new HttpError(response.status, errorMessage || `Groq API error: ${response.status}`);
      }

      const data = (await response.json()) as GroqResponseData;
      const assistantMessage = data.choices?.[0]?.message?.content || '';
      return { message: assistantMessage };
    } catch (error) {
      if (error instanceof HttpError) {
        throw error;
      }

      console.error('Groq chat error:', error);
      throw new HttpError(503, 'Assistant is temporarily unavailable. Please try again.');
    }
  }
}

export const aiService = new AIService();
