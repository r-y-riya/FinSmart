import { Stock } from '../models/Stock.js';
import { StockSnapshot } from '../models/StockSnapshot.js';
import { ChangeEvent } from '../models/ChangeEvent.js';
import { changeDetectionService } from '../services/changeDetection.service.js';
import { seedInitialData } from '../scripts/seed.js';

let isOutageSimulated = false;

export const demoController = {
  /**
   * Simulates a live price spike or volume surge on a stock in the backend
   */
  async simulateMovement(req, res, next) {
    try {
      const { symbol = 'RELIANCE', percentageChange = -3.2, volumeMultiplier = 1.67 } = req.body;
      const cleanSymbol = symbol.trim().toUpperCase();

      let stock = await Stock.findOne({ symbol: cleanSymbol });
      if (!stock) {
        stock = await Stock.create({ symbol: cleanSymbol, companyName: cleanSymbol, exchange: 'NSE' });
      }

      // Find latest snapshot as baseline
      const lastSnapshot = await StockSnapshot.findOne({ symbol: cleanSymbol }).sort({ timestamp: -1 });
      const currentPrice = lastSnapshot ? lastSnapshot.price : 1475.0;
      const newPrice = parseFloat((currentPrice * (1 + percentageChange / 100)).toFixed(2));
      const newVolume = Math.round((lastSnapshot?.volume || 2500000) * volumeMultiplier);

      // Save new immutable snapshot into MongoDB
      const newSnapshot = await StockSnapshot.create({
        stockId: stock._id,
        symbol: cleanSymbol,
        price: newPrice,
        open: lastSnapshot?.open || currentPrice,
        high: Math.max(lastSnapshot?.high || newPrice, newPrice),
        low: Math.min(lastSnapshot?.low || newPrice, newPrice),
        previousClose: lastSnapshot?.previousClose || currentPrice,
        volume: newVolume,
        averageVolume: lastSnapshot?.averageVolume || 2500000,
        timestamp: new Date(),
        source: 'SIMULATED',
        freshnessStatus: 'FRESH',
      });

      // Run change detection engine in backend
      const evaluation = await changeDetectionService.evaluateChange({
        stock,
        currentSnapshot: newSnapshot,
        referenceSnapshot: lastSnapshot,
      });

      res.status(201).json({
        success: true,
        data: {
          snapshot: newSnapshot,
          evaluation,
          message: `Simulated ${percentageChange > 0 ? '+' : ''}${percentageChange}% movement on ${cleanSymbol}. Detected severity: ${evaluation.severity}, Attention Score: ${evaluation.attentionScore}/100.`,
        }
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Toggles simulated market provider outage to test graceful stale-data fallback
   */
  async toggleOutage(req, res) {
    isOutageSimulated = !isOutageSimulated;
    res.json({
      success: true,
      data: {
        isOutageSimulated,
        status: isOutageSimulated ? 'OFFLINE' : 'ONLINE',
        message: isOutageSimulated 
          ? 'Market provider simulated OFFLINE. System falling back gracefully to latest snapshots marked STALE.'
          : 'Market provider restored ONLINE.'
      }
    });
  },

  getOutageStatus(req, res) {
    res.json({ success: true, isOutageSimulated });
  },

  /**
   * Re-seeds baseline demo data in MongoDB Atlas
   */
  async seed(req, res, next) {
    try {
      await seedInitialData();
      res.json({ success: true, message: 'Database successfully seeded with FinSmart baseline snapshots, users, and change events.' });
    } catch (err) {
      next(err);
    }
  }
};
