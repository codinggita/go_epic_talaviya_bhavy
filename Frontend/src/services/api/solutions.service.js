import apiClient from './apiClient';

const solutionsService = {
  getAll: async (params = {}) => {
    const response = await apiClient.get('/solutions', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await apiClient.get(`/solutions/${id}`);
    return response.data;
  },

  create: async (solutionData) => {
    const response = await apiClient.post('/solutions', solutionData);
    return response.data;
  },

  update: async (id, solutionData) => {
    const response = await apiClient.patch(`/solutions/${id}`, solutionData);
    return response.data;
  },

  replace: async (id, solutionData) => {
    const response = await apiClient.put(`/solutions/${id}`, solutionData);
    return response.data;
  },

  delete: async (id) => {
    const response = await apiClient.delete(`/solutions/${id}`);
    return response.data;
  },

  search: async (query) => {
    const response = await apiClient.get('/search/solutions', { params: { q: query } });
    return response.data;
  },

  getByTopic: async (topic) => {
    const response = await apiClient.get(`/solutions/topic/${encodeURIComponent(topic)}`);
    return response.data;
  },

  getByDifficulty: async (difficulty) => {
    const response = await apiClient.get(`/solutions/difficulty/${difficulty}`);
    return response.data;
  },

  getBySource: async (source) => {
    const response = await apiClient.get(`/solutions/source/${encodeURIComponent(source)}`);
    return response.data;
  },

  getRandom: async () => {
    const response = await apiClient.get('/solutions/random');
    return response.data;
  },

  getTrending: async () => {
    const response = await apiClient.get('/solutions/trending');
    return response.data;
  },

  getRecent: async () => {
    const response = await apiClient.get('/solutions/recent');
    return response.data;
  },
};

export default solutionsService;
