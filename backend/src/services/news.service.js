import { NewsArticle } from '../models/NewsArticle.js';
import { Stock } from '../models/Stock.js';
import { newsApiClient } from '../integrations/newsApi.client.js';
import { logger } from '../utils/logger.js';

export const newsService = {
  /**
   * Retrieves relevant news for a stock with MongoDB caching & deduplication
   */
  async getNewsForStock(symbol) {
    const cleanSymbol = symbol.trim().toUpperCase();

    // 1. Check MongoDB for cached articles within the last 4 hours
    const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000);
    const cachedArticles = await NewsArticle.find({
      symbol: cleanSymbol,
      createdAt: { $gte: fourHoursAgo }
    }).sort({ publishedAt: -1 }).limit(6);

    if (cachedArticles.length >= 2) {
      return cachedArticles;
    }

    // 2. Fetch fresh articles from NewsAPI
    const stock = await Stock.findOne({ symbol: cleanSymbol });
    const companyName = stock?.companyName || cleanSymbol;

    const res = await newsApiClient.getArticlesForStock(cleanSymbol, companyName);

    if (res.success && res.data?.length > 0) {
      // Upsert into MongoDB without duplicating URLs
      for (const item of res.data) {
        try {
          await NewsArticle.updateOne(
            { url: item.url },
            {
              $set: {
                stockId: stock?._id,
                symbol: cleanSymbol,
                title: item.title,
                description: item.description,
                source: item.source,
                publishedAt: item.publishedAt,
                sentiment: item.sentiment,
                relevanceScore: item.relevanceScore,
              }
            },
            { upsert: true }
          );
        } catch (e) {
          // Ignore duplicate key collision
        }
      }
    }

    // Return latest articles from MongoDB
    return NewsArticle.find({ symbol: cleanSymbol })
      .sort({ publishedAt: -1 })
      .limit(6);
  }
};
