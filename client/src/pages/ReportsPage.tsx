import { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { BarChart3, TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import { useSelectedPeriod } from '../hooks/useSelectedPeriod';
import { useTransactions } from '../hooks/useTransactions';
import { useCategories } from '../hooks/useCategories';
import { useDashboardSummary } from '../hooks/useDashboardSummary';
import { formatIDR } from '../lib/formatCurrency';
import ChartSurface from '../components/charts/ChartSurface';
import MetricCard from '../components/ui/MetricCard';
import PanelHeader from '../components/ui/PanelHeader';
import PageHeader from '../components/ui/PageHeader';

export default function ReportsPage() {
  const { month, year, label } = useSelectedPeriod();
  const { data: transactions } = useTransactions({ month, year });
  const { data: categories } = useCategories();
  const { totalIncome, totalExpense, balance } = useDashboardSummary({ month, year });

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
          id: categoryId,
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
      const day = parseInt(tx.date.split('-')[2], 10);
      const week = Math.ceil(day / 7);
      if (!weeks[week]) weeks[week] = { income: 0, expense: 0 };

      if (tx.type === 'income') {
        weeks[week].income += tx.amount;
      } else {
        weeks[week].expense += tx.amount;
      }
    }

    return Object.entries(weeks)
      .sort(([a], [b]) => parseInt(a, 10) - parseInt(b, 10))
      .map(([week, data]) => ({
        week: `Minggu ${week}`,
        ...data,
      }));
  }, [transactions]);

  const topCategory = categoryBreakdown[0];
  const spendVsIncome = totalIncome > 0 ? (totalExpense / totalIncome) * 100 : 0;
  const reviewStatus = balance >= 0
    ? 'Periode ini masih terkendali. Fokus utama ada di kategori yang paling cepat naik.'
    : 'Pengeluaran pada periode ini lebih tinggi dari pemasukan. Perlu review kategori dan cap secara lebih ketat.';

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        eyebrow={label}
        title="Laporan"
        description="Baca pola pengeluaran, komposisi kategori, dan efisiensi budget untuk bulan yang sedang aktif dalam satu permukaan yang lebih analitis."
      />

      <section className="card overflow-hidden">
        <div className="grid gap-0 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="border-b border-dark-200 p-6 lg:border-b-0 lg:border-r lg:p-8">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700">
                <span className="h-2 w-2 rounded-full bg-primary-500" />
                Ringkasan Bulanan
              </div>
              <div>
                <p className="text-sm text-dark-500">Saldo bersih review periode ini</p>
                <h2 className={`mt-2 text-3xl font-bold tracking-tight lg:text-4xl ${
                  balance >= 0 ? 'text-dark-900' : 'text-danger-600'
                }`}>
                  {formatIDR(balance)}
                </h2>
              </div>
              <p className="max-w-2xl text-sm leading-6 text-dark-500">{reviewStatus}</p>
            </div>
          </div>
          <div className="bg-dark-50/70 p-6 lg:p-8">
            <h3 className="panel-title">Insight cepat</h3>
            <div className="mt-5 space-y-3">
              <div className="surface-muted p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-dark-400">Kategori terbesar</p>
                <p className="mt-2 text-lg font-bold text-dark-900">{topCategory?.name || 'Belum ada data'}</p>
                <p className="mt-1 text-sm text-dark-500">
                  {topCategory ? formatIDR(topCategory.value) : 'Tambahkan transaksi untuk membaca pola.'}
                </p>
              </div>
              <div className="surface-muted p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-dark-400">Rasio spend terhadap income</p>
                <p className="mt-2 text-lg font-bold text-dark-900">{spendVsIncome.toFixed(0)}%</p>
                <p className="mt-1 text-sm text-dark-500">Semakin rendah, semakin besar ruang manuver cashflow-mu.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <MetricCard
          label="Pemasukan"
          value={formatIDR(totalIncome)}
          icon={TrendingUp}
          tone="success"
        />
        <MetricCard
          label="Pengeluaran"
          value={formatIDR(totalExpense)}
          icon={TrendingDown}
          tone="danger"
        />
        <MetricCard
          label="Saldo Bersih"
          value={formatIDR(balance)}
          icon={Wallet}
          tone={balance >= 0 ? 'primary' : 'danger'}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card min-w-0 p-6">
          <PanelHeader
            title="Pengeluaran per Kategori"
            caption="Komposisi pengeluaran dari kategori yang paling aktif."
            icon={BarChart3}
            className="mb-5"
          />
          {categoryBreakdown.length === 0 ? (
            <div className="surface-muted flex h-64 items-center justify-center text-dark-400">
              <p>Belum ada data pengeluaran.</p>
            </div>
          ) : (
            <ChartSurface className="surface-muted h-72 min-h-[16rem] w-full min-w-0 p-3">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={54}
                    outerRadius={92}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryBreakdown.map((entry) => (
                      <Cell key={entry.id} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => formatIDR(value as number)}
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #dde4ec',
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

        <div className="card min-w-0 p-6">
          <PanelHeader
            title="Tren Mingguan"
            caption="Bandingkan ritme pemasukan dan pengeluaran tiap minggu."
            icon={TrendingUp}
            className="mb-5"
          />
          {weeklyData.length === 0 ? (
            <div className="surface-muted flex h-64 items-center justify-center text-dark-400">
              <p>Belum ada data.</p>
            </div>
          ) : (
            <ChartSurface className="surface-muted h-72 min-h-[16rem] w-full min-w-0 p-3">
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
                      border: '1px solid #dde4ec',
                      borderRadius: '12px',
                    }}
                  />
                  <Bar dataKey="income" fill="#2f8f60" radius={[6, 6, 0, 0]} name="Pemasukan" />
                  <Bar dataKey="expense" fill="#d9483b" radius={[6, 6, 0, 0]} name="Pengeluaran" />
                </BarChart>
              </ResponsiveContainer>
            </ChartSurface>
          )}
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="border-b border-dark-200 px-6 py-4">
          <h3 className="panel-title">Ringkasan Budget Kategori</h3>
          <p className="panel-caption">Gunakan tabel ini untuk membaca kategori sehat, ketat, dan yang mulai melewati batas.</p>
        </div>
        {categories && categories.length > 0 ? (
          <>
            <div className="lg:hidden">
              <div className="divide-y divide-dark-200">
                {categories
                  .filter((cat) => cat.spending_cap > 0)
                  .map((category) => {
                    const spent = categoryBreakdown.find((c) => c.name === category.name)?.value || 0;
                    const remaining = Math.max(0, category.spending_cap - spent);
                    const percentage = (spent / category.spending_cap) * 100;

                    const statusClass = percentage >= 100
                      ? 'bg-danger-50 text-danger-700'
                      : percentage >= 85
                        ? 'bg-warning-50 text-warning-700'
                        : 'bg-primary-50 text-primary-700';

                    const statusLabel = percentage >= 100
                      ? 'Melebihi cap'
                      : percentage >= 85
                        ? 'Perlu perhatian'
                        : 'Aman';

                    return (
                      <div key={category.id} className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: category.color }} />
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-semibold text-dark-800">{category.name}</p>
                            <p className="text-sm text-dark-500">Budget {formatIDR(category.spending_cap)}</p>
                          </div>
                          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass}`}>
                            {statusLabel}
                          </span>
                        </div>
                        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                          <div className="surface-muted p-3">
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-dark-400">Terpakai</p>
                            <p className="mt-2 font-semibold text-dark-800">{formatIDR(spent)}</p>
                          </div>
                          <div className="surface-muted p-3">
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-dark-400">Sisa</p>
                            <p className={`mt-2 font-semibold ${remaining > 0 ? 'text-success-700' : 'text-danger-600'}`}>
                              {formatIDR(remaining)}
                            </p>
                          </div>
                        </div>
                        <div className="mt-3 h-2 overflow-hidden rounded-full bg-dark-100">
                          <div
                            className={`h-full rounded-full ${
                              percentage >= 100
                                ? 'bg-danger-500'
                                : percentage >= 85
                                  ? 'bg-warning-500'
                                  : 'bg-primary-500'
                            }`}
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          />
                        </div>
                        <p className="mt-2 text-xs text-dark-500">{percentage.toFixed(0)}% dari cap bulanan.</p>
                      </div>
                    );
                  })}
              </div>
            </div>

            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full">
                <thead>
                  <tr className="bg-dark-50 text-left text-sm text-dark-500">
                    <th className="px-6 py-4 font-medium">Kategori</th>
                    <th className="px-6 py-4 font-medium text-right">Budget</th>
                    <th className="px-6 py-4 font-medium text-right">Terpakai</th>
                    <th className="px-6 py-4 font-medium text-right">Sisa</th>
                    <th className="px-6 py-4 font-medium text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-200">
                  {categories
                    .filter((cat) => cat.spending_cap > 0)
                    .map((category) => {
                      const spent = categoryBreakdown.find((c) => c.name === category.name)?.value || 0;
                      const remaining = Math.max(0, category.spending_cap - spent);
                      const percentage = (spent / category.spending_cap) * 100;

                      const statusClass = percentage >= 100
                        ? 'bg-danger-50 text-danger-700'
                        : percentage >= 85
                          ? 'bg-warning-50 text-warning-700'
                          : 'bg-primary-50 text-primary-700';

                      const statusLabel = percentage >= 100
                        ? 'Melebihi cap'
                        : percentage >= 85
                          ? 'Perlu perhatian'
                          : 'Aman';

                      return (
                        <tr key={category.id} className="transition-colors hover:bg-dark-50/70">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: category.color }} />
                              <span className="font-medium text-dark-800">{category.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right text-dark-600">{formatIDR(category.spending_cap)}</td>
                          <td className="px-6 py-4 text-right text-dark-600">{formatIDR(spent)}</td>
                          <td className={`px-6 py-4 text-right font-medium ${remaining > 0 ? 'text-success-700' : 'text-danger-600'}`}>
                            {formatIDR(remaining)}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass}`}>
                              {[statusLabel, `${percentage.toFixed(0)}%`].join(' • ')}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="p-12 text-center text-dark-400">
            Tidak ada kategori dengan spending cap.
          </div>
        )}
      </div>
    </div>
  );
}
