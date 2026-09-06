import axios from 'axios';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

const BASE_URL = 'https://newsapi.org/v2';

export const newsApiClient = {
  /**
   * Fetches news articles for a stock by company name and ticker
   */
  async getArticlesForStock(symbol, companyName) {
    if (!env.NEWS_API_KEY) {
      logger.warn('[NewsAPI] API key not configured, using cached articles');
      return { success: false, data: [] };
    }

    try {
      // Formulate query focusing on financial keywords
      const query = `"${symbol}" OR "${companyName.split(' ')[0]}"`;
      const response = await axios.get(`${BASE_URL}/everything`, {
        params: {
          q: query,
          language: 'en',
          sortBy: 'publishedAt',
          pageSize: 10,
          apiKey: env.NEWS_API_KEY,
        },
        timeout: 6000,
      });

      if (response.data.status !== 'ok') {
        logger.warn(`[NewsAPI] Non-OK status for ${symbol}: ${response.data.message}`);
        return { success: false, data: [] };
      }

      const rawArticles = response.data.articles || [];
      const normalized = rawArticles
        .filter(art => art.title && art.url && !art.title.includes('[Removed]'))
        .map(art => {
          const title = art.title;
          const desc = art.description || '';

          // Calculate simple keyword relevance score (0.0 to 1.0)
          let relevance = 0.5;
          const lowerText = (title + ' ' + desc).toLowerCase();
          const cleanSym = symbol.toLowerCase();
          const cleanName = companyName.toLowerCase().split(' ')[0];

          if (lowerText.includes(cleanSym)) relevance += 0.3;
          if (lowerText.includes(cleanName)) relevance += 0.2;
          if (lowerText.includes('profit') || lowerText.includes('shares') || lowerText.includes('stock') || lowerText.includes('earnings') || lowerText.includes('quarter')) {
            relevance += 0.1;
          }
          relevance = Math.min(1.0, relevance);

          // Determine rough sentiment
          let sentiment = 'NEUTRAL';
          if (lowerText.includes('surges') || lowerText.includes('jump') || lowerText.includes('gain') || lowerText.includes('record high') || lowerText.includes('profit up')) {
            sentiment = 'POSITIVE';
          } else if (lowerText.includes('slumps') || lowerText.includes('drop') || lowerText.includes('fall') || lowerText.includes('plunge') || lowerText.includes('loss')) {
            sentiment = 'NEGATIVE';
          }

          return {
            symbol: symbol.toUpperCase(),
            title: art.title,
            description: art.description,
            url: art.url,
            source: art.source?.name || 'Financial News',
            publishedAt: art.publishedAt ? new Date(art.publishedAt) : new Date(),
            sentiment,
            relevanceScore: parseFloat(relevance.toFixed(2)),
          };
        });

      return { success: true, data: normalized };
    } catch (err) {
      logger.error(`[NewsAPI] Error fetching articles for ${symbol}: ${err.message}`);
      return { success: false, data: [] };
    }
  }
};
