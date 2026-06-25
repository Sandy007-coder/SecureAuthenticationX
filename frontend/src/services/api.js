import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    if (status === 401) {
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

const AUTH_ROUTES = {
  REGISTER: '/api/auth/register',
  LOGIN: '/api/auth/login',
  LOGOUT: '/api/auth/logout',
  PROFILE: '/api/auth/profile',
  UPDATE_PROFILE: '/api/auth/profile',
  CHANGE_PASSWORD: '/api/auth/change-password',
};

const ADMIN_ROUTES = {
  STATS: '/api/admin/stats',
  LOGS: '/api/admin/logs',
  LOCKED_ACCOUNTS: '/api/admin/locked-accounts',
  UNLOCK: (userId) => `/api/admin/unlock/${userId}`,
  USERS: '/api/admin/users',
  USER_ROLE: (userId) => `/api/admin/users/${userId}/role`,
  USER_STATUS: (userId) => `/api/admin/users/${userId}/status`,
};

export const authApi = {
  register(payload) {
    return api.post(AUTH_ROUTES.REGISTER, payload);
  },

  login(credentials) {
    return api.post(AUTH_ROUTES.LOGIN, credentials);
  },

  logout() {
    return api.post(AUTH_ROUTES.LOGOUT);
  },

  getProfile() {
    return api.get(AUTH_ROUTES.PROFILE);
  },

  updateProfile(payload) {
    return api.patch(AUTH_ROUTES.UPDATE_PROFILE, payload);
  },

  changePassword(payload) {
    return api.post(AUTH_ROUTES.CHANGE_PASSWORD, payload);
  },
};

export const adminApi = {
  getStats() {
    return api.get(ADMIN_ROUTES.STATS);
  },

  getLogs(params = {}) {
    return api.get(ADMIN_ROUTES.LOGS, { params });
  },

  getLockedAccounts() {
    return api.get(ADMIN_ROUTES.LOCKED_ACCOUNTS);
  },

  unlockAccount(userId) {
    return api.post(ADMIN_ROUTES.UNLOCK(userId));
  },

  listUsers() {
    return api.get(ADMIN_ROUTES.USERS);
  },

  updateUserRole(userId, role) {
    return api.patch(ADMIN_ROUTES.USER_ROLE(userId), { role });
  },

  updateUserStatus(userId, isActive) {
    return api.patch(ADMIN_ROUTES.USER_STATUS(userId), { is_active: isActive });
  },
};

export default api;