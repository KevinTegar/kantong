import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTransactions } from '../../hooks/useTransactions';
import { formatIDR } from '../../lib/formatCurrency';
import { TrendingUp } from 'lucide-react';
import ChartSurface from './ChartSurface';
import PanelHeader from '../ui/PanelHeader';

export default function SpendingChart() {
  const { data: transactions } = useTransactions();

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

  if (!transactions || transactions.length === 0) {
    return (
      <div className="card min-w-0 p-5 sm:p-6">
        <PanelHeader
          title="Tren Cashflow Harian"
          caption="Pemasukan dan pengeluaran selama bulan berjalan."
          icon={TrendingUp}
          className="mb-5"
        />
        <div className="surface-muted flex h-48 items-center justify-center text-dark-400 sm:h-64">
          <div className="text-center">
            <p className="text-sm font-semibold text-dark-700">Belum ada data</p>
            <p className="mt-1 text-xs">Tambahkan transaksi untuk melihat pergerakan harian.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card min-w-0 p-5 sm:p-6">
      <PanelHeader
        title="Tren Cashflow Harian"
        caption="Lihat ritme pemasukan dan pengeluaran per hari."
        icon={TrendingUp}
        className="mb-5"
        aside={(
          <div className="flex items-center gap-4 rounded-full bg-dark-50 px-3 py-2 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-success-500" />
              <span className="text-dark-500">Pemasukan</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-danger-500" />
              <span className="text-dark-500">Pengeluaran</span>
            </div>
          </div>
        )}
      />
      <ChartSurface className="surface-muted h-52 min-h-[13rem] w-full min-w-0 p-3 sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            <XAxis
              dataKey="day"
              tick={{ fontSize: 11, fill: '#6b7280' }}
              axisLine={{ stroke: '#e5e7eb' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#6b7280' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => `Rp${(value / 1000).toFixed(0)}k`}
              width={50}
            />
            <Tooltip
              formatter={(value) => formatIDR(value as number)}
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '12px',
              }}
            />
            <Bar dataKey="income" fill="#22c55e" radius={[4, 4, 0, 0]} />
            <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartSurface>
    </div>
  );
}
