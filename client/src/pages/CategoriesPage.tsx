import { useState } from 'react';
import { Plus, Pencil, Trash2, Check, X, Tag, Palette, Target } from 'lucide-react';
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '../hooks/useCategories';
import { formatIDR } from '../lib/formatCurrency';
import type { Category, CategoryFormData } from '../types';

const PRESET_COLORS = [
  '#3b82f6', '#8b5cf6', '#ec4899', '#ef4444', '#f97316',
  '#eab308', '#22c55e', '#14b8a6', '#06b6d4', '#6366f1',
];

export default function CategoriesPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    icon: 'tag',
    color: '#3b82f6',
    spending_cap: 0,
  });

  const { data: categories, isLoading } = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

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
      setFormData({ name: '', icon: 'tag', color: '#3b82f6', spending_cap: 0 });
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
    setFormData({ name: '', icon: 'tag', color: '#3b82f6', spending_cap: 0 });
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-dark-900">Kategori</h1>
          <p className="text-dark-400 mt-1">Kelola kategori dan budget spending</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary inline-flex items-center gap-2 self-start"
          >
            <Plus className="w-5 h-5" />
            Tambah Kategori
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <div className="card p-6 animate-slide-up">
          <div className="flex items-center gap-3 mb-6">
            <div className={`p-3 rounded-xl ${editingId ? 'bg-warning-100' : 'bg-primary-100'}`}>
              {editingId ? (
                <Pencil className={`w-6 h-6 ${editingId ? 'text-warning-600' : 'text-primary-600'}`} />
              ) : (
                <Plus className="w-6 h-6 text-primary-600" />
              )}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-dark-800">
                {editingId ? 'Edit Kategori' : 'Kategori Baru'}
              </h2>
              <p className="text-sm text-dark-400">
                {editingId ? 'Perbarui detail kategori' : 'Tambahkan kategori baru'}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
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
                <Palette className="w-4 h-4" />
                Warna
              </label>
              <div className="flex flex-wrap gap-3">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData({ ...formData, color })}
                    className={`w-10 h-10 rounded-xl transition-all duration-200 ${
                      formData.color === color
                        ? 'ring-2 ring-offset-2 ring-primary-500 scale-110'
                        : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="label flex items-center gap-2">
                <Target className="w-4 h-4" />
                Spending Cap (per bulan)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400">Rp</span>
                <input
                  type="number"
                  value={formData.spending_cap || ''}
                  onChange={(e) => setFormData({ ...formData, spending_cap: parseInt(e.target.value) || 0 })}
                  className="input pl-10"
                  placeholder="0 = tidak terbatas"
                  min="0"
                />
              </div>
              <p className="text-sm text-dark-400 mt-2">
                Budget bulanan untuk kategori ini. 0 berarti tidak ada batasan.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={createCategory.isPending || updateCategory.isPending}
                className="btn-primary"
              >
                <Check className="w-5 h-5" />
                {editingId ? 'Simpan' : 'Tambah'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="btn-secondary"
              >
                <X className="w-5 h-5" />
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Categories Grid */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : !categories || categories.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-20 h-20 bg-dark-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Tag className="w-10 h-10 text-dark-400" />
          </div>
          <h3 className="text-lg font-semibold text-dark-700 mb-2">Belum ada kategori</h3>
          <p className="text-dark-400 mb-4">Tambahkan kategori untuk mulai mengelompokkan transaksi</p>
          <button onClick={() => setShowForm(true)} className="btn-primary inline-flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Tambah Kategori
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <div
              key={category.id}
              className="card p-5 hover:shadow-card transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${category.color}20` }}
                  >
                    <div
                      className="w-5 h-5 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-dark-800">{category.name}</h3>
                    <p className="text-sm text-dark-400">
                      {category.spending_cap > 0
                        ? `Budget: ${formatIDR(category.spending_cap)}`
                        : 'Tidak terbatas'}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEdit(category)}
                    className="p-2 text-dark-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="p-2 text-dark-400 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {category.spending_cap > 0 && (
                <div className="mt-3 pt-3 border-t border-dark-100">
                  <div className="flex justify-between text-xs text-dark-400 mb-2">
                    <span>Spending Cap</span>
                    <span className="font-medium text-dark-600">{formatIDR(category.spending_cap)}</span>
                  </div>
                  <div className="h-2 bg-dark-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ backgroundColor: category.color, width: '30%' }}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}