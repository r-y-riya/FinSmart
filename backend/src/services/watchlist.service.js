import { Watchlist } from '../models/Watchlist.js';
import { Stock } from '../models/Stock.js';
import { marketService } from './market.service.js';

export const watchlistService = {
  /**
   * Retrieves or creates default watchlist for a user
   */
  async getWatchlists(userId) {
    let watchlists = await Watchlist.find({ userId });
    if (!watchlists.length) {
      const defaultWatchlist = await Watchlist.create({
        userId,
        name: 'My Watchlist',
        items: [
          { symbol: 'RELIANCE', companyName: 'Reliance Industries Ltd.', exchange: 'NSE' },
          { symbol: 'INFY', companyName: 'Infosys Limited', exchange: 'NSE' },
          { symbol: 'TCS', companyName: 'Tata Consultancy Services', exchange: 'NSE' },
          { symbol: 'HDFCBANK', companyName: 'HDFC Bank Limited', exchange: 'NSE' },
          { symbol: 'TATAMOTORS', companyName: 'Tata Motors Limited', exchange: 'NSE' },
        ],
      });
      watchlists = [defaultWatchlist];
    }
    return watchlists;
  },

  /**
   * Retrieves single watchlist populated with latest market data
   */
  async getWatchlistWithMarketData(userId, watchlistId = null) {
    let query = { userId };
    if (watchlistId) {
      query._id = watchlistId;
    }

    let watchlist = await Watchlist.findOne(query);
    if (!watchlist) {
      const all = await this.getWatchlists(userId);
      watchlist = all[0];
    }

    // Populate each item with latest market snapshot & change analysis
    const itemsWithData = await Promise.all(
      watchlist.items.map(async (item) => {
        const marketData = await marketService.getStockData(item.symbol);
        return {
          symbol: item.symbol,
          companyName: item.companyName || marketData.stock.companyName,
          exchange: item.exchange || marketData.stock.exchange,
          addedAt: item.addedAt,
          currentPrice: marketData.snapshot.price,
          previousClose: marketData.snapshot.previousClose,
          dayHigh: marketData.snapshot.high,
          dayLow: marketData.snapshot.low,
          volume: marketData.snapshot.volume,
          averageVolume: marketData.snapshot.averageVolume,
          lastUpdated: marketData.snapshot.timestamp,
          freshness: marketData.freshness,
        };
      })
    );

    return {
      _id: watchlist._id,
      name: watchlist.name,
      userId: watchlist.userId,
      items: itemsWithData,
      createdAt: watchlist.createdAt,
      updatedAt: watchlist.updatedAt,
    };
  },

  /**
   * Adds a stock to a watchlist with duplicate prevention
   */
  async addStock(userId, watchlistId, { symbol, companyName, exchange = 'NSE' }) {
    const cleanSymbol = symbol.trim().toUpperCase();

    let watchlist;
    if (watchlistId) {
      watchlist = await Watchlist.findOne({ _id: watchlistId, userId });
    } else {
      watchlist = await Watchlist.findOne({ userId });
    }

    if (!watchlist) {
      watchlist = await Watchlist.create({
        userId,
        name: 'My Watchlist',
        items: [],
      });
    }

    // Check duplicate
    const exists = watchlist.items.some(i => i.symbol === cleanSymbol);
    if (exists) {
      const err = new Error(`${cleanSymbol} is already in your watchlist.`);
      err.statusCode = 400;
      throw err;
    }

    // Ensure stock exists in Stock collection
    let stock = await Stock.findOne({ symbol: cleanSymbol });
    if (!stock) {
      stock = await Stock.create({
        symbol: cleanSymbol,
        companyName: companyName || cleanSymbol,
        exchange,
      });
    }

    watchlist.items.unshift({
      symbol: cleanSymbol,
      companyName: companyName || stock.companyName,
      exchange,
      addedAt: new Date(),
    });

    await watchlist.save();
    return watchlist;
  },

  /**
   * Removes a stock from watchlist
   */
  async removeStock(userId, watchlistId, symbol) {
    const cleanSymbol = symbol.trim().toUpperCase();
    let query = { userId };
    if (watchlistId) {
      query._id = watchlistId;
    }

    const watchlist = await Watchlist.findOne(query);
    if (!watchlist) {
      const err = new Error('Watchlist not found');
      err.statusCode = 404;
      throw err;
    }

    watchlist.items = watchlist.items.filter(i => i.symbol !== cleanSymbol);
    await watchlist.save();
    return watchlist;
  }
};
