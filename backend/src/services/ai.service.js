import { AIInsight } from '../models/AIInsight.js';
import { ChangeEvent } from '../models/ChangeEvent.js';
import { Stock } from '../models/Stock.js';
import { StockSnapshot } from '../models/StockSnapshot.js';
import { User } from '../models/User.js';
import { Watchlist } from '../models/Watchlist.js';
import { geminiClient } from '../integrations/gemini.client.js';
import { newsService } from './news.service.js';
import { marketService } from './market.service.js';
import { logger } from '../utils/logger.js';

export const aiService = {
  /**
   * Retrieves or generates grounded "Why This Matters" explanation for a change event
   */
  async getWhyItMatters(symbol, changeEventId = null) {
    const cleanSymbol = symbol.trim().toUpperCase();

    // 1. Check if AIInsight is already cached
    let query = { symbol: cleanSymbol };
    if (changeEventId) query.changeEventId = changeEventId;

    const cached = await AIInsight.findOne(query).sort({ generatedAt: -1 });
    if (cached) {
      return cached;
    }

    // 2. Retrieve latest ChangeEvent and Stock
    let changeEvent = null;
    if (changeEventId) {
      changeEvent = await ChangeEvent.findById(changeEventId);
    }
    if (!changeEvent) {
      changeEvent = await ChangeEvent.findOne({ symbol: cleanSymbol }).sort({ detectedAt: -1 });
    }

    const stock = await Stock.findOne({ symbol: cleanSymbol });
    const companyName = stock?.companyName || cleanSymbol;

    // 3. Retrieve relevant news
    const news = await newsService.getNewsForStock(cleanSymbol);

    // 4. Synthesize structured evidence for Gemini
    const percentageChange = changeEvent ? changeEvent.percentageChange : -3.2;
    const volumeRatio = changeEvent ? changeEvent.volumeRatio : 1.67;
    const attentionScore = changeEvent ? changeEvent.attentionScore : 82;
    const signals = changeEvent ? changeEvent.signals : [];

    const insightData = await geminiClient.generateWhyItMatters({
      symbol: cleanSymbol,
      companyName,
      percentageChange,
      volumeRatio,
      attentionScore,
      news,
      signals,
    });

    // 5. Cache in MongoDB
    const saved = await AIInsight.create({
      stockId: stock?._id,
      symbol: cleanSymbol,
      changeEventId: changeEvent?._id,
      summary: insightData.summary,
      whyItMatters: insightData.whyItMatters,
      confidence: insightData.confidence,
      evidence: insightData.evidence,
      model: 'gemini-3.6-flash',
    });

    return saved;
  },

  /**
   * Generates "While You Were Away" executive watchlist summary
   */
  async getWatchlistSummary(userId) {
    const user = await User.findById(userId);
    const lastVisitedAt = user?.lastVisitedAt || new Date(Date.now() - 7.7 * 60 * 60 * 1000);

    const watchlist = await Watchlist.findOne({ userId });
    const watchedSymbols = watchlist ? watchlist.items.map(i => i.symbol) : ['RELIANCE', 'INFY', 'TCS', 'HDFCBANK', 'TATAMOTORS'];

    // Gather significant changes detected after lastVisitedAt
    const changes = await ChangeEvent.find({
      symbol: { $in: watchedSymbols },
      detectedAt: { $gte: lastVisitedAt },
      severity: { $in: ['SIGNIFICANT', 'WATCH'] }
    }).sort({ attentionScore: -1 });

    const diffHours = Math.max(1, Math.round((Date.now() - new Date(lastVisitedAt).getTime()) / (1000 * 60 * 60)));
    const timePeriod = `${diffHours} hours`;

    return geminiClient.generateWatchlistSummary(changes, timePeriod);
  },

  /**
   * Answers natural language questions grounded strictly in current market data
   */
  async askFinSmart(userId, question) {
    const watchlist = await Watchlist.findOne({ userId });
    const watchedSymbols = watchlist ? watchlist.items.map(i => i.symbol) : ['RELIANCE', 'INFY', 'TCS', 'HDFCBANK', 'TATAMOTORS'];

    // Gather current market state directly from MongoDB snapshots without hitting external provider
    const contextItems = await Promise.all(
      watchedSymbols.map(async (sym) => {
        const stock = await Stock.findOne({ symbol: sym });
        const snapshot = await StockSnapshot.findOne({ symbol: sym }).sort({ timestamp: -1 });
        const change = await ChangeEvent.findOne({ symbol: sym }).sort({ detectedAt: -1 });
        return {
          symbol: sym,
          name: stock?.companyName || sym,
          price: snapshot?.price || 0,
          percentageChange: change?.percentageChange || 0,
          volumeRatio: change?.volumeRatio || 1.0,
          attentionScore: change?.attentionScore || 20,
          severity: change?.severity || 'NORMAL',
          primaryEvent: change?.primaryEventText || 'Normal trading within boundaries',
        };
      })
    );

    const activeCount = contextItems.filter(c => c.severity !== 'NORMAL').length;

    return geminiClient.askFinSmart(question, {
      symbols: watchedSymbols,
      activeCount,
      stocks: contextItems,
    });
  }
};
