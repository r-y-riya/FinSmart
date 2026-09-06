import { aiService } from '../services/ai.service.js';
import { z } from 'zod';

const askSchema = z.object({
  question: z.string().min(2, 'Question must be at least 2 characters'),
});

export const aiController = {
  async getWhyItMatters(req, res, next) {
    try {
      const { symbol, changeEventId } = req.params;
      const insight = await aiService.getWhyItMatters(symbol, changeEventId);
      res.json({ success: true, data: insight });
    } catch (err) {
      next(err);
    }
  },

  async getWatchlistSummary(req, res, next) {
    try {
      const summary = await aiService.getWatchlistSummary(req.user.userId);
      res.json({ success: true, data: summary });
    } catch (err) {
      next(err);
    }
  },

  async askFinSmart(req, res, next) {
    try {
      const parsed = askSchema.parse(req.body);
      const answer = await aiService.askFinSmart(req.user.userId, parsed.question);
      res.json({ success: true, data: answer });
    } catch (err) {
      if (err instanceof z.ZodError) {
        err.statusCode = 400;
        err.message = err.errors.map(e => e.message).join(', ');
      }
      next(err);
    }
  }
};
