import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useSelectedPeriod } from '../../hooks/useSelectedPeriod';
import { useTransactions } from '../../hooks/useTransactions';
import { formatIDR, formatIDRCompact } from '../../lib/formatCurrency';
import ChartSurface from './ChartSurface';
import PanelHeader from '../ui/PanelHeader';
import { chartColors, chartTooltipProps } from './chartTheme';

export default function SpendingChart() {
  const { month, year } = useSelectedPeriod();
  const { data: transactions } = useTransactions({ month, year });

  const chartData = (() => {
    if (!transactions || transactions.length === 0) return [];

    const incomeByDay: Record<string, number> = {};
    const expenseByDay: Record<string, number> = {};

    for (const tx of transactions) {
      const day = tx.date.split('-')[2];
      if (tx.type === 'income') {
        incomeByDay[day] = (incomeByDay[day] || 0) + tx.amount;
      } else {
        expenseByDay[day] = (expenseByDay[day] || 0) + tx.amount;
      }
    }

    const days = Array.from(new Set([
      ...Object.keys(incomeByDay),
      ...Object.keys(expenseByDay),
    ])).sort((a, b) => parseInt(a) - parseInt(b));

    return days.map((day) => ({
      day: parseInt(day),
      income: incomeByDay[day] || 0,
      expense: expenseByDay[day] || 0,
    }));
  })();

  const legend = (
    <div className="hidden items-center gap-3 rounded-full bg-white/80 px-3 py-1.5 text-xs text-dark-500 shadow-soft sm:flex">
      <span className="flex items-center gap-1.5">
        <span className="h-2 w-2 rounded-full bg-primary-400" />
        Pemasukan
      </span>
      <span className="flex items-center gap-1.5">
        <span className="h-2 w-2 rounded-full bg-dark-900" />
        Pengeluaran
      </span>
    </div>
  );

  return (
    <div data-reveal className="card min-w-0 p-5 sm:p-6">
      <PanelHeader
        title="Tren cashflow harian"
        caption="Ritme pemasukan dan pengeluaran per hari."
        className="mb-5"
        aside={chartData.length > 0 ? legend : undefined}
      />
      {chartData.length === 0 ? (
        <div className="surface-muted flex h-48 items-center justify-center text-center sm:h-64">
          <div>
            <p className="text-sm font-medium text-dark-700">Belum ada data</p>
            <p className="mt-1 text-xs text-dark-400">Tambahkan transaksi untuk melihat pergerakan harian.</p>
          </div>
        </div>
      ) : (
        <ChartSurface className="h-52 min-h-[13rem] w-full min-w-0 sm:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barGap={3}>
              <CartesianGrid strokeDasharray="3 4" stroke={chartColors.grid} vertical={false} />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 11, fill: chartColors.axis }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: chartColors.axis }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => formatIDRCompact(value as number)}
                width={64}
              />
              <Tooltip {...chartTooltipProps} formatter={(value) => formatIDR(value as number)} labelFormatter={(day) => `Tanggal ${day}`} />
              <Bar dataKey="income" name="Pemasukan" fill={chartColors.income} radius={[6, 6, 6, 6]} maxBarSize={10} />
              <Bar dataKey="expense" name="Pengeluaran" fill={chartColors.expense} radius={[6, 6, 6, 6]} maxBarSize={10} />
            </BarChart>
          </ResponsiveContainer>
        </ChartSurface>
      )}
    </div>
  );
}
