import { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import { useSelectedPeriod } from '../hooks/useSelectedPeriod';
import { useStaggerReveal } from '../hooks/useStaggerReveal';
import { useTransactions } from '../hooks/useTransactions';
import { useCategories } from '../hooks/useCategories';
import { useDashboardSummary } from '../hooks/useDashboardSummary';
import { budgetLevelStyles, getBudgetLevel } from '../lib/budgetStatus';
import { formatIDR, formatIDRCompact } from '../lib/formatCurrency';
import ChartSurface from '../components/charts/ChartSurface';
import { chartColors, chartTooltipProps } from '../components/charts/chartTheme';
import AnimatedNumber from '../components/ui/AnimatedNumber';
import MetricCard from '../components/ui/MetricCard';
import PanelHeader from '../components/ui/PanelHeader';
import PageHeader from '../components/ui/PageHeader';
import ProgressBar from '../components/ui/ProgressBar';

export default function ReportsPage() {
  const { month, year, label } = useSelectedPeriod();
  const { data: transactions, isLoading } = useTransactions({ month, year });
  const { data: categories } = useCategories();
  const { totalIncome, totalExpense, balance } = useDashboardSummary({ month, year });
  const scope = useStaggerReveal([isLoading]);

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
          color: category?.color || '#a8a091',
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

  const cappedCategories = (categories ?? [])
    .filter((category) => category.spending_cap > 0)
    .map((category) => {
      const spent = categoryBreakdown.find((c) => c.id === category.id)?.value || 0;
      const percentage = (spent / category.spending_cap) * 100;

      return {
        ...category,
        spent,
        remaining: Math.max(0, category.spending_cap - spent),
        percentage,
        level: getBudgetLevel(percentage),
      };
    });

  const topCategory = categoryBreakdown[0];
  const spendVsIncome = totalIncome > 0 ? (totalExpense / totalIncome) * 100 : 0;
  const reviewStatus = balance >= 0
    ? 'Periode ini masih terkendali. Fokus utama ada di kategori yang paling cepat naik.'
    : 'Pengeluaran pada periode ini lebih tinggi dari pemasukan. Perlu review kategori dan cap secara lebih ketat.';

  return (
    <div ref={scope} className="space-y-6">
      <PageHeader
        eyebrow={label}
        title="Laporan"
        description="Pola pengeluaran, komposisi kategori, dan efisiensi budget untuk bulan yang sedang aktif."
      />

      <section data-reveal className="grid grid-cols-1 gap-3 lg:grid-cols-[1.3fr_1fr_1fr]">
        <div className="relative isolate overflow-hidden rounded-4xl bg-dark-900 p-6 text-white shadow-elevated">
          <div aria-hidden="true" className="absolute -right-24 -top-28 -z-10 h-80 w-80 rounded-full bg-[#e8853d]/55 blur-3xl" />
          <div aria-hidden="true" className="absolute -right-6 -top-10 -z-10 h-44 w-44 rounded-full bg-primary-400 blur-2xl" />
          <p className="text-xs text-white/60">Saldo bersih {label}</p>
          <p className={`mt-3 text-[40px] font-light leading-none tracking-tight ${balance < 0 ? 'text-red-300' : ''}`}>
            <AnimatedNumber value={balance} format={formatIDR} />
          </p>
          <p className="mt-4 max-w-md text-sm leading-6 text-white/60">{reviewStatus}</p>
        </div>
        <div className="card p-6">
          <p className="text-sm text-dark-500">Kategori terbesar</p>
          <p className="mt-3 truncate text-2xl font-light tracking-tight text-dark-900">{topCategory?.name || 'Belum ada data'}</p>
          <p className="mt-1 text-sm text-dark-500">
            {topCategory ? formatIDR(topCategory.value) : 'Tambahkan transaksi untuk membaca pola.'}
          </p>
        </div>
        <div className="card p-6">
          <p className="text-sm text-dark-500">Rasio spend terhadap income</p>
          <p className="mt-3 text-[40px] font-light leading-none tracking-tight text-dark-900">
            <AnimatedNumber value={spendVsIncome} format={(value) => `${Math.round(value)}%`} />
          </p>
          <ProgressBar value={spendVsIncome} className="mt-4 h-2 bg-dark-100" barClassName="bg-primary-400" />
          <p className="mt-3 text-xs text-dark-500">Semakin rendah, semakin besar ruang manuver cashflow-mu.</p>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <MetricCard label="Pemasukan" value={totalIncome} format="currency" icon={TrendingUp} tone="success" />
        <MetricCard label="Pengeluaran" value={totalExpense} format="currency" icon={TrendingDown} />
        <MetricCard
          label="Saldo bersih"
          value={balance}
          format="currency"
          icon={Wallet}
          tone={balance >= 0 ? 'primary' : 'danger'}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div data-reveal className="card min-w-0 p-6">
          <PanelHeader
            title="Pengeluaran per kategori"
            caption="Komposisi dari kategori yang paling aktif."
            className="mb-5"
          />
          {categoryBreakdown.length === 0 ? (
            <div className="surface-muted flex h-64 items-center justify-center text-sm text-dark-400">
              Belum ada data pengeluaran.
            </div>
          ) : (
            <div className="grid items-center gap-4 sm:grid-cols-2">
              <ChartSurface className="h-64 min-h-[16rem] w-full min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius="60%"
                      outerRadius="90%"
                      paddingAngle={2}
                      cornerRadius={6}
                      dataKey="value"
                      stroke="none"
                    >
                      {categoryBreakdown.map((entry) => (
                        <Cell key={entry.id} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip {...chartTooltipProps} formatter={(value) => formatIDR(value as number)} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartSurface>
              <ul className="space-y-2">
                {categoryBreakdown.map((item) => (
                  <li key={item.id} className="flex items-center justify-between gap-3 text-sm">
                    <span className="flex min-w-0 items-center gap-2">
                      <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="truncate text-dark-700">{item.name}</span>
                    </span>
                    <span className="flex-shrink-0 tabular-nums text-dark-500">{formatIDRCompact(item.value)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div data-reveal className="card min-w-0 p-6">
          <PanelHeader
            title="Tren mingguan"
            caption="Minggu dihitung dari tanggal 1, sama seperti burn rate."
            className="mb-5"
          />
          {weeklyData.length === 0 ? (
            <div className="surface-muted flex h-64 items-center justify-center text-sm text-dark-400">
              Belum ada data.
            </div>
          ) : (
            <ChartSurface className="h-72 min-h-[16rem] w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData} barGap={6}>
                  <CartesianGrid strokeDasharray="3 4" stroke={chartColors.grid} vertical={false} />
                  <XAxis dataKey="week" tick={{ fontSize: 11, fill: chartColors.axis }} axisLine={false} tickLine={false} />
                  <YAxis
                    tick={{ fontSize: 11, fill: chartColors.axis }}
                    axisLine={false}
                    tickLine={false}
                    width={64}
                    tickFormatter={(value) => formatIDRCompact(value as number)}
                  />
                  <Tooltip {...chartTooltipProps} formatter={(value) => formatIDR(value as number)} />
                  <Bar dataKey="income" fill={chartColors.income} radius={[8, 8, 8, 8]} maxBarSize={28} name="Pemasukan" />
                  <Bar dataKey="expense" fill={chartColors.expense} radius={[8, 8, 8, 8]} maxBarSize={28} name="Pengeluaran" />
                </BarChart>
              </ResponsiveContainer>
            </ChartSurface>
          )}
        </div>
      </div>

      <div data-reveal className="card p-2 sm:p-3">
        <div className="px-3 pb-3 pt-3 sm:px-4">
          <h3 className="panel-title">Ringkasan budget kategori</h3>
          <p className="panel-caption mt-0.5">Kategori sehat, ketat, dan yang mulai melewati batas.</p>
        </div>

        {cappedCategories.length > 0 ? (
          <>
            <div className="hidden gap-3 px-4 pb-2 text-xs text-dark-400 lg:grid lg:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))_minmax(0,1.4fr)]">
              <span>Kategori</span>
              <span className="text-right">Budget</span>
              <span className="text-right">Terpakai</span>
              <span className="text-right">Sisa</span>
              <span className="text-right">Status</span>
            </div>
            <div className="space-y-0.5">
              {cappedCategories.map((category) => (
                <div
                  key={category.id}
                  className="rounded-2xl px-3 py-3 transition-colors hover:bg-primary-100/70 sm:px-4 lg:grid lg:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))_minmax(0,1.4fr)] lg:items-center lg:gap-3"
                >
                  <div className="flex items-center justify-between gap-3 lg:justify-start">
                    <span className="flex min-w-0 items-center gap-2.5">
                      <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full" style={{ backgroundColor: category.color }} />
                      <span className="truncate text-sm font-medium text-dark-900">{category.name}</span>
                    </span>
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium lg:hidden ${budgetLevelStyles[category.level].badge}`}>
                      {budgetLevelStyles[category.level].label}
                    </span>
                  </div>
                  <span className="hidden text-right text-sm text-dark-600 lg:block">{formatIDR(category.spending_cap)}</span>
                  <span className="hidden text-right text-sm text-dark-600 lg:block">{formatIDR(category.spent)}</span>
                  <span className={`hidden text-right text-sm font-medium lg:block ${category.remaining > 0 ? 'text-dark-900' : 'text-red-600'}`}>
                    {formatIDR(category.remaining)}
                  </span>
                  <div className="mt-3 flex items-center gap-3 lg:mt-0">
                    <ProgressBar
                      value={category.percentage}
                      className="h-1.5 flex-1 bg-dark-100"
                      barClassName={budgetLevelStyles[category.level].bar}
                    />
                    <span className="w-10 text-right text-xs tabular-nums text-dark-600">{category.percentage.toFixed(0)}%</span>
                    <span className={`hidden rounded-full px-2.5 py-0.5 text-[11px] font-medium lg:inline ${budgetLevelStyles[category.level].badge}`}>
                      {budgetLevelStyles[category.level].label}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-dark-500 lg:hidden">
                    {formatIDR(category.spent)} dari {formatIDR(category.spending_cap)} · sisa {formatIDR(category.remaining)}
                  </p>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="p-12 text-center text-sm text-dark-400">
            Tidak ada kategori dengan spending cap.
          </div>
        )}
      </div>
    </div>
  );
}
