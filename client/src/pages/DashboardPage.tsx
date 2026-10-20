import { useMemo } from 'react';
import { Bell, PiggyBank, Plus, Receipt, Tags } from 'lucide-react';
import AlertBanner from '../components/alerts/AlertBanner';
import SpendingChart from '../components/charts/SpendingChart';
import CategoryPieChart from '../components/charts/CategoryPieChart';
import BalanceCard from '../components/dashboard/BalanceCard';
import BudgetChecklist, { type BudgetItem } from '../components/dashboard/BudgetChecklist';
import BudgetGauge from '../components/dashboard/BudgetGauge';
import DailySpendBars from '../components/dashboard/DailySpendBars';
import ExpenseShareBar, { type ExpenseShareSegment } from '../components/dashboard/ExpenseShareBar';
import MonthSummaryAccordion from '../components/dashboard/MonthSummaryAccordion';
import MonthlyHistoryPanel from '../components/dashboard/MonthlyHistoryPanel';
import WeekStrip from '../components/dashboard/WeekStrip';
import FirstUsePanel from '../components/onboarding/FirstUsePanel';
import BrandMark from '../components/ui/BrandMark';
import StatFigure from '../components/ui/StatFigure';
import { useAvailableMonths } from '../hooks/useAvailableMonths';
import { useBurnRate } from '../hooks/useBurnRate';
import { useCategories } from '../hooks/useCategories';
import { useCategorySpending, useDashboardSummary } from '../hooks/useDashboardSummary';
import { useSelectedPeriod } from '../hooks/useSelectedPeriod';
import { useStaggerReveal } from '../hooks/useStaggerReveal';
import { useTransactions } from '../hooks/useTransactions';
import { getBudgetLevel } from '../lib/budgetStatus';
import { getDaysInMonth, getWeekOfMonth } from '../lib/period';
import { useAuthStore } from '../store/useAuthStore';

function getGreeting(hour: number) {
  if (hour < 11) return 'Selamat pagi';
  if (hour < 15) return 'Selamat siang';
  if (hour < 18) return 'Selamat sore';
  return 'Selamat malam';
}

