import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { BurnRateResult } from '../types';

export function useBurnRate() {
  return useQuery<BurnRateResult[]>({
    queryKey: ['burnRate'],
    queryFn: async () => {
      const response = await api.get<{ data: BurnRateResult[] }>('/alerts/burn-rate');
      return response.data.data;
    },
    retry: false,
    staleTime: 1000 * 60 * 5,
    enabled: Boolean(import.meta.env.VITE_SUPABASE_URL),
  });
}