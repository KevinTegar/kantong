import { useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Pencil, Plus, Tag, Target, Trash2, TriangleAlert } from 'lucide-react';
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '../hooks/useCategories';
import { useBurnRate } from '../hooks/useBurnRate';
import { useCategorySpending } from '../hooks/useDashboardSummary';
import { useSelectedPeriod } from '../hooks/useSelectedPeriod';
import { useStaggerReveal } from '../hooks/useStaggerReveal';
import { useTransactions } from '../hooks/useTransactions';
import AlertBadge from '../components/alerts/AlertBadge';
import CategoryForm from '../components/categories/CategoryForm';
import AnimatedNumber from '../components/ui/AnimatedNumber';
import BrandMark from '../components/ui/BrandMark';
import PageHeader from '../components/ui/PageHeader';
import ProgressBar from '../components/ui/ProgressBar';
import StatFigure from '../components/ui/StatFigure';
import { budgetLevelStyles, getBudgetLevel } from '../lib/budgetStatus';
import { formatIDR, formatIDRCompact } from '../lib/formatCurrency';
import { EASE_OUT, gsap, prefersReducedMotion, useGSAP } from '../lib/motion';
import { getDaysInMonth, getWeekOfMonth } from '../lib/period';
import { useToastStore } from '../store/useToastStore';
import type { Category, CategoryFormData } from '../types';

const WEEKDAYS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

