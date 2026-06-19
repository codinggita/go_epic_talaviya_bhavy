import apiClient from './apiClient';

const problemsService = {
  getAll: async (params = {}) => {
    const response = await apiClient.get('/problems', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await apiClient.get(`/problems/${id}`);
    return response.data;
  },

  create: async (problemData) => {
    const response = await apiClient.post('/problems', problemData);
    return response.data;
  },

  update: async (id, problemData) => {
    const response = await apiClient.patch(`/problems/${id}`, problemData);
    return response.data;
  },

  replace: async (id, problemData) => {
    const response = await apiClient.put(`/problems/${id}`, problemData);
    return response.data;
  },

  delete: async (id) => {
    const response = await apiClient.delete(`/problems/${id}`);
    return response.data;
  },

  search: async (query) => {
    const response = await apiClient.get('/search/problems', { params: { q: query } });
    return response.data;
  },

  getByTopic: async (topic) => {
    const response = await apiClient.get(`/problems/topic/${encodeURIComponent(topic)}`);
    return response.data;
  },

  getByDifficulty: async (difficulty) => {
    const response = await apiClient.get(`/problems/difficulty/${difficulty}`);
    return response.data;
  },

  getBySource: async (source) => {
    const response = await apiClient.get(`/problems/source/${encodeURIComponent(source)}`);
    return response.data;
  },

  getRandom: async () => {
    const response = await apiClient.get('/problems/random');
    return response.data;
  },

  getTrending: async () => {
    const response = await apiClient.get('/problems/trending');
    return response.data;
  },

  getRecent: async () => {
    const response = await apiClient.get('/problems/recent');
    return response.data;
  },

  getAdvanced: async () => {
    const response = await apiClient.get('/problems/advanced');
    return response.data;
  },

  importJson: async (problemsList) => {
    const response = await apiClient.post('/problems/import-json', { problems: problemsList });
    return response.data;
  },
};

export default problemsService;
