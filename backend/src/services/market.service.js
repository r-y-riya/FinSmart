import { Stock } from '../models/Stock.js';
import { StockSnapshot } from '../models/StockSnapshot.js';
import { twelveDataClient } from '../integrations/twelveData.client.js';
import { changeDetectionService } from './changeDetection.service.js';
import { calculateFreshness } from '../utils/freshness.js';
import { logger } from '../utils/logger.js';

export const marketService = {
  /**
   * Retrieves stock quote with cache-first snapshot strategy
   */
  async getStockData(symbol, userPreferences = { priceThreshold: 2.0, volumeThreshold: 1.5 }) {
    const cleanSymbol = symbol.trim().toUpperCase();

    // 1. Ensure Stock master record exists
    let stock = await Stock.findOne({ symbol: cleanSymbol });
    if (!stock) {
      stock = await Stock.create({
        symbol: cleanSymbol,
        companyName: cleanSymbol,
        exchange: 'NSE',
        currency: 'INR',
      });
    }

    // 2. Check MongoDB for recent cached snapshot (< 2 minutes old)
    const latestSnapshot = await StockSnapshot.findOne({ symbol: cleanSymbol })
      .sort({ timestamp: -1 });

    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
    const isFresh = latestSnapshot && new Date(latestSnapshot.timestamp) > twoMinutesAgo;

    if (isFresh && latestSnapshot.freshnessStatus === 'FRESH') {
      const freshness = calculateFreshness(latestSnapshot.timestamp, false);
      return {
        stock,
        snapshot: latestSnapshot,
        freshness,
      };
    }

    // 3. Cache expired or missing -> call external Twelve Data API with exchange
    const quoteRes = await twelveDataClient.getQuote(cleanSymbol, stock.exchange || 'NSE');

    if (quoteRes.success && quoteRes.data) {
      const data = quoteRes.data;

      // Update stock company name if retrieved
      if (data.name && stock.companyName === cleanSymbol) {
        stock.companyName = data.name;
        stock.exchange = data.exchange || stock.exchange;
        stock.currency = data.currency || stock.currency;
        await stock.save();
      }

      // Save new immutable snapshot (NEVER overwrite!)
      const newSnapshot = await StockSnapshot.create({
        stockId: stock._id,
        symbol: cleanSymbol,
        price: data.price,
        open: data.open,
        high: data.high,
        low: data.low,
        previousClose: data.previousClose,
        volume: data.volume,
        averageVolume: data.averageVolume,
        fiftyTwoWeekHigh: data.fiftyTwoWeekHigh,
        fiftyTwoWeekLow: data.fiftyTwoWeekLow,
        timestamp: new Date(data.timestamp),
        source: 'TWELVE_DATA',
        freshnessStatus: 'FRESH',
      });

      // Run change detection engine in background
      changeDetectionService.evaluateChange({
        stock,
        currentSnapshot: newSnapshot,
        referenceSnapshot: latestSnapshot,
        userPreferences,
      }).catch(e => logger.error(`[MarketService] Change detection async error: ${e.message}`));

      const freshness = calculateFreshness(newSnapshot.timestamp, false);

      return {
        stock,
        snapshot: newSnapshot,
        freshness,
      };
    }

    // 4. Fallback when Twelve Data is down, rate limited, or network fails:
    // Return latest cached snapshot gracefully with STALE status
    if (latestSnapshot) {
      logger.warn(`[MarketService] External provider failed for ${cleanSymbol}. Falling back to last known snapshot from ${latestSnapshot.timestamp}`);
      const freshness = calculateFreshness(latestSnapshot.timestamp, true);
      return {
        stock,
        snapshot: latestSnapshot,
        freshness: {
          ...freshness,
          status: 'STALE',
          label: 'Stale',
          description: `Market provider temporarily unavailable. Showing last known snapshot from ${new Date(latestSnapshot.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
        }
      };
    }

    // 5. No cached snapshot exists at all
    return {
      stock,
      snapshot: {
        symbol: cleanSymbol,
        price: 0,
        open: 0,
        high: 0,
        low: 0,
        previousClose: 0,
        volume: 0,
        timestamp: new Date(),
        freshnessStatus: 'UNAVAILABLE',
      },
      freshness: {
        status: 'UNAVAILABLE',
        label: 'Unavailable',
        description: 'Market data is currently unavailable for this symbol.'
      }
    };
  },

  /**
   * Retrieves historical chart time series for a stock
   */
  async getStockHistory(symbol, interval = '15min', outputsize = 30) {
    const cleanSymbol = symbol.trim().toUpperCase();

    // Try fetching live history from Twelve Data
    const stock = await Stock.findOne({ symbol: cleanSymbol });
    const liveHistory = await twelveDataClient.getTimeSeries(cleanSymbol, interval, outputsize, stock?.exchange || 'NSE');
    if (liveHistory.success && liveHistory.data?.length > 0) {
      return liveHistory.data;
    }

    // Fallback to historical snapshots stored in MongoDB
    const snapshots = await StockSnapshot.find({ symbol: cleanSymbol })
      .sort({ timestamp: -1 })
      .limit(outputsize);

    if (snapshots.length > 0) {
      return snapshots.reverse().map(s => ({
        time: new Date(s.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        price: s.price,
        volume: s.volume,
      }));
    }

    return [];
  }
};
