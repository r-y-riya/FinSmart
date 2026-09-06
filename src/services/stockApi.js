import { apiClient } from './api.js';

export const stockApi = {
  async searchStocks(query) {
    return apiClient.get(`/stocks/search?q=${encodeURIComponent(query)}`);
  },

  async getStock(symbol) {
    return apiClient.get(`/stocks/${encodeURIComponent(symbol)}`);
  },

  async getHistory(symbol, interval = '15min', outputsize = 30) {
    return apiClient.get(`/stocks/${encodeURIComponent(symbol)}/history?interval=${interval}&outputsize=${outputsize}`);
  },

  async getNews(symbol) {
    return apiClient.get(`/stocks/${encodeURIComponent(symbol)}/news`);
  },

  async getChanges(symbol) {
    return apiClient.get(`/stocks/${encodeURIComponent(symbol)}/changes`);
  }
};
