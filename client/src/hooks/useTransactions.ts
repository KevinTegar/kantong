import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { Transaction, TransactionFormData } from '../types';

interface UseTransactionsOptions {
  month?: number;
  year?: number;
  category_id?: string;
  type?: 'income' | 'expense';
}

export async function fetchTransactions(options: UseTransactionsOptions = {}) {
  const params = new URLSearchParams();
  if (options.month) params.append('month', String(options.month));
  if (options.year) params.append('year', String(options.year));
  if (options.category_id) params.append('category_id', options.category_id);
  if (options.type) params.append('type', options.type);

  const response = await api.get<{ data: Transaction[] }>(`/transactions?${params}`);
  return response.data.data;
}

export function useTransactions(options: UseTransactionsOptions = {}) {
  return useQuery<Transaction[]>({
    queryKey: ['transactions', options],
    queryFn: async () => fetchTransactions(options),
    retry: false,
    enabled: Boolean(import.meta.env.VITE_SUPABASE_URL),
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: TransactionFormData) => {
      const response = await api.post<{ data: Transaction }>('/transactions', data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['transactionMonths'] });
      queryClient.invalidateQueries({ queryKey: ['burnRate'] });
    },
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<TransactionFormData> }) => {
      const response = await api.put<{ data: Transaction }>(`/transactions/${id}`, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['transactionMonths'] });
      queryClient.invalidateQueries({ queryKey: ['burnRate'] });
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/transactions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['transactionMonths'] });
      queryClient.invalidateQueries({ queryKey: ['burnRate'] });
    },
  });
}
