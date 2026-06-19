import apiClient from './apiClient';

const authService = {
  login: async (credentials) => {
    const response = await apiClient.post('/auth/login', credentials);
    if (response.data?.token) {
      localStorage.setItem('go_epic_token', response.data.token);
      if (response.data.refreshToken) {
        localStorage.setItem('go_epic_refresh_token', response.data.refreshToken);
      }
      localStorage.setItem('go_epic_user', JSON.stringify(response.data.user || response.data.data?.user || response.data));
    }
    return response.data;
  },

  register: async (userData) => {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  },

  logout: async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (e) {
      console.warn('Logout request failed, clearing local tokens anyway', e);
    }
    localStorage.removeItem('go_epic_token');
    localStorage.removeItem('go_epic_refresh_token');
    localStorage.removeItem('go_epic_user');
  },

  getProfile: async () => {
    const response = await apiClient.get('/auth/profile');
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await apiClient.patch('/auth/profile', profileData);
    if (response.data?.user) {
      const currentUser = JSON.parse(localStorage.getItem('go_epic_user') || '{}');
      localStorage.setItem(
        'go_epic_user',
        JSON.stringify({ ...currentUser, ...response.data.user })
      );
    }
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await apiClient.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (resetData) => {
    const response = await apiClient.post('/auth/reset-password', resetData);
    return response.data;
  },
};

export default authService;
