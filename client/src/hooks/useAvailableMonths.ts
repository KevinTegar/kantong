import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { AvailableMonth } from '../types';

export function useAvailableMonths() {
  return useQuery<AvailableMonth[]>({
    queryKey: ['transactionMonths'],
    queryFn: async () => {
      const response = await api.get<{ data: AvailableMonth[] }>('/transactions/available-months');
      return response.data.data;
    },
    retry: false,
    staleTime: 1000 * 60 * 5,
    enabled: Boolean(import.meta.env.VITE_SUPABASE_URL),
  });
}
