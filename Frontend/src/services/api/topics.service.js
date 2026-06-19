import apiClient from './apiClient';

const topicsService = {
  getAll: async (params = {}) => {
    const response = await apiClient.get('/topics', { params });
    return response.data;
  },

  getByName: async (name) => {
    const response = await apiClient.get(`/topics/name/${encodeURIComponent(name)}`);
    return response.data;
  },

  getByCategory: async (category) => {
    const response = await apiClient.get(`/topics/category/${encodeURIComponent(category)}`);
    return response.data;
  },

  getPopular: async () => {
    const response = await apiClient.get('/topics/popular');
    return response.data;
  },

  getTrending: async () => {
    const response = await apiClient.get('/topics/trending');
    return response.data;
  },

  getSingle: async (topicName) => {
    const response = await apiClient.get(`/topics/${encodeURIComponent(topicName)}`);
    return response.data;
  },

  create: async (topicData) => {
    const response = await apiClient.post('/topics', topicData);
    return response.data;
  },

  update: async (topicName, topicData) => {
    const response = await apiClient.patch(`/topics/${encodeURIComponent(topicName)}`, topicData);
    return response.data;
  },

  replace: async (topicName, topicData) => {
    const response = await apiClient.put(`/topics/${encodeURIComponent(topicName)}`, topicData);
    return response.data;
  },

  delete: async (topicName) => {
    const response = await apiClient.delete(`/topics/${encodeURIComponent(topicName)}`);
    return response.data;
  },

  search: async (query) => {
    const response = await apiClient.get('/search/topics', { params: { q: query } });
    return response.data;
  },
};

export default topicsService;
