import api from './api';

export const customerService = {
  getCustomers: async (params) => (await api.get('/customers', { params })).data,
  getCustomerById: async (id) => (await api.get(`/customers/${id}`)).data,
  createCustomer: async (data) => (await api.post('/customers', data)).data,
  updateCustomer: async (id, data) => (await api.put(`/customers/${id}`, data)).data,
  deleteCustomer: async (id) => (await api.delete(`/customers/${id}`)).data,
};

export const taskService = {
  getTasks: async (params) => (await api.get('/tasks', { params })).data,
  createTask: async (data) => (await api.post('/tasks', data)).data,
  updateTask: async (id, data) => (await api.put(`/tasks/${id}`, data)).data,
  updateTaskStatus: async (id, status) =>
    (await api.patch(`/tasks/${id}/status`, { status })).data,
  deleteTask: async (id) => (await api.delete(`/tasks/${id}`)).data,
};

export const userService = {
  getTeamMembers: async () => (await api.get('/users/team')).data,
  getUsers: async (params) => (await api.get('/users', { params })).data,
  createUser: async (data) => (await api.post('/users', data)).data,
  updateUser: async (id, data) => (await api.put(`/users/${id}`, data)).data,
  deleteUser: async (id) => (await api.delete(`/users/${id}`)).data,
};

export const analyticsService = {
  getOverview: async (params) => (await api.get('/analytics/overview', { params })).data,
};

export const activityService = {
  getActivities: async (params) => (await api.get('/activities', { params })).data,
};

export const notificationService = {
  getNotifications: async (params) => (await api.get('/notifications', { params })).data,
  markAsRead: async (id) => (await api.patch(`/notifications/${id}/read`)).data,
  markAllAsRead: async () => (await api.patch('/notifications/read-all')).data,
  deleteNotification: async (id) => (await api.delete(`/notifications/${id}`)).data,
};

export const settingsService = {
  getSettings: async () => (await api.get('/settings')).data,
  updateSettings: async (data) => (await api.put('/settings', data)).data,
};
