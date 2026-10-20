import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { Alert } from '../types';

export function useUnreadAlerts() {
  return useQuery<Alert[]>({
    queryKey: ['alerts', 'unread'],
    queryFn: async () => {
      const response = await api.get<{ data: Alert[] }>('/alerts?is_read=false');
      return response.data.data;
    },
    retry: false,
    staleTime: 1000 * 60,
    enabled: Boolean(import.meta.env.VITE_SUPABASE_URL),
  });
}

export function useMarkAlertRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.put(`/alerts/${id}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });
}

export function useMarkAllAlertsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await api.put('/alerts/read-all');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      queryClient.invalidateQueries({ queryKey: ['burnRate'] });
    },
  });
}
