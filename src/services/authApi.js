import { apiClient } from './api.js';

export const authApi = {
  async register(name, email, password) {
    return apiClient.post('/auth/register', { name, email, password });
  },

  async login(email, password) {
    return apiClient.post('/auth/login', { email, password });
  },

  async getMe() {
    return apiClient.get('/auth/me');
  },

  async updateLastVisited(timestamp) {
    return apiClient.patch('/auth/visited', { timestamp });
  },

  async updatePreferences(preferences) {
    return apiClient.patch('/auth/preferences', { preferences });
  }
};
