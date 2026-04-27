import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { TrendingUp, TrendingDown, Wallet, BarChart3 } from 'lucide-react';
import { useTransactions } from '../hooks/useTransactions';
import { useCategories } from '../hooks/useCategories';
import { useDashboardSummary } from '../hooks/useDashboardSummary';
import { formatIDR } from '../lib/formatCurrency';
import ChartSurface from '../components/charts/ChartSurface';

export default function ReportsPage() {
  const { data: transactions } = useTransactions();
  const { data: categories } = useCategories();
  const { totalIncome, totalExpense, balance } = useDashboardSummary();

  const categoryBreakdown = useMemo(() => {
    if (!transactions || !categories) return [];

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
          name: category?.name || 'Lainnya',
          value: amount,
          color: category?.color || '#9ca3af',
        };
      })
      .sort((a, b) => b.value - a.value);
  }, [transactions, categories]);

  const weeklyData = useMemo(() => {
    if (!transactions) return [];

    const weeks: Record<number, { income: number; expense: number }> = {};

    for (const tx of transactions) {
      const day = parseInt(tx.date.split('-')[2]);
      const week = Math.ceil(day / 7);
      if (!weeks[week]) weeks[week] = { income: 0, expense: 0 };

      if (tx.type === 'income') {
        weeks[week].income += tx.amount;
      } else {
        weeks[week].expense += tx.amount;
      }
    }

    return Object.entries(weeks)
      .sort(([a], [b]) => parseInt(a) - parseInt(b))
      .map(([week, data]) => ({
        week: `Minggu ${week}`,
        ...data,
      }));
  }, [transactions]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-dark-900">Laporan</h1>
        <p className="text-dark-400 mt-1">Analisis keuangan bulan ini</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-success-100 rounded-xl">
              <TrendingUp className="w-6 h-6 text-success-600" />
            </div>
            <div>
              <p className="text-sm text-dark-400">Total Pemasukan</p>
              <p className="text-xl font-bold text-success-600">{formatIDR(totalIncome)}</p>
            </div>
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-danger-100 rounded-xl">
              <TrendingDown className="w-6 h-6 text-danger-600" />
            </div>
            <div>
              <p className="text-sm text-dark-400">Total Pengeluaran</p>
              <p className="text-xl font-bold text-danger-600">{formatIDR(totalExpense)}</p>
            </div>
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${balance >= 0 ? 'bg-primary-100' : 'bg-danger-100'}`}>
              <Wallet className={`w-6 h-6 ${balance >= 0 ? 'text-primary-600' : 'text-danger-600'}`} />
            </div>
            <div>
              <p className="text-sm text-dark-400">Saldo Bersih</p>
              <p className={`text-xl font-bold ${balance >= 0 ? 'text-primary-600' : 'text-danger-600'}`}>
                {formatIDR(balance)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="card min-w-0 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary-100 rounded-xl">
              <BarChart3 className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h3 className="font-semibold text-dark-800">Pengeluaran per Kategori</h3>
              <p className="text-sm text-dark-400">Distribusi spending bulan ini</p>
            </div>
          </div>
          {categoryBreakdown.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-dark-400">
              <p>Belum ada data pengeluaran</p>
            </div>
          ) : (
            <ChartSurface className="h-64 min-h-[16rem] w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => formatIDR(value as number)}
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                    }}
                  />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    formatter={(value) => <span className="text-sm text-dark-600">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartSurface>
          )}
        </div>

        {/* Weekly Trends */}
        <div className="card min-w-0 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary-100 rounded-xl">
              <TrendingUp className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h3 className="font-semibold text-dark-800">Tren Mingguan</h3>
              <p className="text-sm text-dark-400">Income vs Expense per minggu</p>
            </div>
          </div>
          {weeklyData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-dark-400">
              <p>Belum ada data</p>
            </div>
          ) : (
            <ChartSurface className="h-64 min-h-[16rem] w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData} barGap={8}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                  <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    tickFormatter={(value) => `Rp${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(value) => formatIDR(value as number)}
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                    }}
                  />
                  <Bar dataKey="income" fill="#22c55e" radius={[6, 6, 0, 0]} name="Pemasukan" />
                  <Bar dataKey="expense" fill="#ef4444" radius={[6, 6, 0, 0]} name="Pengeluaran" />
                </BarChart>
              </ResponsiveContainer>
            </ChartSurface>
          )}
        </div>
      </div>

      {/* Budget Summary Table */}
      <div className="card overflow-hidden">
        <div className="p-6 border-b border-dark-200">
          <h3 className="font-semibold text-dark-800">Ringkasan Budget Kategori</h3>
        </div>
        {categories && categories.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-dark-50 text-left text-sm text-dark-500">
                  <th className="px-6 py-4 font-medium">Kategori</th>
                  <th className="px-6 py-4 font-medium text-right">Budget</th>
                  <th className="px-6 py-4 font-medium text-right">Terpakai</th>
                  <th className="px-6 py-4 font-medium text-right">Sisa</th>
                  <th className="px-6 py-4 font-medium text-right">%</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-200">
                {categories
                  .filter((cat) => cat.spending_cap > 0)
                  .map((category) => {
                    const spent = categoryBreakdown.find((c) => c.name === category.name)?.value || 0;
                    const remaining = Math.max(0, category.spending_cap - spent);
                    const percentage = (spent / category.spending_cap) * 100;

                    return (
                      <tr key={category.id} className="hover:bg-dark-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: category.color }}
                            />
                            <span className="font-medium text-dark-800">{category.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right text-dark-600">
                          {formatIDR(category.spending_cap)}
                        </td>
                        <td className="px-6 py-4 text-right text-dark-600">
                          {formatIDR(spent)}
                        </td>
                        <td className={`px-6 py-4 text-right font-medium ${
                          remaining > 0 ? 'text-success-600' : 'text-danger-600'
                        }`}>
                          {formatIDR(remaining)}
                        </td>
                        <td className={`px-6 py-4 text-right font-medium ${
                          percentage >= 100 ? 'text-danger-600' :
                          percentage >= 85 ? 'text-warning-600' :
                          percentage >= 70 ? 'text-warning-500' : 'text-dark-600'
                        }`}>
                          {percentage.toFixed(0)}%
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-dark-400">
            Tidak ada kategori dengan spending cap
          </div>
        )}
      </div>
    </div>
  );
}
