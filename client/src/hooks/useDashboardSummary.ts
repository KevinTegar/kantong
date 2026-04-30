import { useMemo } from 'react';
import { useTransactions } from './useTransactions';

interface SummaryData {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

interface SummaryOptions {
  month?: number;
  year?: number;
}

export function useDashboardSummary(options: SummaryOptions = {}): SummaryData & { isLoading: boolean } {
  const { data: transactions, isLoading } = useTransactions(options);

  return useMemo(() => {
    if (!transactions) {
      return { totalIncome: 0, totalExpense: 0, balance: 0, isLoading };
    }

    const totalIncome = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      isLoading,
    };
  }, [transactions, isLoading]);
}

export function useCategorySpending(options: SummaryOptions = {}): Map<string, number> {
  const { data: transactions } = useTransactions(options);

  return useMemo(() => {
    const spending = new Map<string, number>();
    if (!transactions) return spending;

    for (const tx of transactions) {
      if (tx.type === 'expense' && tx.category_id) {
        const current = spending.get(tx.category_id) || 0;
        spending.set(tx.category_id, current + tx.amount);
      }
    }

    return spending;
  }, [transactions]);
}