function getDisplayName(email: string | undefined) {
  const handle = email?.split('@')[0]?.split(/[._-]/)[0] ?? '';
  return handle ? handle.charAt(0).toUpperCase() + handle.slice(1) : 'kamu';
}

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const { month, year, label, isCurrentPeriod } = useSelectedPeriod();
  const { totalIncome, totalExpense, balance, isLoading } = useDashboardSummary({ month, year });
  const { data: transactions } = useTransactions({ month, year });
  const { data: availableMonths } = useAvailableMonths();
  const { data: categories } = useCategories();
  const { data: burnRateResults } = useBurnRate({ month, year });
  const categorySpending = useCategorySpending({ month, year });
  const isFirstUse = !isLoading && (availableMonths?.length ?? 0) === 0 && (transactions?.length ?? 0) === 0;
  const scope = useStaggerReveal([isLoading, isFirstUse]);

  const daysInMonth = getDaysInMonth({ month, year });
  const weeksInMonth = getWeekOfMonth(daysInMonth);
  const todayDay = isCurrentPeriod ? new Date().getDate() : null;
  const weeksElapsed = todayDay !== null ? Math.max(1, getWeekOfMonth(todayDay)) : weeksInMonth;

  const dailyExpense = useMemo(() => {
    const daily = Array.from({ length: daysInMonth }, () => 0);
    for (const transaction of transactions ?? []) {
      if (transaction.type !== 'expense') continue;
      const day = Number(transaction.date.split('-')[2]);
      daily[day - 1] += transaction.amount;
    }
    return daily;
  }, [transactions, daysInMonth]);

  const budgetItems = useMemo<BudgetItem[]>(() => (
    (categories ?? [])
      .filter((category) => category.spending_cap > 0)
      .map((category) => {
        const spent = categorySpending.get(category.id) || 0;
        const percentage = (spent / category.spending_cap) * 100;

        return {
          id: category.id,
          name: category.name,
          color: category.color,
          spent,
          cap: category.spending_cap,
          percentage,
          level: getBudgetLevel(percentage),
        };
      })
      .sort((a, b) => b.percentage - a.percentage)
  ), [categories, categorySpending]);

  const shareSegments = useMemo<ExpenseShareSegment[]>(() => {
    const byCategory = new Map<string, number>();
    for (const transaction of transactions ?? []) {
      if (transaction.type !== 'expense') continue;
      const name = transaction.category?.name ?? 'Tanpa kategori';
      byCategory.set(name, (byCategory.get(name) ?? 0) + transaction.amount);
    }

    const sorted = [...byCategory.entries()]
      .map(([name, value]) => ({ label: name, value }))
      .sort((a, b) => b.value - a.value);
    const rest = sorted.slice(2).reduce((total, segment) => total + segment.value, 0);

    return rest > 0 ? [...sorted.slice(0, 2), { label: 'Lainnya', value: rest }] : sorted;
  }, [transactions]);

  const totalCap = budgetItems.reduce((total, item) => total + item.cap, 0);
  const totalCappedSpent = budgetItems.reduce((total, item) => total + item.spent, 0);
  const usedPercentage = totalCap > 0 ? (totalCappedSpent / totalCap) * 100 : null;

  // Proyeksi dari Burn Rate Engine; fallback ke rumus yang sama bila hasil server belum ada
  const projectedPercentage = useMemo(() => {
    if (totalCap === 0) return null;

    const results = burnRateResults ?? [];
    if (results.length > 0) {
      const projected = results.reduce((total, result) => total + result.projected_total, 0);
      const caps = results.reduce((total, result) => total + result.spending_cap, 0);
      return caps > 0 ? (projected / caps) * 100 : null;
    }

    const weeklyAverage = totalCappedSpent / weeksElapsed;
    return ((totalCappedSpent + weeklyAverage * (weeksInMonth - weeksElapsed)) / totalCap) * 100;
  }, [burnRateResults, totalCap, totalCappedSpent, weeksElapsed, weeksInMonth]);

  const activeAlertCount = (burnRateResults ?? []).filter((result) => result.alert_level !== null).length;

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <BrandMark className="h-10 w-10 animate-pulse" />
        <p className="text-sm text-dark-500">Menyiapkan ringkasan {label}...</p>
      </div>
    );
  }

  return (
    <div ref={scope} className="space-y-6">
      <section data-reveal className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-white bg-white/70 px-3 py-1 text-xs font-medium text-dark-600 shadow-soft">
            <span className="h-1.5 w-1.5 rounded-full bg-primary-400" />
            {label}
          </p>
          <h1 className="mt-3 text-4xl font-light tracking-tight text-dark-900 lg:text-5xl">
            {getGreeting(new Date().getHours())}, {getDisplayName(user?.email)}
          </h1>
        </div>
        <div className="flex gap-8 lg:gap-10">
          <StatFigure value={transactions?.length ?? 0} label="Transaksi" icon={Receipt} />
          <StatFigure value={categories?.length ?? 0} label="Kategori" icon={Tags} />
          <StatFigure value={activeAlertCount} label="Alert" icon={Bell} />
        </div>
      </section>

      <ExpenseShareBar
        segments={shareSegments}
        totalExpense={totalExpense}
        spendRatio={totalIncome > 0 ? (totalExpense / totalIncome) * 100 : null}
      />

      {isFirstUse ? (
        <div data-reveal>
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
          />
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_1.15fr]">
        <BalanceCard
          balance={balance}
          income={totalIncome}
          expense={totalExpense}
          periodLabel={label}
        />
        <DailySpendBars
          daily={dailyExpense}
          todayDay={todayDay}
          weeklyAverage={totalExpense / weeksElapsed}
        />
        <BudgetGauge
          usedPercentage={usedPercentage}
          projectedPercentage={projectedPercentage}
          totalCap={totalCap}
          totalSpent={totalCappedSpent}
        />
        <BudgetChecklist items={budgetItems} className="md:row-span-2" />
        <MonthSummaryAccordion
          transactions={transactions ?? []}
          burnRateResults={burnRateResults ?? []}
          className="xl:self-start"
        />
        <WeekStrip
          key={`${year}-${month}`}
          transactions={transactions ?? []}
          month={month}
          year={year}
          todayDay={todayDay}
          className="md:col-span-2"
        />
      </div>

      {!isFirstUse ? <AlertBanner /> : null}

      {!isFirstUse ? (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <SpendingChart />
          <CategoryPieChart />
        </div>
      ) : null}

      {!isFirstUse ? <MonthlyHistoryPanel /> : null}
    </div>
  );
}
