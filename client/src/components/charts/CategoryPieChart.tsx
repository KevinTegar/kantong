import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useTransactions } from '../../hooks/useTransactions';
import { useCategories } from '../../hooks/useCategories';
import { formatIDR } from '../../lib/formatCurrency';
import { PieChart as PieChartIcon } from 'lucide-react';
import ChartSurface from './ChartSurface';

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
      <div className="card p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary-100 rounded-lg">
            <PieChartIcon className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h3 className="font-semibold text-dark-800">Distribusi</h3>
            <p className="text-sm text-dark-400">Per kategori</p>
          </div>
        </div>
        <div className="h-48 sm:h-64 flex items-center justify-center text-dark-400">
          <div className="text-center">
            <p className="text-sm font-medium">Belum ada data</p>
            <p className="text-xs">Tambahkan pengeluaran untuk melihat distribusi</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card min-w-0 p-4 sm:p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-primary-100 rounded-lg">
          <PieChartIcon className="w-5 h-5 text-primary-600" />
        </div>
        <div>
          <h3 className="font-semibold text-dark-800">Distribusi</h3>
          <p className="text-sm text-dark-400">Per kategori</p>
        </div>
      </div>
      <ChartSurface className="h-48 min-h-[12rem] w-full min-w-0 sm:h-64">
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
