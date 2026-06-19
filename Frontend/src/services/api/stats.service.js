import apiClient from './apiClient';

const statsService = {
  getProblemsStats: async () => {
    const response = await apiClient.get('/stats/problems');
    return response.data;
  },

  getTopicsStats: async () => {
    const response = await apiClient.get('/stats/topics');
    return response.data;
  },

  getDatasetsStats: async () => {
    const response = await apiClient.get('/stats/datasets');
    return response.data;
  },

  getTotalSolutions: async () => {
    const response = await apiClient.get('/stats/total-solutions');
    return response.data;
  },

  getAdvancedProblemsStats: async () => {
    const response = await apiClient.get('/stats/advanced-problems');
    return response.data;
  },

  getTopicStats: async (topic) => {
    const response = await apiClient.get(`/stats/topic/${encodeURIComponent(topic)}`);
    return response.data;
  },

  getSourceStats: async (source) => {
    const response = await apiClient.get(`/stats/source/${encodeURIComponent(source)}`);
    return response.data;
  },

  getDifficultiesStats: async () => {
    const response = await apiClient.get('/stats/difficulties');
    return response.data;
  },
};

export default statsService;
