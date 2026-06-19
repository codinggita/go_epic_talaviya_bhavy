import axios from 'axios';

// Detect host to dynamically switch between local developer backend and Render deployment fallback
const API_BASE_URL = 
  import.meta.env.VITE_API_URL || 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/api/v1' 
    : 'https://go-epic-project.onrender.com/api/v1');

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to append authorization token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('go_epic_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to intercept auth expiration or server issues
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Check if unauthorized and token refresh is possible
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshTokenValue = localStorage.getItem('go_epic_refresh_token');
      
      if (refreshTokenValue) {
        try {
          // Attempt token refresh
          const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
            refreshToken: refreshTokenValue,
          });
          
          if (response.data?.token) {
            localStorage.setItem('go_epic_token', response.data.token);
            originalRequest.headers.Authorization = `Bearer ${response.data.token}`;
            return apiClient(originalRequest);
          }
        } catch (refreshErr) {
          // Refresh token expired or invalid, log user out
          localStorage.removeItem('go_epic_token');
          localStorage.removeItem('go_epic_refresh_token');
          localStorage.removeItem('go_epic_user');
          window.location.href = '/login';
        }
      }
    }
    
    // Uniform API Error structure
    const errorData = {
      message: error.response?.data?.message || error.message || 'Something went wrong.',
      status: error.response?.status,
      errors: error.response?.data?.errors || null,
    };
    
    return Promise.reject(errorData);
  }
);

export default apiClient;
export { API_BASE_URL };
