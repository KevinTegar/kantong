import { useCategories } from '../../hooks/useCategories';
import { useCategorySpending } from '../../hooks/useDashboardSummary';
import { formatIDR } from '../../lib/formatCurrency';

export default function CategoryProgressList() {
  const { data: categories, isLoading } = useCategories();
  const spending = useCategorySpending();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="surface-muted animate-pulse p-4">
            <div className="mb-2 flex justify-between">
              <div className="h-4 w-24 rounded bg-dark-200" />
              <div className="h-4 w-32 rounded bg-dark-200" />
            </div>
            <div className="h-2 rounded-full bg-dark-200" />
          </div>
        ))}
      </div>
    );
  }

  if (!categories || categories.length === 0) {
    return (
      <p className="text-center py-6 text-dark-400">
        Belum ada kategori. Tambahkan di halaman Kategori.
      </p>
    );
  }

  const categoriesWithSpending = categories
    .map((cat) => ({
      ...cat,
      spent: spending.get(cat.id) || 0,
      percentage: cat.spending_cap > 0
        ? Math.min(100, ((spending.get(cat.id) || 0) / cat.spending_cap) * 100)
        : 0,
    }))
    .filter((cat) => cat.spending_cap > 0)
    .sort((a, b) => b.percentage - a.percentage);

  if (categoriesWithSpending.length === 0) {
    return (
      <p className="text-center py-6 text-dark-400">
        Tidak ada budget yang diatur.
      </p>
    );
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-danger-500';
    if (percentage >= 85) return 'bg-warning-500';
    if (percentage >= 70) return 'bg-warning-400';
    return 'bg-primary-500';
  };

  return (
    <div className="space-y-4">
      {categoriesWithSpending.map((category) => (
        <div key={category.id} className="surface-muted p-4">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
              <div
                className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
                style={{ backgroundColor: category.color }}
              />
                <span className="truncate text-sm font-semibold text-dark-800">
                {category.name}
              </span>
              </div>
              <p className="mt-1 text-xs text-dark-500">
                Sisa {formatIDR(Math.max(0, category.spending_cap - category.spent))}
              </p>
            </div>
            <span className="ml-2 flex-shrink-0 text-xs font-medium text-dark-500 sm:text-sm">
              {formatIDR(category.spent)} / {formatIDR(category.spending_cap)}
            </span>
          </div>
          <div className="h-2 rounded-full bg-dark-100 overflow-hidden">
            <div
              className={`h-full ${getProgressColor(category.percentage)} transition-all duration-500 rounded-full`}
              style={{ width: `${category.percentage}%` }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs text-dark-400">
              {category.percentage.toFixed(0)}% terpakai
            </span>
            <span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${
              category.percentage >= 100
                ? 'bg-danger-50 text-danger-700'
                : category.percentage >= 85
                  ? 'bg-warning-50 text-warning-700'
                  : 'bg-primary-50 text-primary-700'
            }`}>
              {category.percentage >= 100
                ? 'Melebihi cap'
                : category.percentage >= 85
                  ? 'Perlu perhatian'
                  : 'Masih aman'}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
