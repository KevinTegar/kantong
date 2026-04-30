import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { BurnRateResult } from '../types';

interface UseBurnRateOptions {
  month?: number;
  year?: number;
}

export function useBurnRate(options: UseBurnRateOptions = {}) {
  return useQuery<BurnRateResult[]>({
    queryKey: ['burnRate', options],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (options.month) params.append('month', String(options.month));
      if (options.year) params.append('year', String(options.year));

      const response = await api.get<{ data: BurnRateResult[] }>(`/alerts/burn-rate?${params}`);
      return response.data.data;
    },
    retry: false,
    staleTime: 1000 * 60 * 5,
    enabled: Boolean(import.meta.env.VITE_SUPABASE_URL),
  });
}
