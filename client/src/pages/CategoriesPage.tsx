import { useMemo, useState } from 'react';
import { Check, Palette, Pencil, Plus, Tag, Target, Trash2, X } from 'lucide-react';
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '../hooks/useCategories';
import { useSelectedPeriod } from '../hooks/useSelectedPeriod';
import { useCategorySpending } from '../hooks/useDashboardSummary';
import { formatIDR } from '../lib/formatCurrency';
import MetricCard from '../components/ui/MetricCard';
import PageHeader from '../components/ui/PageHeader';
import type { Category, CategoryFormData } from '../types';

const PRESET_COLORS = [
  '#467fae', '#6d5fc5', '#d9483b', '#c9881d', '#2f8f60',
  '#0f766e', '#5a67d8', '#ec6a5e', '#0ea5e9', '#8b5cf6',
];

export default function CategoriesPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    icon: 'tag',
    color: '#467fae',
    spending_cap: 0,
  });
  const { month, year, label } = useSelectedPeriod();

  const { data: categories, isLoading } = useCategories();
  const spendingMap = useCategorySpending({ month, year });
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

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
      };
    });
  }, [categories, spendingMap]);

  const cappedCategories = categoriesWithBudget.filter((category) => category.spending_cap > 0);
  const atRiskCount = cappedCategories.filter((category) => category.percentage >= 85).length;
  const uncappedCount = categoriesWithBudget.filter((category) => category.spending_cap === 0).length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      if (editingId) {
        await updateCategory.mutateAsync({ id: editingId, data: formData });
        setEditingId(null);
      } else {
        await createCategory.mutateAsync(formData);
      }
      setFormData({ name: '', icon: 'tag', color: '#467fae', spending_cap: 0 });
      setShowForm(false);
    } catch (error) {
      console.error('Failed to save category:', error);
    }
  };

  const handleEdit = (category: Category) => {
    setFormData({
      name: category.name,
      icon: category.icon,
      color: category.color,
      spending_cap: category.spending_cap,
    });
    setEditingId(category.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus kategori ini?')) return;
    await deleteCategory.mutateAsync(id);
  };

  const handleCancel = () => {
    setFormData({ name: '', icon: 'tag', color: '#467fae', spending_cap: 0 });
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        eyebrow={label}
        title="Kategori"
        description="Atur kategori sekaligus batas pengeluaran bulanan. Halaman ini dirancang supaya kamu bisa langsung melihat kategori yang sehat, rawan, atau perlu tindakan pada periode aktif."
        action={!showForm ? (
          <button onClick={() => setShowForm(true)} className="btn-primary">
            <Plus className="h-5 w-5" />
            Tambah Kategori
          </button>
        ) : undefined}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <MetricCard
          label="Total Kategori"
          value={categoriesWithBudget.length}
          icon={Tag}
          description="Semua kategori aktif yang saat ini bisa dipakai."
        />
        <MetricCard
          label="Punya Spending Cap"
          value={cappedCategories.length}
          icon={Target}
          tone="primary"
          description="Kategori yang sudah punya batas budget bulanan."
        />
        <MetricCard
          label="Perlu Perhatian"
          value={atRiskCount}
          icon={Palette}
          tone="warning"
          description={uncappedCount > 0 ? `${uncappedCount} kategori masih tanpa cap.` : 'Semua kategori sudah punya batas yang jelas atau aman.'}
        />
      </div>

      {showForm ? (
        <div className="card p-6 animate-slide-up">
          <div className="mb-6 flex items-center gap-3">
            <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${editingId ? 'bg-warning-100' : 'bg-primary-100'}`}>
              {editingId ? (
                <Pencil className="h-5 w-5 text-warning-700" />
              ) : (
                <Plus className="h-5 w-5 text-primary-700" />
              )}
            </div>
            <div>
              <h2 className="panel-title">{editingId ? 'Edit Kategori' : 'Kategori Baru'}</h2>
              <p className="panel-caption">
                {editingId ? 'Sesuaikan nama, warna, dan cap agar kontrol budget tetap akurat.' : 'Tambahkan kategori baru untuk memetakan pengeluaran dengan lebih jelas.'}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1fr_1fr]">
            <div className="space-y-6">
              <div>
                <label className="label">Nama Kategori</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input"
                  placeholder="Contoh: Makanan, Transportasi"
                  required
                />
              </div>

              <div>
                <label className="label flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Spending Cap (per bulan)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400">Rp</span>
                  <input
                    type="number"
                    value={formData.spending_cap || ''}
                    onChange={(e) => setFormData({ ...formData, spending_cap: parseInt(e.target.value, 10) || 0 })}
                    className="input pl-10"
                    placeholder="0 = tidak terbatas"
                    min="0"
                  />
                </div>
                <p className="mt-2 text-sm text-dark-500">
                  Gunakan `0` bila kategori ini tidak perlu punya batas budget bulanan.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="label flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  Warna Kategori
                </label>
                <div className="grid grid-cols-5 gap-3 sm:grid-cols-10 lg:grid-cols-5">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, color })}
                      className={`h-11 rounded-2xl transition-all duration-200 ${
                        formData.color === color
                          ? 'ring-2 ring-primary-500 ring-offset-2 scale-[1.03]'
                          : 'hover:scale-[1.02]'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="surface-muted p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-dark-400">Preview</p>
                <div className="mt-3 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl" style={{ backgroundColor: `${formData.color}20` }}>
                    <div className="h-5 w-5 rounded-full" style={{ backgroundColor: formData.color }} />
                  </div>
                  <div>
                    <p className="font-semibold text-dark-800">{formData.name || 'Nama kategori'}</p>
                    <p className="text-sm text-dark-500">
                      {formData.spending_cap > 0 ? `Cap ${formatIDR(formData.spending_cap)}` : 'Tanpa spending cap'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-2 sm:flex-row lg:col-span-2">
              <button
                type="submit"
                disabled={createCategory.isPending || updateCategory.isPending}
                className="btn-primary"
              >
                <Check className="h-5 w-5" />
                {editingId ? 'Simpan Perubahan' : 'Tambah Kategori'}
              </button>
              <button type="button" onClick={handleCancel} className="btn-secondary sm:min-w-[112px]">
                <X className="h-5 w-5" />
                Batal
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" />
        </div>
      ) : !categories || categories.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-dark-100">
            <Tag className="h-10 w-10 text-dark-400" />
          </div>
          <h3 className="mb-2 text-lg font-semibold text-dark-700">Belum ada kategori</h3>
          <p className="mb-4 text-dark-400">Tambahkan kategori untuk mulai mengelompokkan transaksi dan membaca budget dengan lebih jelas.</p>
          <button onClick={() => setShowForm(true)} className="btn-primary">
            <Plus className="h-5 w-5" />
            Tambah Kategori
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {categoriesWithBudget.map((category) => {
            const tone = category.percentage >= 100
              ? 'bg-danger-50 text-danger-700'
              : category.percentage >= 85
                ? 'bg-warning-50 text-warning-700'
                : 'bg-primary-50 text-primary-700';

            return (
              <div key={category.id} className="card p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-4">
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-2xl"
                      style={{ backgroundColor: `${category.color}20` }}
                    >
                      <div className="h-5 w-5 rounded-full" style={{ backgroundColor: category.color }} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate font-semibold text-dark-800">{category.name}</h3>
                      <p className="text-sm text-dark-500">
                        {category.spending_cap > 0
                          ? `Cap ${formatIDR(category.spending_cap)}`
                          : 'Tanpa spending cap'}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEdit(category)}
                      className="rounded-xl p-2 text-dark-400 transition-colors hover:bg-primary-50 hover:text-primary-600"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="rounded-xl p-2 text-dark-400 transition-colors hover:bg-danger-50 hover:text-danger-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {category.spending_cap > 0 ? (
                  <div className="mt-5 space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-dark-500">Terpakai {formatIDR(category.spent)}</span>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${tone}`}>
                        {category.percentage.toFixed(0)}%
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-dark-100">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(category.percentage, 100)}%`,
                          backgroundColor: category.color,
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-sm text-dark-500">
                      <span>Sisa {formatIDR(category.remaining)}</span>
                      <span>{category.percentage >= 100 ? 'Cap terlampaui' : 'Masih dalam kontrol'}</span>
                    </div>
                  </div>
                ) : (
                  <div className="mt-5 rounded-2xl border border-dashed border-dark-200 bg-dark-50 px-4 py-3 text-sm text-dark-500">
                    Kategori ini belum punya spending cap. Cocok untuk pengeluaran yang masih fleksibel.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
