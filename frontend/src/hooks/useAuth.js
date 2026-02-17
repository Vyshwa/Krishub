import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

function apiBase() {
  return import.meta.env.VITE_API_URL || 'http://localhost:5000';
}

export function useCurrentUser() {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      try {
        const res = await fetch(`${apiBase()}/api/auth/me`, {
          credentials: 'include',
        });
        if (!res.ok) return null;
        const data = await res.json().catch(() => null);
        return (data && data.user) || null;
      } catch {
        return null;
      }
    },
    retry: false,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}

export function useLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const res = await fetch(`${apiBase()}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((data && (data.error || data.message)) || 'Invalid credentials');
      return data && data.user ? data.user : data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['currentUser'] });
    },
  });
}

export function useRegister() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const res = await fetch(`${apiBase()}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((data && (data.error || data.message)) || 'Registration failed');
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['currentUser'] });
    },
  });
}

export async function logout() {
  await fetch(`${apiBase()}/api/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await fetch(`${apiBase()}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['currentUser'] });
    },
  });
}
