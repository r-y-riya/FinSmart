import axios from 'axios';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

const BASE_URL = 'https://api.twelvedata.com';

// Cooldown timestamp for circuit breaker after 429
let rateLimitedUntil = 0;

// In-flight quote deduplication map: key -> Promise
const inFlightQuotes = new Map();

// Short-term quote cache: key -> { data, timestamp }
const quoteCache = new Map();
const CACHE_TTL_MS = 90 * 1000; // 90 seconds TTL

// Known Indian NSE stocks requiring exchange parameter
const KNOWN_NSE_STOCKS = new Set([
  'TCS', 'RELIANCE', 'TATAMOTORS', 'HDFCBANK', 'INFY',
  'ICICIBANK', 'BHARTIARTL', 'WIPRO', 'SBIN', 'ITC'
]);

/**
 * Normalizes symbol and exchange for Twelve Data API.
 * Correctly handles Indian NSE tickers (TCS, RELIANCE, TATAMOTORS, HDFCBANK, INFY).
 */
export function normalizeSymbolAndExchange(symbol, exchange = null) {
  let cleanSymbol = (symbol || '').trim().toUpperCase();
  let cleanExchange = exchange ? exchange.trim().toUpperCase() : null;

  if (cleanSymbol.includes(':')) {
    const parts = cleanSymbol.split(':');
    cleanSymbol = parts[0].trim();
    cleanExchange = parts[1].trim();
  }

  // Ensure Indian stocks explicitly specify exchange: 'NSE'
  if (!cleanExchange && KNOWN_NSE_STOCKS.has(cleanSymbol)) {
    cleanExchange = 'NSE';
  }

  return { cleanSymbol, cleanExchange };
}

/**
 * Twelve Data REST API Client with throttling, deduplication, and rate-limit circuit breaking
 */
