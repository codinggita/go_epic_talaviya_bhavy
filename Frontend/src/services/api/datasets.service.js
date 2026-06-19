import apiClient from './apiClient';

const datasetsService = {
  getAll: async (params = {}) => {
    const response = await apiClient.get('/datasets', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await apiClient.get(`/datasets/${id}`);
    return response.data;
  },

  create: async (datasetData) => {
    const response = await apiClient.post('/datasets', datasetData);
    return response.data;
  },

  update: async (id, datasetData) => {
    const response = await apiClient.patch(`/datasets/${id}`, datasetData);
    return response.data;
  },

  replace: async (id, datasetData) => {
    const response = await apiClient.put(`/datasets/${id}`, datasetData);
    return response.data;
  },

  delete: async (id) => {
    const response = await apiClient.delete(`/datasets/${id}`);
    return response.data;
  },

  search: async (query) => {
    const response = await apiClient.get('/search/datasets', { params: { q: query } });
    return response.data;
  },

  getBySource: async (source) => {
    const response = await apiClient.get(`/datasets/source/${encodeURIComponent(source)}`);
    return response.data;
  },

  getByTopic: async (topic) => {
    const response = await apiClient.get(`/datasets/topic/${encodeURIComponent(topic)}`);
    return response.data;
  },

  getByDifficulty: async (difficulty) => {
    const response = await apiClient.get(`/datasets/difficulty/${difficulty}`);
    return response.data;
  },

  getRecent: async () => {
    const response = await apiClient.get('/datasets/recent');
    return response.data;
  },

  getLatest: async () => {
    const response = await apiClient.get('/datasets/latest');
    return response.data;
  },
};

export default datasetsService;
