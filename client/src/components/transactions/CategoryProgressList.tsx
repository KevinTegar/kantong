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
          <div key={i} className="animate-pulse">
            <div className="flex justify-between mb-2">
              <div className="h-4 bg-dark-200 rounded w-24" />
              <div className="h-4 bg-dark-200 rounded w-32" />
            </div>
            <div className="h-2 bg-dark-200 rounded-full" />
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
        <div key={category.id} className="group">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 min-w-0">
              <div
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: category.color }}
              />
              <span className="text-sm font-medium text-dark-800 truncate">
                {category.name}
              </span>
            </div>
            <span className="text-xs sm:text-sm text-dark-500 flex-shrink-0 ml-2">
              {formatIDR(category.spent)} / {formatIDR(category.spending_cap)}
            </span>
          </div>
          <div className="h-2 bg-dark-100 rounded-full overflow-hidden">
            <div
              className={`h-full ${getProgressColor(category.percentage)} transition-all duration-500 rounded-full`}
              style={{ width: `${category.percentage}%` }}
            />
          </div>
          <div className="flex justify-between items-center mt-1.5">
            <span className="text-xs text-dark-400">
              {category.percentage.toFixed(0)}% terpakai
            </span>
            <span className="text-xs text-dark-400">
              Sisa: {formatIDR(Math.max(0, category.spending_cap - category.spent))}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}