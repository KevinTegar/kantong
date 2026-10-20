import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { useSelectedPeriod } from '../../hooks/useSelectedPeriod';
import { useTransactions } from '../../hooks/useTransactions';
import { useCategories } from '../../hooks/useCategories';
import { formatIDR } from '../../lib/formatCurrency';
import ChartSurface from './ChartSurface';
import PanelHeader from '../ui/PanelHeader';
import { chartTooltipProps } from './chartTheme';

export default function CategoryPieChart() {
  const { month, year } = useSelectedPeriod();
  const { data: transactions } = useTransactions({ month, year });
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
          color: category?.color || '#a8a091',
        };
      })
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value);
  })();

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div data-reveal className="card min-w-0 p-5 sm:p-6">
      <PanelHeader
        title="Distribusi pengeluaran"
        caption="Kategori paling dominan periode ini."
        className="mb-5"
      />
      {chartData.length === 0 ? (
        <div className="surface-muted flex h-48 items-center justify-center text-center sm:h-64">
          <div>
            <p className="text-sm font-medium text-dark-700">Belum ada data</p>
            <p className="mt-1 text-xs text-dark-400">Tambahkan pengeluaran untuk membaca komposisi kategori.</p>
          </div>
        </div>
      ) : (
        <div className="grid items-center gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <ChartSurface className="h-52 min-h-[13rem] w-full min-w-0 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius="62%"
                  outerRadius="88%"
                  paddingAngle={2}
                  cornerRadius={6}
                  dataKey="value"
                  stroke="none"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip {...chartTooltipProps} formatter={(value) => formatIDR(value as number)} />
              </PieChart>
            </ResponsiveContainer>
          </ChartSurface>

          <ul className="space-y-2">
            {chartData.slice(0, 6).map((item) => (
              <li key={item.name} className="flex items-center justify-between gap-3 text-sm">
                <span className="flex min-w-0 items-center gap-2">
                  <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="truncate text-dark-700">{item.name}</span>
                </span>
                <span className="flex-shrink-0 tabular-nums text-dark-500">{((item.value / total) * 100).toFixed(0)}%</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