export const twelveDataClient = {
  /**
   * Checks if client is currently in rate-limit cooldown
   */
  isRateLimited() {
    return Date.now() < rateLimitedUntil;
  },

  /**
   * Fetches real-time or delayed quote for a symbol with deduplication and caching
   */
  async getQuote(symbol, exchange = null) {
    if (!env.TWELVE_DATA_API_KEY) {
      logger.warn('[TwelveData] API key not configured, fallback to cached snapshots');
      return { success: false, error: 'NO_API_KEY' };
    }

    const { cleanSymbol, cleanExchange } = normalizeSymbolAndExchange(symbol, exchange);
    const cacheKey = `${cleanSymbol}:${cleanExchange || 'DEFAULT'}`;

    // 1. Check in-memory quote cache
    const cached = quoteCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
      return cached.data;
    }

    // 2. Circuit-breaker check for rate limits (429)
    if (this.isRateLimited()) {
      const remainingSec = Math.ceil((rateLimitedUntil - Date.now()) / 1000);
      logger.warn(`[TwelveData] Rate limit active (${remainingSec}s cooldown). Skipping API request for ${cleanSymbol}.`);
      return { success: false, error: 'RATE_LIMITED', status: 429, isRateLimited: true };
    }

    // 3. In-flight request deduplication (coalesce concurrent requests for same symbol)
    if (inFlightQuotes.has(cacheKey)) {
      return inFlightQuotes.get(cacheKey);
    }

    const fetchPromise = (async () => {
      try {
        const params = {
          symbol: cleanSymbol,
          apikey: env.TWELVE_DATA_API_KEY,
        };
        if (cleanExchange) {
          params.exchange = cleanExchange;
        }

        const response = await axios.get(`${BASE_URL}/quote`, {
          params,
          timeout: 6000,
        });

        const data = response.data;

        // Check for error responses returned with HTTP 200
        if (data && (data.status === 'error' || data.code)) {
          const code = Number(data.code) || 400;
          const msg = data.message || 'Unknown error from Twelve Data';

          if (code === 429 || msg.toLowerCase().includes('api credits')) {
            rateLimitedUntil = Date.now() + 60 * 1000;
            logger.warn(`[TwelveData] 429 Rate limit encountered for ${cleanSymbol}. Pausing requests for 60s.`);
            return { success: false, error: 'RATE_LIMITED', status: 429, message: msg };
          }

          if (code === 404 || msg.toLowerCase().includes('grow or venture plan') || msg.toLowerCase().includes('not found')) {
            logger.warn(`[TwelveData] 404 Symbol/Exchange restricted or not found: ${cleanSymbol} (${cleanExchange || 'none'}). Message: ${msg}`);
            return { success: false, error: 'SYMBOL_NOT_FOUND_OR_RESTRICTED', status: 404, message: msg };
          }

          logger.warn(`[TwelveData] API error for ${cleanSymbol}: ${msg}`);
          return { success: false, error: msg, status: code };
        }

        if (!data || !data.close) {
          return { success: false, error: 'MALFORMED_DATA' };
        }

        const result = {
          success: true,
          data: {
            symbol: data.symbol || cleanSymbol,
            name: data.name || cleanSymbol,
            exchange: data.exchange || cleanExchange || 'NSE',
            currency: data.currency || 'INR',
            price: parseFloat(data.close) || 0,
            open: parseFloat(data.open) || parseFloat(data.close) || 0,
            high: parseFloat(data.high) || parseFloat(data.close) || 0,
            low: parseFloat(data.low) || parseFloat(data.close) || 0,
            previousClose: parseFloat(data.previous_close) || parseFloat(data.close) || 0,
            volume: parseInt(data.volume, 10) || 0,
            averageVolume: parseInt(data.average_volume, 10) || parseInt(data.volume, 10) || 0,
            fiftyTwoWeekHigh: parseFloat(data.fifty_two_week?.high) || 0,
            fiftyTwoWeekLow: parseFloat(data.fifty_two_week?.low) || 0,
            timestamp: data.datetime ? new Date(data.datetime).toISOString() : new Date().toISOString(),
          }
        };

        // Cache successful response
        quoteCache.set(cacheKey, { data: result, timestamp: Date.now() });
        return result;

      } catch (err) {
        const status = err.response?.status;
        const msg = err.response?.data?.message || err.message;

        if (status === 429 || (msg && msg.toLowerCase().includes('api credits'))) {
          rateLimitedUntil = Date.now() + 60 * 1000;
          logger.warn(`[TwelveData] HTTP 429 Rate limit for ${cleanSymbol}. Pausing requests for 60s.`);
          return { success: false, error: 'RATE_LIMITED', status: 429, message: msg };
        }

        if (status === 404) {
          logger.warn(`[TwelveData] HTTP 404 for ${cleanSymbol} (exchange: ${cleanExchange || 'default'}): ${msg}`);
          return { success: false, error: 'SYMBOL_NOT_FOUND_OR_RESTRICTED', status: 404, message: msg };
        }

        logger.error(`[TwelveData] HTTP error fetching quote for ${cleanSymbol}: ${msg}`);
        return { success: false, error: msg, status };
      } finally {
        inFlightQuotes.delete(cacheKey);
      }
    })();

    inFlightQuotes.set(cacheKey, fetchPromise);
    return fetchPromise;
  },

  /**
   * Fetches intraday or daily time series with symbol & exchange normalization
   */
  async getTimeSeries(symbol, interval = '15min', outputsize = 30, exchange = null) {
    if (!env.TWELVE_DATA_API_KEY) {
      return { success: false, error: 'NO_API_KEY' };
    }

    const { cleanSymbol, cleanExchange } = normalizeSymbolAndExchange(symbol, exchange);

    if (this.isRateLimited()) {
      return { success: false, error: 'RATE_LIMITED', status: 429 };
    }

    try {
      const params = {
        symbol: cleanSymbol,
        interval,
        outputsize,
        apikey: env.TWELVE_DATA_API_KEY,
      };
      if (cleanExchange) {
        params.exchange = cleanExchange;
      }

      const response = await axios.get(`${BASE_URL}/time_series`, {
        params,
        timeout: 8000,
      });

      const data = response.data;
      if (data && (data.status === 'error' || data.code)) {
        const code = Number(data.code) || 400;
        const msg = data.message || 'Error from Twelve Data';
        if (code === 429 || msg.toLowerCase().includes('api credits')) {
          rateLimitedUntil = Date.now() + 60 * 1000;
        }
        return { success: false, error: msg, status: code };
      }

      const values = data.values || [];
      const formatted = values.reverse().map(item => ({
        time: item.datetime.split(' ')[1]?.slice(0, 5) || item.datetime,
        price: parseFloat(item.close),
        volume: parseInt(item.volume, 10) || 0,
      }));

      return {
        success: true,
        data: formatted,
      };
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.message || err.message;
      if (status === 429) {
        rateLimitedUntil = Date.now() + 60 * 1000;
      }
      logger.error(`[TwelveData] Time series error for ${cleanSymbol}: ${msg}`);
      return { success: false, error: msg, status };
    }
  },

  /**
   * Searches symbols by query string
   */
  async searchSymbol(query) {
    if (!env.TWELVE_DATA_API_KEY || !query) {
      return { success: false, data: [] };
    }

    if (this.isRateLimited()) {
      return { success: false, data: [], error: 'RATE_LIMITED' };
    }

    try {
      const response = await axios.get(`${BASE_URL}/symbol_search`, {
        params: {
          symbol: query.trim(),
          apikey: env.TWELVE_DATA_API_KEY,
        },
        timeout: 5000,
      });

      const items = response.data?.data || [];
      return {
        success: true,
        data: items.slice(0, 10).map(item => ({
          symbol: item.symbol,
          companyName: item.instrument_name,
          exchange: item.exchange,
          currency: item.currency,
          country: item.country,
        }))
      };
    } catch (err) {
      const status = err.response?.status;
      if (status === 429) {
        rateLimitedUntil = Date.now() + 60 * 1000;
      }
      logger.error(`[TwelveData] Symbol search error: ${err.message}`);
      return { success: false, data: [] };
    }
  }
};
