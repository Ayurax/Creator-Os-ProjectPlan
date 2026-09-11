import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { aiService } from '../services/ai.service';
import type { AssistantContext } from '../types';

export const aiController = {
  async recommendCreators(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await aiService.recommendCreators(req.body, req.user!);
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },
  async recommendBrands(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await aiService.recommendBrands(req.body, req.user!);
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },
  async estimatePrice(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await aiService.estimatePrice(req.body);
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },
  async generateEmail(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await aiService.generateEmail(req.body, req.user!);
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },
  async summarizeCampaign(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await aiService.summarizeCampaign(req.body, req.user!);
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },
  async summarizeAnalytics(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await aiService.summarizeAnalytics(req.body, req.user!);
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },
  async generateContentPlan(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await aiService.generateContentPlan(req.body);
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },
  async chat(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { message, conversation, context } = req.body;
      const data = await aiService.chat(
        { message, conversation },
        req.user!,
        context as AssistantContext | undefined,
      );
      res.json(data);
    } catch (e) {
      next(e);
    }
  },
};