import { apiClient } from './api.js';

export const demoApi = {
  async simulateMovement(symbol, percentageChange, volumeMultiplier = 1.67) {
    return apiClient.post('/demo/simulate-movement', {
      symbol,
      percentageChange,
      volumeMultiplier,
    });
  },

  async toggleOutage() {
    return apiClient.post('/demo/simulate-outage');
  },

  async getOutageStatus() {
    return apiClient.get('/demo/outage-status');
  },

  async seedDatabase() {
    return apiClient.post('/demo/seed');
  }
};
