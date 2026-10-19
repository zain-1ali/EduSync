import { ACCESS_LEVELS, hasRequiredAccess } from '@school/contracts';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { apiClient, clearStoredSession } from '../api/axiosClient';

const AuthContext = createContext(null);
const OFFLINE_SESSION_MAX_AGE_MS = 24 * 60 * 60 * 1_000;

function readStoredSession() {
  try {
    const token = localStorage.getItem('edusync_token');
    const rawUser = localStorage.getItem('edusync_user');
    return {
      token,
      user: rawUser ? JSON.parse(rawUser) : null,
      verifiedAt: Number(localStorage.getItem('edusync_session_verified_at')) || 0,
    };
  } catch {
    return { token: null, user: null };
  }
}

function persistSession(token, user) {
  try {
    localStorage.setItem('edusync_token', token);
    localStorage.setItem('edusync_user', JSON.stringify(user));
    localStorage.setItem('edusync_session_verified_at', String(Date.now()));
  } catch {
    // In-memory auth remains available when persistent storage is blocked.
  }
}

export function AuthProvider({ children }) {
  const [session, setSessionState] = useState(readStoredSession);
  const [status, setStatus] = useState('loading');
  const [offlineSession, setOfflineSession] = useState(false);

  const setSession = useCallback((token, user) => {
    persistSession(token, user);
    setSessionState({ token, user });
    setStatus('authenticated');
    setOfflineSession(false);
  }, []);

  const clearSession = useCallback(() => {
    clearStoredSession();
    setSessionState({ token: null, user: null });
    setStatus('anonymous');
    setOfflineSession(false);
  }, []);

  useEffect(() => {
    let active = true;

    async function bootstrap() {
      const initialSession = readStoredSession();
      try {
        if (initialSession.token) {
          const response = await apiClient.get('/auth/me');
          if (!active) return;
          setSession(initialSession.token, response.data.data.user);
          return;
        }

        const response = await apiClient.post('/auth/refresh', {});
        if (!active) return;
        setSession(
          response.data.accessToken || response.data.token,
          response.data.data.user
        );
      } catch (error) {
        const cachedSessionIsUsable =
          !error.response &&
          globalThis.navigator?.onLine === false &&
          initialSession.token &&
          initialSession.user &&
          Date.now() - initialSession.verifiedAt <= OFFLINE_SESSION_MAX_AGE_MS;
        if (active && cachedSessionIsUsable) {
          setSessionState({ token: initialSession.token, user: initialSession.user });
          setOfflineSession(true);
          setStatus('authenticated');
        } else if (active) {
          clearSession();
        }
      }
    }

    bootstrap();
    return () => {
      active = false;
    };
  }, [clearSession, setSession]);

  useEffect(() => {
    const handleSession = (event) => {
      if (event.detail?.token && event.detail?.user) {
        persistSession(event.detail.token, event.detail.user);
        setSessionState(event.detail);
        setStatus('authenticated');
        setOfflineSession(false);
      } else {
        setSessionState({ token: null, user: null });
        setStatus('anonymous');
        setOfflineSession(false);
      }
    };
    window.addEventListener('edusync:session', handleSession);
    return () => window.removeEventListener('edusync:session', handleSession);
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const hasAccess = useCallback(
    (moduleName, required = ACCESS_LEVELS.VIEW) => {
      const user = session.user;
      if (!user) return false;
      if (user.role === 'super_admin' || user.role === 'school_admin') return true;
      return hasRequiredAccess(user.permissions?.[moduleName], required);
    },
    [session.user]
  );

  const value = useMemo(
    () => ({
      ...session,
      status,
      isAuthenticated: status === 'authenticated',
      setSession,
      clearSession,
      logout,
      hasAccess,
      offlineSession,
    }),
    [session, status, setSession, clearSession, logout, hasAccess, offlineSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
