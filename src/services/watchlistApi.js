import { apiClient } from './api.js';

export const watchlistApi = {
  async getWatchlist() {
    return apiClient.get('/watchlist');
  },

  async getAllWatchlists() {
    return apiClient.get('/watchlist/all');
  },

  async addStock(symbol, companyName, exchange = 'NSE') {
    return apiClient.post('/watchlist/default/stocks', { symbol, companyName, exchange });
  },

  async removeStock(symbol) {
    return apiClient.delete(`/watchlist/default/stocks/${symbol}`);
  }
};
