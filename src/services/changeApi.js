import { apiClient } from './api.js';

export const changeApi = {
  async getAllChanges() {
    return apiClient.get('/changes');
  },

  async getChangesSinceLastVisit() {
    return apiClient.get('/changes/since-last-visit');
  }
};
