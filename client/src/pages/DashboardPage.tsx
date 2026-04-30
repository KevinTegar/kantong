import { useMemo } from 'react';
import {
  ArrowRight,
  PiggyBank,
  Plus,
  ShieldAlert,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import AlertBanner from '../components/alerts/AlertBanner';
import SpendingChart from '../components/charts/SpendingChart';
import CategoryPieChart from '../components/charts/CategoryPieChart';
import MonthlyHistoryPanel from '../components/dashboard/MonthlyHistoryPanel';
import FirstUsePanel from '../components/onboarding/FirstUsePanel';
import PanelHeader from '../components/ui/PanelHeader';
import SummaryCard from '../components/ui/SummaryCard';
import PageHeader from '../components/ui/PageHeader';
import CategoryProgressList from '../components/transactions/CategoryProgressList';
import { useSelectedPeriod } from '../hooks/useSelectedPeriod';
import { useAvailableMonths } from '../hooks/useAvailableMonths';
import { useCategorySpending, useDashboardSummary } from '../hooks/useDashboardSummary';
import { useCategories } from '../hooks/useCategories';
import { useTransactions } from '../hooks/useTransactions';
import { formatIDR } from '../lib/formatCurrency';

export default function DashboardPage() {
  const { month, year, label } = useSelectedPeriod();
  const { totalIncome, totalExpense, balance, isLoading } = useDashboardSummary({ month, year });
  const { data: transactions } = useTransactions({ month, year });
  const { data: availableMonths } = useAvailableMonths();
  const { data: categories } = useCategories();
  const categorySpending = useCategorySpending({ month, year });
  const isFirstUse = !isLoading && (availableMonths?.length ?? 0) === 0 && (transactions?.length ?? 0) === 0;

  const spentRatio = totalIncome > 0 ? Math.min(100, (totalExpense / totalIncome) * 100) : 0;

  const budgetStatus = balance >= 0
    ? 'Arus kas pada periode ini masih aman. Pertahankan ritme pengeluaranmu.'
    : 'Pengeluaran pada periode ini sudah melampaui pemasukan. Prioritaskan kategori penting.';

  const atRiskCategories = useMemo(() => {
    if (!categories) return [];

    return categories
      .filter((category) => category.spending_cap > 0)
      .map((category) => {
        const spent = categorySpending.get(category.id) || 0;
        const percentage = (spent / category.spending_cap) * 100;

        return {
          ...category,
          spent,
          percentage,
        };
      })
      .filter((category) => category.percentage >= 70)
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 3);
  }, [categories, categorySpending]);

  const recentTransactions = useMemo(
    () => (transactions ? [...transactions].slice(0, 4) : []),
    [transactions]
  );

  const formatShortDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
    });

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        eyebrow={label}
        title="Dashboard"
        description="Pantau cashflow, budget kategori, dan area pengeluaran yang butuh perhatian tanpa kehilangan konteks bulan yang sedang kamu lihat."
        action={(
          <>
            <Link to="/categories" className="btn-secondary">
              <PiggyBank className="h-5 w-5" />
              Kelola Budget
            </Link>
            <Link to="/transactions" className="btn-primary">
              <Plus className="h-5 w-5" />
              Tambah Transaksi
            </Link>
          </>
        )}
      />

      {isFirstUse ? (
        <FirstUsePanel
          eyebrow="Mulai Pertama Kali"
          title="Belum ada transaksi, dan itu tidak apa-apa"
          description="Kantong akan mulai terasa berguna begitu kamu masukkan satu pemasukan dan satu pengeluaran. Dari situ dashboard, histori bulanan, dan laporan akan otomatis membentuk pola yang bisa kamu baca dari bulan ke bulan."
          highlights={[
            'Tambahkan kategori dulu kalau kamu ingin pengeluaran langsung rapi per pos.',
            'Catat pemasukan pertama, misalnya gaji atau dana masuk lainnya.',
            'Setelah itu masukkan beberapa pengeluaran supaya ritme cashflow mulai terlihat.',
          ]}
          actions={[
            { label: 'Tambah Transaksi', to: '/transactions', icon: Plus },
            { label: 'Atur Kategori', to: '/categories', variant: 'secondary', icon: PiggyBank },
          ]}
          aside={(
            <div className="rounded-2xl border border-dashed border-dark-200 bg-white/80 px-4 py-3 text-sm leading-6 text-dark-500">
              Histori bulanan akan muncul otomatis setelah bulan pertama punya transaksi.
            </div>
          )}
        />
      ) : null}

      <section className="card overflow-hidden">
        <div className="grid gap-0 lg:grid-cols-[1.35fr_0.9fr]">
          <div className="border-b border-dark-200 p-6 lg:border-b-0 lg:border-r lg:p-8">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700">
                  <span className="h-2 w-2 rounded-full bg-primary-500" />
                  Ringkasan {label}
                </div>
                <div>
                  <p className="text-sm text-dark-500">Saldo bersih periode aktif</p>
                  <h2 className={`mt-2 text-3xl font-bold tracking-tight lg:text-4xl ${
                    balance >= 0 ? 'text-dark-900' : 'text-danger-600'
                  }`}>
                    {formatIDR(balance)}
                  </h2>
                </div>
                <p className="max-w-xl text-sm leading-6 text-dark-500">{budgetStatus}</p>
              </div>
              <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${
                balance >= 0 ? 'bg-primary-50 text-primary-700' : 'bg-danger-50 text-danger-600'
              }`}>
                <Wallet className="h-7 w-7" />
              </div>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="surface-muted p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-dark-400">Pemasukan</p>
                <p className="mt-2 text-lg font-bold text-success-700">{formatIDR(totalIncome)}</p>
              </div>
              <div className="surface-muted p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-dark-400">Pengeluaran</p>
                <p className="mt-2 text-lg font-bold text-danger-700">{formatIDR(totalExpense)}</p>
              </div>
              <div className="surface-muted p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-dark-400">Rasio Terpakai</p>
                <p className="mt-2 text-lg font-bold text-dark-900">{spentRatio.toFixed(0)}%</p>
              </div>
            </div>
          </div>

          <div className="bg-dark-50/70 p-6 lg:p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-primary-700 shadow-soft">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <div>
                <p className="panel-title">Fokus berikutnya</p>
                <p className="panel-caption">Budget yang perlu kamu cek lebih dulu.</p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {atRiskCategories.length > 0 ? (
                atRiskCategories.map((category) => (
                  <div key={category.id} className="rounded-2xl border border-dark-200 bg-white p-4 shadow-soft">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: category.color }} />
                          <p className="truncate text-sm font-semibold text-dark-800">{category.name}</p>
                        </div>
                        <p className="mt-1 text-xs text-dark-500">
                          {formatIDR(category.spent)} dari {formatIDR(category.spending_cap)}
                        </p>
                      </div>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        category.percentage >= 100
                          ? 'bg-danger-50 text-danger-700'
                          : category.percentage >= 85
                            ? 'bg-warning-50 text-warning-700'
                            : 'bg-primary-50 text-primary-700'
                      }`}>
                        {category.percentage.toFixed(0)}%
                      </span>
                    </div>
                    <div className="mt-3 h-2 rounded-full bg-dark-100">
                      <div
                        className={`h-full rounded-full ${
                          category.percentage >= 100
                            ? 'bg-danger-500'
                            : category.percentage >= 85
                              ? 'bg-warning-500'
                              : 'bg-primary-500'
                        }`}
                        style={{ width: `${Math.min(category.percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-dark-200 bg-white/80 p-5 text-sm leading-6 text-dark-500">
                  Belum ada kategori yang mendekati batas. Kondisi budget kamu masih cukup sehat.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {!isFirstUse ? <AlertBanner /> : null}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <SummaryCard
          title="Pemasukan"
          value={formatIDR(totalIncome)}
          icon={TrendingUp}
          variant="income"
          note="Dana masuk yang sudah tercatat pada periode aktif."
        />
        <SummaryCard
          title="Pengeluaran"
          value={formatIDR(totalExpense)}
          icon={TrendingDown}
          variant="expense"
          note="Total uang keluar dari seluruh transaksi."
        />
        <SummaryCard
          title="Sisa Cashflow"
          value={formatIDR(Math.max(balance, 0))}
          icon={PiggyBank}
          variant="budget"
          note="Ruang aman yang masih tersedia setelah pengeluaran."
        />
      </div>

      {!isFirstUse ? <MonthlyHistoryPanel /> : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Link
          to="/transactions"
          className="card flex items-center justify-between p-5 transition-transform duration-200 hover:-translate-y-0.5"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-success-100 text-success-700">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-dark-800">Pemasukan</p>
              <p className="text-sm text-dark-500">Catat uang masuk baru</p>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-dark-400" />
        </Link>

        <Link
          to="/transactions"
          className="card flex items-center justify-between p-5 transition-transform duration-200 hover:-translate-y-0.5"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-danger-100 text-danger-600">
              <TrendingDown className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-dark-800">Pengeluaran</p>
              <p className="text-sm text-dark-500">Masukkan transaksi pengeluaran</p>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-dark-400" />
        </Link>

        <Link
          to="/categories"
          className="card flex items-center justify-between p-5 transition-transform duration-200 hover:-translate-y-0.5"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-100 text-primary-700">
              <PiggyBank className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-dark-800">Budget</p>
              <p className="text-sm text-dark-500">Atur spending cap per kategori</p>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-dark-400" />
        </Link>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" />
        </div>
      ) : null}

      {!isLoading && !isFirstUse ? (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <SpendingChart />
          <CategoryPieChart />
        </div>
      ) : null}

      {!isLoading && !isFirstUse ? (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="card p-5 lg:p-6">
            <PanelHeader
              title="Progress Budget"
              caption="Lihat kategori yang paling cepat menghabiskan cap."
              className="mb-5"
              aside={(
                <Link to="/categories" className="text-sm font-semibold text-primary-700 hover:text-primary-800">
                  Kelola
                </Link>
              )}
            />
            <CategoryProgressList />
          </div>

          <div className="card p-5 lg:p-6">
            <PanelHeader
              title="Transaksi Terbaru"
              caption="Snapshot singkat untuk aktivitas terakhir."
              className="mb-5"
              aside={(
                <Link to="/transactions" className="text-sm font-semibold text-primary-700 hover:text-primary-800">
                  Lihat semua
                </Link>
              )}
            />

            {recentTransactions.length > 0 ? (
              <div className="space-y-3">
                {recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="surface-muted flex items-center justify-between gap-3 p-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
                        transaction.type === 'income'
                          ? 'bg-success-100 text-success-700'
                          : 'bg-danger-100 text-danger-600'
                      }`}>
                        {transaction.type === 'income' ? (
                          <TrendingUp className="h-5 w-5" />
                        ) : (
                          <TrendingDown className="h-5 w-5" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-dark-800">
                          {transaction.description || (transaction.type === 'income' ? 'Pemasukan' : 'Pengeluaran')}
                        </p>
                        <p className="truncate text-xs text-dark-500">
                          {[transaction.category?.name || 'Tanpa kategori', formatShortDate(transaction.date)].join(' • ')}
                        </p>
                      </div>
                    </div>
                    <div className={`text-right text-sm font-bold ${
                      transaction.type === 'income' ? 'text-success-700' : 'text-danger-600'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}{formatIDR(transaction.amount)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="surface-muted p-5 text-sm leading-6 text-dark-500">
                Belum ada transaksi terbaru. Tambahkan transaksi pertama untuk mulai membaca ritme uangmu.
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
