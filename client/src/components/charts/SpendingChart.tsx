import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTransactions } from '../../hooks/useTransactions';
import { formatIDR } from '../../lib/formatCurrency';
import { TrendingUp } from 'lucide-react';
import ChartSurface from './ChartSurface';

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
      <div className="card p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary-100 rounded-lg">
            <TrendingUp className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h3 className="font-semibold text-dark-800">Grafik Harian</h3>
            <p className="text-sm text-dark-400">Bulan ini</p>
          </div>
        </div>
        <div className="h-48 sm:h-64 flex items-center justify-center text-dark-400">
          <div className="text-center">
            <p className="text-sm font-medium">Belum ada data</p>
            <p className="text-xs">Tambahkan transaksi untuk melihat grafik</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card min-w-0 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-100 rounded-lg">
            <TrendingUp className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h3 className="font-semibold text-dark-800">Grafik Harian</h3>
            <p className="text-sm text-dark-400">Bulan ini</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-success-500" />
            <span className="text-dark-500">Pemasukan</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-danger-500" />
            <span className="text-dark-500">Pengeluaran</span>
          </div>
        </div>
      </div>
      <ChartSurface className="h-48 min-h-[12rem] w-full min-w-0 sm:h-64">
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
