import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useTransactions } from '../../hooks/useTransactions';
import { useCategories } from '../../hooks/useCategories';
import { formatIDR } from '../../lib/formatCurrency';
import { PieChart as PieChartIcon } from 'lucide-react';
import ChartSurface from './ChartSurface';
import PanelHeader from '../ui/PanelHeader';

export default function CategoryPieChart() {
  const { data: transactions } = useTransactions();
  const { data: categories } = useCategories();

  const chartData = (() => {
    if (!transactions || !categories || transactions.length === 0) return [];

    const expenseByCategory: Record<string, number> = {};

    for (const tx of transactions) {
      if (tx.type === 'expense' && tx.category_id) {
        expenseByCategory[tx.category_id] = (expenseByCategory[tx.category_id] || 0) + tx.amount;
      }
    }

    const categoryMap = new Map(categories.map((c) => [c.id, c]));

    return Object.entries(expenseByCategory)
      .map(([categoryId, amount]) => {
        const category = categoryMap.get(categoryId);
        return {
          name: category?.name || 'Tanpa Kategori',
          value: amount,
          color: category?.color || '#9ca3af',
        };
      })
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value);
  })();

  if (chartData.length === 0) {
    return (
      <div className="card min-w-0 p-5 sm:p-6">
        <PanelHeader
          title="Distribusi Pengeluaran"
          caption="Porsi pengeluaran berdasarkan kategori aktif."
          icon={PieChartIcon}
          className="mb-5"
        />
        <div className="surface-muted flex h-48 items-center justify-center text-dark-400 sm:h-64">
          <div className="text-center">
            <p className="text-sm font-semibold text-dark-700">Belum ada data</p>
            <p className="mt-1 text-xs">Tambahkan pengeluaran untuk membaca komposisi kategori.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card min-w-0 p-5 sm:p-6">
      <PanelHeader
        title="Distribusi Pengeluaran"
        caption="Lihat kategori paling dominan dalam pengeluaranmu."
        icon={PieChartIcon}
        className="mb-5"
      />
      <ChartSurface className="surface-muted h-52 min-h-[13rem] w-full min-w-0 p-3 sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={30}
              outerRadius={60}
              paddingAngle={3}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => formatIDR(value as number)}
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '12px',
              }}
            />
            <Legend
              iconType="circle"
              iconSize={6}
              wrapperStyle={{ fontSize: '11px' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </ChartSurface>
    </div>
  );
}
