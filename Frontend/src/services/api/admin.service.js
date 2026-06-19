import apiClient from './apiClient';

const adminService = {
  getDashboard: async () => {
    const response = await apiClient.get('/admin/dashboard');
    return response.data;
  },

  getProblems: async () => {
    const response = await apiClient.get('/admin/problems');
    return response.data;
  },

  getTopics: async () => {
    const response = await apiClient.get('/admin/topics');
    return response.data;
  },

  getSolutions: async () => {
    const response = await apiClient.get('/admin/solutions');
    return response.data;
  },

  getDatasets: async () => {
    const response = await apiClient.get('/admin/datasets');
    return response.data;
  },

  getUsers: async () => {
    const response = await apiClient.get('/admin/users');
    return response.data;
  },

  createUser: async (userData) => {
    const response = await apiClient.post('/admin/users', userData);
    return response.data;
  },

  updateUser: async (userId, userData) => {
    const response = await apiClient.put(`/admin/users/${userId}`, userData);
    return response.data;
  },

  deleteUser: async (userId) => {
    const response = await apiClient.delete(`/admin/users/${userId}`);
    return response.data;
  },
};

export default adminService;
