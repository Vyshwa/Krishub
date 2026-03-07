import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useSubmitContactForm() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ name, email, message }) => {
      const base = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${base}/api/contact-forms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
      });
      if (!res.ok) {
        throw new Error('Failed to submit');
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contactForms'] });
    },
  });
}

export function useGetAllContactForms() {
  return useQuery({
    queryKey: ['contactForms'],
    queryFn: async () => {
      const base = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${base}/api/contact-forms`);
      if (!res.ok) return [];
      return await res.json();
    },
    enabled: true,
  });
}

export function useGetCallerUserProfile() {
  const query = useQuery({
    queryKey: ['currentUserProfile'],
    queryFn: async () => null,
    enabled: false,
    retry: false,
  });
  return {
    ...query,
    isLoading: query.isLoading,
    isFetched: query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profile) => profile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useIsCallerAdmin() {
  return useQuery({
    queryKey: ['isAdmin'],
    queryFn: async () => false,
    enabled: false,
  });
}