export default function CategoriesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [form, setForm] = useState<{ open: boolean; category?: Category }>({ open: false });
  const { month, year, label, isCurrentPeriod } = useSelectedPeriod();
  const pushToast = useToastStore((state) => state.push);

  const { data: categories, isLoading } = useCategories();
  const { data: transactions } = useTransactions({ month, year });
  const { data: burnRateResults } = useBurnRate({ month, year });
  const spendingMap = useCategorySpending({ month, year });
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();
  const scope = useStaggerReveal([isLoading]);
  const detailRef = useRef<HTMLDivElement>(null);

  const categoriesWithBudget = useMemo(() => {
    if (!categories) return [];

    return categories.map((category) => {
      const spent = spendingMap.get(category.id) || 0;
      const percentage = category.spending_cap > 0 ? (spent / category.spending_cap) * 100 : 0;

      return {
        ...category,
        spent,
        percentage,
        remaining: Math.max(0, category.spending_cap - spent),
        level: getBudgetLevel(percentage),
      };
    });
  }, [categories, spendingMap]);

  const cappedCount = categoriesWithBudget.filter((category) => category.spending_cap > 0).length;
  const atRiskCount = categoriesWithBudget.filter((category) => category.spending_cap > 0 && category.percentage >= 85).length;

  const selected = categoriesWithBudget.find((category) => category.id === searchParams.get('id'))
    ?? categoriesWithBudget[0];

  const daysInMonth = getDaysInMonth({ month, year });
  const weeksInMonth = getWeekOfMonth(daysInMonth);
  const todayDay = isCurrentPeriod ? new Date().getDate() : null;
  const weeksElapsed = todayDay !== null ? getWeekOfMonth(todayDay) : weeksInMonth;
  const leadingBlanks = (new Date(year, month - 1, 1).getDay() + 6) % 7;

  const dailySpending = useMemo(() => {
    const daily = new Map<number, number>();
    if (!selected) return daily;

    for (const tx of transactions ?? []) {
      if (tx.type !== 'expense' || tx.category_id !== selected.id) continue;
      const day = Number(tx.date.split('-')[2]);
      daily.set(day, (daily.get(day) ?? 0) + tx.amount);
    }
    return daily;
  }, [transactions, selected]);

  // Angka burn rate dari server; fallback ke rumus Burn Rate Engine untuk kategori tanpa hasil
  const burnRate = burnRateResults?.find((result) => result.category_id === selected?.id);
  const weeklyAverage = burnRate?.weekly_average ?? (selected ? selected.spent / weeksElapsed : 0);
  const projectedTotal = burnRate?.projected_total
    ?? (selected ? selected.spent + weeklyAverage * (weeksInMonth - weeksElapsed) : 0);
  const projectedPercentage = selected && selected.spending_cap > 0 ? (projectedTotal / selected.spending_cap) * 100 : 0;

  useGSAP(() => {
    if (!selected || prefersReducedMotion()) return;

    gsap.fromTo(
      '[data-detail]',
      { autoAlpha: 0, y: 12 },
      { autoAlpha: 1, y: 0, duration: 0.5, ease: EASE_OUT, stagger: 0.05, overwrite: true }
    );
  }, { scope: detailRef, dependencies: [selected?.id] });

  const selectCategory = (id: string) => setSearchParams({ id }, { replace: true });

  const handleSubmit = async (data: CategoryFormData) => {
    if (form.category) {
      await updateCategory.mutateAsync({ id: form.category.id, data });
      pushToast(`${data.name} diperbarui`);
    } else {
      const created = await createCategory.mutateAsync(data);
      selectCategory(created.id);
      pushToast(`${data.name} ditambahkan`);
    }
    setForm({ open: false });
  };

  const handleDelete = async (category: Category) => {
    if (!confirm(`Yakin ingin menghapus kategori ${category.name}?`)) return;
    await deleteCategory.mutateAsync(category.id);
    setSearchParams({}, { replace: true });
    pushToast(`${category.name} dihapus`);
  };

  return (
    <div ref={scope} className="space-y-6">
      <PageHeader
        eyebrow={label}
        title="Kategori"
        action={(
          <>
            <StatFigure value={categoriesWithBudget.length} label="Kategori" icon={Tag} />
            <StatFigure value={cappedCount} label="Punya cap" icon={Target} />
            <StatFigure value={atRiskCount} label="Perlu perhatian" icon={TriangleAlert} />
            <button type="button" onClick={() => setForm({ open: true })} className="btn-primary">
              <Plus className="h-4 w-4" />
              Kategori
            </button>
          </>
        )}
      />

      {isLoading ? (
        <div className="flex flex-col items-center gap-3 py-16">
          <BrandMark className="h-8 w-8 animate-pulse" />
          <p className="text-sm text-dark-500">Memuat kategori...</p>
        </div>
      ) : !selected ? (
        <div data-reveal className="card p-12 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-dark-50">
            <Tag className="h-6 w-6 text-dark-400" />
          </div>
          <h3 className="text-xl font-light text-dark-900">Belum ada kategori</h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-dark-500">
            Tambahkan kategori untuk mengelompokkan transaksi dan membaca budget dengan lebih jelas.
          </p>
          <button type="button" onClick={() => setForm({ open: true })} className="btn-primary mt-5">
            <Plus className="h-4 w-4" />
            Tambah kategori
          </button>
        </div>
      ) : (
        <div data-reveal className="card grid grid-cols-1 gap-3 p-3 lg:grid-cols-[240px_minmax(0,1fr)] xl:grid-cols-[240px_minmax(0,1fr)_288px]">
          <div className="min-w-0 rounded-3xl bg-white/45 p-2">
            <p className="eyebrow px-3 pb-2 pt-2">Daftar</p>
            <ul className="flex gap-1 overflow-x-auto scrollbar-none lg:block lg:space-y-0.5 lg:overflow-visible">
              {categoriesWithBudget.map((category) => {
                const isActive = category.id === selected.id;

                return (
                  <li key={category.id} className="flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => selectCategory(category.id)}
                      aria-current={isActive ? 'true' : undefined}
                      className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition-colors ${
                        isActive ? 'bg-dark-900 text-white shadow-soft' : 'text-dark-800 hover:bg-white/80'
                      }`}
                    >
                      <span
                        className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border ${
                          isActive ? 'border-white/15' : 'border-dark-200 bg-white'
                        }`}
                      >
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: category.color }} />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium">{category.name}</span>
                        <span className={`block truncate text-[11px] ${isActive ? 'text-white/55' : 'text-dark-500'}`}>
                          {category.spending_cap > 0 ? `${category.percentage.toFixed(0)}% dari cap` : 'Tanpa cap'}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <div ref={detailRef} className="contents">
            <div className="card-solid min-w-0 p-5">
              <div data-detail className="flex flex-wrap items-start justify-between gap-3">
                <p className="text-[34px] font-light leading-none tracking-tight text-dark-900">
                  <AnimatedNumber value={selected.spent} format={formatIDR} />
                  {selected.spending_cap > 0 ? (
                    <span className="text-lg text-dark-400"> / {formatIDR(selected.spending_cap)}</span>
                  ) : null}
                </p>
                <span className="text-xs text-dark-500">{label}</span>
              </div>
              <p data-detail className="mt-1.5 text-xs text-dark-500">Pengeluaran {selected.name} bulan ini</p>

              {selected.spending_cap > 0 ? (
                <div data-detail className="mt-4 flex items-center gap-2">
                  <ProgressBar
                    value={selected.percentage}
                    className="h-6 flex-1 bg-dark-100/70"
                    barClassName={selected.level === 'SAFE' ? 'bg-primary-400' : budgetLevelStyles[selected.level].bar}
                  />
                  <span className="rounded-full bg-dark-900 px-2.5 py-1 text-[11px] font-medium text-white">
                    {selected.percentage.toFixed(0)}%
                  </span>
                  <span className="hidden rounded-full bg-dark-100 px-2.5 py-1 text-[11px] font-medium text-dark-600 sm:inline">
                    Proyeksi {projectedPercentage.toFixed(0)}%
                  </span>
                </div>
              ) : (
                <div data-detail className="bg-hatch mt-4 flex h-6 items-center rounded-full border border-dark-200 px-3 text-[11px] text-dark-600">
                  Tanpa spending cap
                </div>
              )}

              <div data-detail className="mt-6 grid grid-cols-7 gap-1 sm:gap-1.5">
                {WEEKDAYS.map((weekday) => (
                  <span key={weekday} className="pb-1 text-center text-[11px] text-dark-400">{weekday}</span>
                ))}
                {Array.from({ length: leadingBlanks }, (_, index) => (
                  <span key={`blank-${index}`} />
                ))}
                {Array.from({ length: daysInMonth }, (_, index) => {
                  const day = index + 1;
                  const amount = dailySpending.get(day) ?? 0;
                  const isToday = day === todayDay;

                  return (
                    <div
                      key={day}
                      className={`min-h-[52px] min-w-0 rounded-xl border p-1 sm:min-h-[60px] sm:rounded-2xl sm:p-1.5 ${
                        isToday ? 'border-dark-900' : 'border-dark-100'
                      } ${amount > 0 ? 'bg-white' : 'bg-transparent'}`}
                    >
                      <span className={`text-[11px] ${isToday ? 'font-semibold text-dark-900' : 'text-dark-500'}`}>{day}</span>
                      {amount > 0 ? (
                        <>
                          <span className="mt-1.5 block h-1.5 w-1.5 rounded-full bg-primary-500 sm:hidden">
                            <span className="sr-only">{formatIDR(amount)}</span>
                          </span>
                          <span
                            title={formatIDR(amount)}
                            className="mt-1 hidden truncate rounded-full bg-primary-300 px-1.5 py-0.5 text-center text-[10px] font-medium text-dark-900 sm:block"
                          >
                            {formatIDRCompact(amount)}
                          </span>
                        </>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="min-w-0 rounded-3xl bg-white/45 p-5 lg:col-start-2 xl:col-start-auto">
              <div data-detail className="flex flex-col items-center text-center">
                <span className="flex h-16 w-16 items-center justify-center rounded-full border border-white bg-white shadow-card">
                  <span className="h-6 w-6 rounded-full" style={{ backgroundColor: selected.color }} />
                </span>
                <p className="mt-3 text-lg font-medium text-dark-900">{selected.name}</p>
                <span className={`mt-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                  selected.spending_cap > 0 ? budgetLevelStyles[selected.level].badge : 'bg-dark-100 text-dark-600'
                }`}
                >
                  {selected.spending_cap > 0 ? budgetLevelStyles[selected.level].label : 'Fleksibel'}
                </span>
              </div>

              <dl data-detail className="mt-6 space-y-2.5 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-dark-500">Cap bulanan</dt>
                  <dd className="font-medium text-dark-900">{selected.spending_cap > 0 ? formatIDR(selected.spending_cap) : '–'}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-dark-500">Sisa</dt>
                  <dd className="font-medium text-dark-900">{selected.spending_cap > 0 ? formatIDR(selected.remaining) : '–'}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-dark-500">Rata-rata / minggu</dt>
                  <dd className="font-medium text-dark-900">{formatIDR(weeklyAverage)}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-dark-500">Proyeksi akhir bulan</dt>
                  <dd className="font-medium text-dark-900">{formatIDR(projectedTotal)}</dd>
                </div>
                {burnRate?.alert_level ? (
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-dark-500">Burn rate</dt>
                    <dd><AlertBadge level={burnRate.alert_level} /></dd>
                  </div>
                ) : null}
              </dl>

              <div data-detail className="mt-6 space-y-3 border-t border-dark-100 pt-5">
                <p className="eyebrow">Bulan ini</p>
                {selected.spending_cap > 0 ? (
                  <>
                    <div>
                      <div className="mb-1.5 flex justify-between text-xs">
                        <span className="text-dark-500">Terpakai</span>
                        <span className="text-dark-800">{selected.percentage.toFixed(0)}%</span>
                      </div>
                      <ProgressBar value={selected.percentage} className="h-1.5 bg-dark-100" />
                    </div>
                    <div>
                      <div className="mb-1.5 flex justify-between text-xs">
                        <span className="text-dark-500">Proyeksi</span>
                        <span className="text-dark-800">{projectedPercentage.toFixed(0)}%</span>
                      </div>
                      <ProgressBar
                        value={projectedPercentage}
                        className="h-1.5 bg-dark-100"
                        barClassName={budgetLevelStyles[getBudgetLevel(projectedPercentage)].bar}
                      />
                    </div>
                  </>
                ) : null}
                <div>
                  <div className="mb-1.5 flex justify-between text-xs">
                    <span className="text-dark-500">Minggu berjalan</span>
                    <span className="text-dark-800">{weeksElapsed} / {weeksInMonth}</span>
                  </div>
                  <ProgressBar value={(weeksElapsed / weeksInMonth) * 100} className="h-1.5 bg-dark-100" barClassName="bg-primary-400" />
                </div>
              </div>

              <div data-detail className="mt-6 flex gap-2">
                <button type="button" onClick={() => setForm({ open: true, category: selected })} className="btn-secondary flex-1">
                  <Pencil className="h-4 w-4" />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(selected)}
                  className="btn-ghost hover:bg-red-50 hover:text-red-600"
                  aria-label={`Hapus ${selected.name}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {form.open ? (
        <CategoryForm
          category={form.category}
          onSubmit={handleSubmit}
          onClose={() => setForm({ open: false })}
          isSubmitting={createCategory.isPending || updateCategory.isPending}
        />
      ) : null}
    </div>
  );
}
