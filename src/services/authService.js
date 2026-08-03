import api from './api';

/**
 * Authentication service wrapping API requests for User sessions.
 */
export const authService = {
  /**
   * Register a new user.
   * @param {string} name 
   * @param {string} email 
   * @param {string} password 
   * @returns {Promise<any>} The server response body.
   */
  register: async (name, email, password) => {
    const response = await api.post('/auth/register', { name, email, password });
    return response.data;
  },

  /**
   * Login an existing user.
   * @param {string} email 
   * @param {string} password 
   * @returns {Promise<any>} The server response body.
   */
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  /**
   * Logout user by clearing credentials.
   * Server is stateless, so we hit optional logout endpoint and clear local storage.
   */
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // Ignore errors on logout endpoint
    } finally {
      localStorage.removeItem('crm-token');
    }
  },

  /**
   * Fetch current user profile.
   * @returns {Promise<any>} The server response body.
   */
  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  /**
   * Update current user profile fields.
   * @param {object} data Fields to update (e.g. name, oldPassword, newPassword)
   * @returns {Promise<any>} The server response body.
   */
  updateProfile: async (data) => {
    const response = await api.put('/auth/profile', data);
    return response.data;
  },
};

export default authService;
