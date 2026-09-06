import { apiClient } from './api.js';

export const aiApi = {
  async getWhyItMatters(symbol, changeEventId = '') {
    const endpoint = changeEventId 
      ? `/ai/insight/${encodeURIComponent(symbol)}/${changeEventId}`
      : `/ai/insight/${encodeURIComponent(symbol)}`;
    return apiClient.get(endpoint);
  },

  async getWatchlistSummary() {
    return apiClient.get('/ai/watchlist-summary');
  },

  async askFinSmart(question) {
    return apiClient.post('/ai/ask', { question });
  }
};
