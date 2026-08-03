import api from './api';

/**
 * Lead service wrapping backend API requests for Lead CRUD and Analytics.
 */
export const leadService = {
  /**
   * Fetch leads list with query parameters.
   * @param {object} params Filters, search terms, pagination and sorting.
   * @returns {Promise<any>} Response data.
   */
  getLeads: async (params) => {
    const response = await api.get('/leads', { params });
    return response.data;
  },

  /**
   * Create a new lead.
   * @param {object} leadData 
   * @returns {Promise<any>} Response data.
   */
  createLead: async (leadData) => {
    const response = await api.post('/leads', leadData);
    return response.data;
  },

  /**
   * Update an existing lead completely.
   * @param {string} id Lead ID.
   * @param {object} leadData New fields.
   * @returns {Promise<any>} Response data.
   */
  updateLead: async (id, leadData) => {
    const response = await api.put(`/leads/${id}`, leadData);
    return response.data;
  },

  /**
   * Update status of a specific lead.
   * @param {string} id Lead ID.
   * @param {string} status New status enum.
   * @returns {Promise<any>} Response data.
   */
  updateLeadStatus: async (id, status) => {
    const response = await api.patch(`/leads/${id}/status`, { status });
    return response.data;
  },

  /**
   * Delete a lead permanently.
   * @param {string} id Lead ID.
   * @returns {Promise<any>} Response data.
   */
  deleteLead: async (id) => {
    const response = await api.delete(`/leads/${id}`);
    return response.data;
  },

  /**
   * Fetch lead statistics summary for widgets.
   * @returns {Promise<any>} Response data.
   */
  getLeadStats: async () => {
    const response = await api.get('/leads/stats/summary');
    return response.data;
  },

  /**
   * Fetch past 6 months lead volume and conversion details for chart reporting.
   * @returns {Promise<any>} Response data.
   */
  getMonthlyStats: async () => {
    const response = await api.get('/leads/stats/monthly');
    return response.data;
  },

  /**
   * Search leads autocomplete helper.
   * @param {string} q Search query.
   * @returns {Promise<any>} Response data.
   */
  searchLeads: async (q) => {
    const response = await api.get('/leads/search', { params: { q } });
    return response.data;
  },
};

export default leadService;
