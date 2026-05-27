import axios from 'axios';

// ─── Axios Instance ───────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
  withCredentials: true,           // Send HTTP-only cookies with every request
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// ─── Request Interceptor ──────────────────────────────────────────────────────
api.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

// ─── Response Interceptor ─────────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 401 Unauthorized → clear local session flag and redirect to login
    if (error.response?.status === 401) {
      sessionStorage.removeItem('user');
      }
    return Promise.reject(error);
  }
);

// ─── Auth Endpoints ───────────────────────────────────────────────────────────
export const authApi = {
  /**
   * Register a new user.
   * @param {{ username: string, email: string, password: string }} data
   */
  register: (data) => api.post('/api/auth/register', data),

  /**
   * Login with email and password.
   * @param {{ email: string, password: string }} data
   */
  login: (data) => api.post('/api/auth/login', data),

  /** Logout — clears HTTP-only cookie on the server. */
  logout: () => api.post('/api/auth/logout'),

  /** Fetch the authenticated user's profile. */
  getProfile: () => api.get('/api/auth/profile'),
};

// ─── Admin Endpoints ──────────────────────────────────────────────────────────
export const adminApi = {
  /** Aggregate statistics (total users, failed logins, locked accounts). */
  getStats: () => api.get('/api/admin/stats'),

  /** Recent authentication / security event logs. */
  getLogs: () => api.get('/api/admin/logs'),

  /** Accounts that are currently locked out. */
  getLockedAccounts: () => api.get('/api/admin/locked-accounts'),
};

export default api;
