import { watchlistService } from '../services/watchlist.service.js';
import { z } from 'zod';

const addStockSchema = z.object({
  symbol: z.string().min(1, 'Symbol is required'),
  companyName: z.string().optional(),
  exchange: z.string().optional(),
});

export const watchlistController = {
  async getWatchlist(req, res, next) {
    try {
      const result = await watchlistService.getWatchlistWithMarketData(req.user.userId);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  },

  async getAllWatchlists(req, res, next) {
    try {
      const result = await watchlistService.getWatchlists(req.user.userId);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  },

  async addStock(req, res, next) {
    try {
      const parsed = addStockSchema.parse(req.body);
      const watchlistId = req.params.id !== 'default' ? req.params.id : null;
      const updated = await watchlistService.addStock(req.user.userId, watchlistId, parsed);
      res.status(201).json({ success: true, data: updated });
    } catch (err) {
      if (err instanceof z.ZodError) {
        err.statusCode = 400;
        err.message = err.errors.map(e => e.message).join(', ');
      }
      next(err);
    }
  },

  async removeStock(req, res, next) {
    try {
      const watchlistId = req.params.id !== 'default' ? req.params.id : null;
      const updated = await watchlistService.removeStock(req.user.userId, watchlistId, req.params.symbol);
      res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  }
};
