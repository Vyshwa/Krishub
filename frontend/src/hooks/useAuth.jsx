import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const API = import.meta.env.VITE_API_URL || '';

const AuthContext = createContext(null);

function decodeJwtPayload(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    return payload;
  } catch { return null; }
}

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(null);
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const refreshTimer = useRef(null);

  const scheduleRefresh = useCallback((token) => {
    if (refreshTimer.current) clearTimeout(refreshTimer.current);
    const payload = decodeJwtPayload(token);
    if (!payload?.exp) return;
    const msUntilExpiry = payload.exp * 1000 - Date.now() - 60000; // refresh 1 min before expiry
    if (msUntilExpiry <= 0) {
      doRefresh();
      return;
    }
    refreshTimer.current = setTimeout(doRefresh, msUntilExpiry);
  }, []);

  const doRefresh = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/auth/refresh-token`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) {
        setAccessToken(null);
        setUser(null);
        setRole(null);
        return;
      }
      const data = await res.json();
      if (data.accessToken) {
        setAccessToken(data.accessToken);
        scheduleRefresh(data.accessToken);
        // Fetch user info with new token
        await fetchMe(data.accessToken);
      }
    } catch {
      setAccessToken(null);
      setUser(null);
      setRole(null);
    }
  }, [scheduleRefresh]);

  const fetchMe = useCallback(async (token) => {
    try {
      const res = await fetch(`${API}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) { setUser(null); setRole(null); return; }
      const data = await res.json();
      setUser(data.user || null);
      setRole(data.role || null);
    } catch {
      setUser(null);
      setRole(null);
    }
  }, []);

  // On mount, try refresh to restore session from httpOnly cookie
  useEffect(() => {
    let mounted = true;
    (async () => {
      // Skip refresh call if user never logged in (avoids 401 in console)
      if (!localStorage.getItem('krishub_sso')) {
        if (mounted) setLoading(false);
        return;
      }
      try {
        const res = await fetch(`${API}/api/auth/refresh-token`, {
          method: 'POST',
          credentials: 'include',
        });
        if (!mounted) return;
        if (res.ok) {
          const data = await res.json();
          if (data.accessToken) {
            setAccessToken(data.accessToken);
            scheduleRefresh(data.accessToken);
            await fetchMe(data.accessToken);
          }
        }
      } catch {}
      if (mounted) setLoading(false);
    })();
    return () => {
      mounted = false;
      if (refreshTimer.current) clearTimeout(refreshTimer.current);
    };
  }, [scheduleRefresh, fetchMe]);

  const login = useCallback(async (emailOrPhone, password) => {
    const res = await fetch(`${API}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ emailOrPhone, password }),
    });
    const ct = res.headers.get('content-type') || '';
    if (!ct.includes('application/json')) throw new Error('Invalid credentials');
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.message || data?.error || 'Invalid credentials');
    setAccessToken(data.accessToken);
    setUser(data.user);
    setRole(data.role);
    if (data.ssoToken) localStorage.setItem('krishub_sso', data.ssoToken);
    scheduleRefresh(data.accessToken);
    return data;
  }, [scheduleRefresh]);

  const register = useCallback(async (payload) => {
    const res = await fetch(`${API}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
    const ct = res.headers.get('content-type') || '';
    if (!ct.includes('application/json')) throw new Error('Registration failed');
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.message || data?.error || 'Registration failed');
    setAccessToken(data.accessToken);
    setUser(data.user);
    setRole(data.role);
    if (data.ssoToken) localStorage.setItem('krishub_sso', data.ssoToken);
    scheduleRefresh(data.accessToken);
    return data;
  }, [scheduleRefresh]);

  const logout = useCallback(async () => {
    if (refreshTimer.current) clearTimeout(refreshTimer.current);
    await fetch(`${API}/api/auth/logout`, { method: 'POST', credentials: 'include' }).catch(() => {});
    localStorage.removeItem('krishub_sso');
    setAccessToken(null);
    setUser(null);
    setRole(null);
  }, []);

  const value = {
    accessToken,
    user,
    role,
    isAdmin: role?.code === 'ADMIN' || role?.code === 'PARAM',
    isAuthenticated: !!user,
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

// Convenience aliases for backwards compat
export function useCurrentUser() {
  const { user, loading } = useAuth();
  return { data: user, isLoading: loading };
}

export function useLogin() {
  const { login } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ emailOrPhone, password }) => login(emailOrPhone, password),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['currentUser'] }),
  });
}

export function useRegister() {
  const { register } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => register(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['currentUser'] }),
  });
}

export function useLogout() {
  const { logout } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => logout(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['currentUser'] }),
  });
}

// Helper: make an authenticated fetch call
export function useAuthFetch() {
  const { accessToken } = useAuth();
  return useCallback(async (url, opts = {}) => {
    const headers = { ...opts.headers };
    if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
    const res = await fetch(url, { ...opts, headers });
    return res;
  }, [accessToken]);
}
