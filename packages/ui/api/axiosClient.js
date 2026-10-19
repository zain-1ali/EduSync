import axios from 'axios';

export const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const apiClient = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'x-edusync-client': '1',
  },
});

function readToken() {
  try {
    return localStorage.getItem('edusync_token');
  } catch {
    return null;
  }
}

function updateStoredSession(payload) {
  const token = payload?.accessToken || payload?.token;
  const user = payload?.data?.user;
  try {
    if (token) localStorage.setItem('edusync_token', token);
    if (user) localStorage.setItem('edusync_user', JSON.stringify(user));
  } catch {
    // The auth provider still receives the in-memory session event.
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('edusync:session', {
        detail: token && user ? { token, user } : null,
      })
    );
  }
}

export function clearStoredSession(reason) {
  try {
    localStorage.removeItem('edusync_token');
    localStorage.removeItem('edusync_user');
    localStorage.removeItem('edusync_session_verified_at');
    if (reason === 'expired') {
      sessionStorage.setItem(
        'edusync_session_notice',
        'Your session expired. Sign in again to continue.'
      );
    }
  } catch {
    // Storage may be unavailable; in-memory session state is still cleared.
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('edusync:session', { detail: null }));
  }
}

apiClient.interceptors.request.use((config) => {
  const token = readToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshPromise;

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const path = String(original?.url || '');
    const isSessionEndpoint =
      path.includes('/auth/login') ||
      path.includes('/auth/refresh') ||
      path.includes('/auth/setup-password') ||
      path.includes('/auth/reset-password');

    if (error.response?.status !== 401 || original?._edusyncRetry || isSessionEndpoint) {
      return Promise.reject(error);
    }

    original._edusyncRetry = true;
    try {
      refreshPromise ||= axios
        .post(
          `${apiBaseUrl}/auth/refresh`,
          {},
          { withCredentials: true, headers: { 'x-edusync-client': '1' } }
        )
        .finally(() => {
          refreshPromise = null;
        });
      const response = await refreshPromise;
      updateStoredSession(response.data);
      original.headers = original.headers || {};
      original.headers.Authorization = `Bearer ${response.data.accessToken || response.data.token}`;
      return apiClient(original);
    } catch (refreshError) {
      clearStoredSession('expired');
      return Promise.reject(refreshError);
    }
  }
);