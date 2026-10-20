import type { ReactNode } from 'react';
import { formatIDR } from '../../lib/formatCurrency';
import Accordion from '../ui/Accordion';
import type { BurnRateResult, Transaction } from '../../types';

interface MonthSummaryAccordionProps {
  transactions: Transaction[];
  burnRateResults: BurnRateResult[];
  className?: string;
}

function SummaryRows({ rows }: { rows: { label: string; value: ReactNode }[] }) {
  return (
    <dl className="space-y-2 text-sm">
      {rows.map((row) => (
        <div key={row.label} className="flex items-start justify-between gap-3">
          <dt className="text-dark-500">{row.label}</dt>
          <dd className="min-w-0 truncate text-right font-medium text-dark-900">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function CountBadge({ count }: { count: number }) {
  return (
    <span className="rounded-full bg-dark-50 px-2 py-0.5 text-[11px] font-medium text-dark-600">{count}</span>
  );
}

function largestOf(transactions: Transaction[]) {
  return transactions.reduce<Transaction | null>(
    (largest, transaction) => (!largest || transaction.amount > largest.amount ? transaction : largest),
    null
  );
}

// Ringkasan bulan dalam accordion, padanan "Pension plan / Devices / Compensation" di Coterie
export default function MonthSummaryAccordion({ transactions, burnRateResults, className = '' }: MonthSummaryAccordionProps) {
  const incomes = transactions.filter((transaction) => transaction.type === 'income');
  const expenses = transactions.filter((transaction) => transaction.type === 'expense');
  const uncategorized = expenses.filter((transaction) => !transaction.category_id);
  const largestIncome = largestOf(incomes);
  const largestExpense = largestOf(expenses);
  const sum = (list: Transaction[]) => list.reduce((total, transaction) => total + transaction.amount, 0);
  const alertCount = (level: BurnRateResult['alert_level']) =>
    burnRateResults.filter((result) => result.alert_level === level).length;
  const activeAlertCount = burnRateResults.filter((result) => result.alert_level !== null).length;

  const items = [
    {
      id: 'expense',
      title: 'Pengeluaran',
      meta: <CountBadge count={expenses.length} />,
      content: (
        <SummaryRows
          rows={[
            { label: 'Total', value: formatIDR(sum(expenses)) },
            { label: 'Terbesar', value: largestExpense ? formatIDR(largestExpense.amount) : '–' },
            { label: 'Untuk', value: largestExpense?.description || largestExpense?.category?.name || '–' },
          ]}
        />
      ),
    },
    {
      id: 'income',
      title: 'Pemasukan',
      meta: <CountBadge count={incomes.length} />,
      content: (
        <SummaryRows
          rows={[
            { label: 'Total', value: formatIDR(sum(incomes)) },
            { label: 'Terbesar', value: largestIncome ? formatIDR(largestIncome.amount) : '–' },
            { label: 'Dari', value: largestIncome?.description || '–' },
          ]}
        />
      ),
    },
    {
      id: 'alerts',
      title: 'Burn rate alert',
      meta: <CountBadge count={activeAlertCount} />,
      content: (
        <SummaryRows
          rows={[
            { label: 'Darurat', value: alertCount('DANGER') },
            { label: 'Peringatan', value: alertCount('WARNING') },
            { label: 'Watch', value: alertCount('WATCH') },
          ]}
        />
      ),
    },
    {
      id: 'uncategorized',
      title: 'Tanpa kategori',
      meta: <CountBadge count={uncategorized.length} />,
      content: (
        <SummaryRows
          rows={[
            { label: 'Transaksi', value: uncategorized.length },
            { label: 'Total', value: formatIDR(sum(uncategorized)) },
          ]}
        />
      ),
    },
  ];

  return (
    <div data-reveal className={`card px-5 py-2 ${className}`}>
      <Accordion items={items} defaultOpenId="expense" />
    </div>
  );
}
