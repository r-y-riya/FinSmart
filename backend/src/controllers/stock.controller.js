import { Stock } from '../models/Stock.js';
import { ChangeEvent } from '../models/ChangeEvent.js';
import { marketService } from '../services/market.service.js';
import { newsService } from '../services/news.service.js';
import { twelveDataClient } from '../integrations/twelveData.client.js';

export const stockController = {
  async search(req, res, next) {
    try {
      const q = req.query.q?.trim();
      if (!q) {
        const popular = await Stock.find().limit(10);
        return res.json({ success: true, data: popular });
      }

      // Search local database
      const regex = new RegExp(q, 'i');
      const localMatches = await Stock.find({
        $or: [{ symbol: regex }, { companyName: regex }]
      }).limit(8);

      if (localMatches.length >= 3) {
        return res.json({ success: true, data: localMatches });
      }

      // Supplement from Twelve Data symbol search
      const external = await twelveDataClient.searchSymbol(q);
      const combined = [...localMatches];
      const seen = new Set(localMatches.map(s => s.symbol));

      for (const ext of external.data || []) {
        if (!seen.has(ext.symbol)) {
          combined.push(ext);
          seen.add(ext.symbol);
        }
      }

      res.json({ success: true, data: combined.slice(0, 10) });
    } catch (err) {
      next(err);
    }
  },

  async getStock(req, res, next) {
    try {
      const symbol = req.params.symbol.trim().toUpperCase();
      const userPreferences = req.user?.preferences || { priceThreshold: 2.0, volumeThreshold: 1.5 };
      const data = await marketService.getStockData(symbol, userPreferences);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async getHistory(req, res, next) {
    try {
      const symbol = req.params.symbol.trim().toUpperCase();
      const interval = req.query.interval || '15min';
      const outputsize = parseInt(req.query.outputsize, 10) || 30;
      const history = await marketService.getStockHistory(symbol, interval, outputsize);
      res.json({ success: true, data: history });
    } catch (err) {
      next(err);
    }
  },

  async getNews(req, res, next) {
    try {
      const symbol = req.params.symbol.trim().toUpperCase();
      const news = await newsService.getNewsForStock(symbol);
      res.json({ success: true, data: news });
    } catch (err) {
      next(err);
    }
  },

  async getChanges(req, res, next) {
    try {
      const symbol = req.params.symbol.trim().toUpperCase();
      const changes = await ChangeEvent.find({ symbol })
        .sort({ detectedAt: -1 })
        .limit(20);
      res.json({ success: true, data: changes });
    } catch (err) {
      next(err);
    }
  }
};
