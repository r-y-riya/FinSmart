import { ChangeEvent } from '../models/ChangeEvent.js';
import { Watchlist } from '../models/Watchlist.js';
import { User } from '../models/User.js';

export const changeController = {
  /**
   * Retrieves all active change events
   */
  async getAllChanges(req, res, next) {
    try {
      const changes = await ChangeEvent.find()
        .sort({ detectedAt: -1, attentionScore: -1 })
        .limit(30);
      res.json({ success: true, data: changes });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Core feature: Retrieves meaningful change events since the user's last visit
   */
  async getChangesSinceLastVisit(req, res, next) {
    try {
      const user = await User.findById(req.user.userId);
      const lastVisitedAt = user?.lastVisitedAt || new Date(Date.now() - (7 * 60 + 42) * 60 * 1000);

      const watchlist = await Watchlist.findOne({ userId: req.user.userId });
      const watchedSymbols = watchlist ? watchlist.items.map(i => i.symbol) : ['RELIANCE', 'INFY', 'TCS', 'HDFCBANK', 'TATAMOTORS'];

      // Query changes detected after lastVisitedAt for user's watched stocks
      const changes = await ChangeEvent.find({
        symbol: { $in: watchedSymbols },
        detectedAt: { $gte: lastVisitedAt }
      }).sort({ attentionScore: -1, detectedAt: -1 });

      // Group by symbol to take the latest/most significant event per stock
      const latestPerStock = {};
      for (const event of changes) {
        if (!latestPerStock[event.symbol] || event.attentionScore > latestPerStock[event.symbol].attentionScore) {
          latestPerStock[event.symbol] = event;
        }
      }

      const deduplicatedChanges = Object.values(latestPerStock).sort((a, b) => b.attentionScore - a.attentionScore);

      // Summary counts
      const significantCount = deduplicatedChanges.filter(c => c.severity === 'SIGNIFICANT').length;
      const watchCount = deduplicatedChanges.filter(c => c.severity === 'WATCH').length;
      const normalCount = deduplicatedChanges.filter(c => c.severity === 'NORMAL').length;

      res.json({
        success: true,
        data: {
          lastVisitedAt,
          summary: {
            totalMeaningful: significantCount + watchCount,
            significant: significantCount,
            worthWatching: watchCount,
            normal: normalCount,
            totalWatched: watchedSymbols.length,
          },
          events: deduplicatedChanges,
        }
      });
    } catch (err) {
      next(err);
    }
  }
};
