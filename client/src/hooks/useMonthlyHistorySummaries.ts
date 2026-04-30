import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import { formatPeriodLabel } from '../lib/period';
import { fetchTransactions } from './useTransactions';
import { useAvailableMonths } from './useAvailableMonths';
import { useSelectedPeriod } from './useSelectedPeriod';

interface MonthlyHistorySummary {
  month: number;
  year: number;
  label: string;
  transactionCount: number;
  totalIncome: number;
  totalExpense: number;
  balance: number;
  isActive: boolean;
  compareToLabel: string | null;
  expenseDelta: number | null;
  balanceDelta: number | null;
}

export function useMonthlyHistorySummaries(limit = 3) {
  const { data: availableMonths, isLoading: isMonthsLoading } = useAvailableMonths();
  const { month, year } = useSelectedPeriod();

  const orderedPeriods = useMemo(() => {
    if (!availableMonths || availableMonths.length === 0) return [];

    const selectedIndex = availableMonths.findIndex((period) => period.month === month && period.year === year);
    return selectedIndex >= 0
      ? [availableMonths[selectedIndex], ...availableMonths.filter((_, index) => index !== selectedIndex)]
      : availableMonths;
  }, [availableMonths, limit, month, year]);

  const periods = useMemo(() => orderedPeriods.slice(0, limit), [limit, orderedPeriods]);
  const comparisonPeriods = useMemo(() => orderedPeriods.slice(0, limit + 1), [limit, orderedPeriods]);

  const monthlyQueries = useQueries({
    queries: comparisonPeriods.map((period) => ({
      queryKey: ['transactions', { month: period.month, year: period.year }],
      queryFn: async () => fetchTransactions({ month: period.month, year: period.year }),
      retry: false,
      staleTime: 1000 * 60,
      enabled: Boolean(import.meta.env.VITE_SUPABASE_URL),
    })),
  });

  const summaries = useMemo<MonthlyHistorySummary[]>(() => (
    periods.map((period, index) => {
      const transactions = monthlyQueries[index]?.data ?? [];
      const sourceIndex = (availableMonths ?? []).findIndex(
        (item) => item.month === period.month && item.year === period.year
      );
      const previousPeriod = sourceIndex >= 0 ? availableMonths?.[sourceIndex + 1] : undefined;
      const previousTransactions = previousPeriod
        ? monthlyQueries[comparisonPeriods.findIndex((item) => item.month === previousPeriod.month && item.year === previousPeriod.year)]?.data
        : undefined;

      const totalIncome = transactions
        .filter((transaction) => transaction.type === 'income')
        .reduce((sum, transaction) => sum + transaction.amount, 0);

      const totalExpense = transactions
        .filter((transaction) => transaction.type === 'expense')
        .reduce((sum, transaction) => sum + transaction.amount, 0);

      const previousIncome = (previousTransactions ?? [])
        .filter((transaction) => transaction.type === 'income')
        .reduce((sum, transaction) => sum + transaction.amount, 0);

      const previousExpense = (previousTransactions ?? [])
        .filter((transaction) => transaction.type === 'expense')
        .reduce((sum, transaction) => sum + transaction.amount, 0);

      const currentBalance = totalIncome - totalExpense;
      const previousBalance = previousIncome - previousExpense;

      return {
        month: period.month,
        year: period.year,
        label: formatPeriodLabel(period),
        transactionCount: period.transaction_count,
        totalIncome,
        totalExpense,
        balance: currentBalance,
        isActive: period.month === month && period.year === year,
        compareToLabel: previousPeriod ? formatPeriodLabel(previousPeriod) : null,
        expenseDelta: previousPeriod ? totalExpense - previousExpense : null,
        balanceDelta: previousPeriod ? currentBalance - previousBalance : null,
      };
    })
  ), [availableMonths, comparisonPeriods, month, monthlyQueries, periods, year]);

  return {
    summaries,
    hasHistory: (availableMonths?.length ?? 0) > 0,
    isLoading: isMonthsLoading || monthlyQueries.some((query) => query.isLoading),
  };
}
