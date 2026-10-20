import { useState } from 'react';
import { Check, X } from 'lucide-react';
import { formatIDR } from '../../lib/formatCurrency';
import Modal from '../ui/Modal';
import type { Category, CategoryFormData } from '../../types';

// Palet hangat yang selaras dengan tema krem-kuning
const CATEGORY_COLORS = [
  '#181715', '#f4c63d', '#e8853d', '#c2543f', '#7a9a5b',
  '#4f8a8b', '#6b7fb0', '#9b7bb8', '#d4a373', '#8d6e63',
];

interface CategoryFormProps {
  category?: Category;
  onSubmit: (data: CategoryFormData) => Promise<void>;
  onClose: () => void;
  isSubmitting?: boolean;
}

export default function CategoryForm({ category, onSubmit, onClose, isSubmitting }: CategoryFormProps) {
  const [formData, setFormData] = useState<CategoryFormData>({
    name: category?.name ?? '',
    icon: category?.icon ?? 'tag',
    color: category?.color ?? CATEGORY_COLORS[1],
    spending_cap: category?.spending_cap ?? 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    await onSubmit(formData);
  };

  return (
    <Modal onClose={onClose} labelledBy="category-form-title" className="max-w-lg">
      <div className="flex items-start justify-between gap-4 px-6 pt-6">
        <div>
          <h2 id="category-form-title" className="text-2xl font-light tracking-tight text-dark-900">
            {category ? 'Edit kategori' : 'Kategori baru'}
          </h2>
          <p className="mt-1 text-sm text-dark-500">
            {category ? 'Sesuaikan nama, warna, dan cap.' : 'Petakan pengeluaran dengan lebih jelas.'}
          </p>
        </div>
        <button type="button" onClick={onClose} className="icon-btn" aria-label="Tutup">
          <X className="h-4 w-4" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 p-6">
        <div className="flex items-center gap-3 rounded-3xl bg-dark-900 p-4 text-white">
          <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15">
            <span className="h-4 w-4 rounded-full" style={{ backgroundColor: formData.color }} />
          </span>
          <div className="min-w-0">
            <p className="truncate font-medium">{formData.name || 'Nama kategori'}</p>
            <p className="text-xs text-white/55">
              {formData.spending_cap > 0 ? `Cap ${formatIDR(formData.spending_cap)} / bulan` : 'Tanpa spending cap'}
            </p>
          </div>
        </div>

        <div>
          <label className="label">Nama kategori</label>
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
          <label className="label">Spending cap per bulan</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400">Rp</span>
            <input
              type="number"
              value={formData.spending_cap || ''}
              onChange={(e) => setFormData({ ...formData, spending_cap: parseInt(e.target.value, 10) || 0 })}
              className="input pl-11"
              placeholder="0 = tidak terbatas"
              min="0"
            />
          </div>
          <p className="mt-2 text-xs text-dark-500">Isi 0 bila kategori ini tidak perlu batas budget bulanan.</p>
        </div>

        <div>
          <label className="label">Warna</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORY_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setFormData({ ...formData, color })}
                aria-label={`Warna ${color}`}
                aria-pressed={formData.color === color}
                className={`h-9 w-9 rounded-full transition-transform duration-200 ${
                  formData.color === color
                    ? 'scale-110 ring-2 ring-dark-900 ring-offset-2 ring-offset-[#fbf9f4]'
                    : 'hover:scale-105'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row">
          <button type="button" onClick={onClose} className="btn-ghost sm:min-w-[112px]">
            Batal
          </button>
          <button type="submit" disabled={isSubmitting} className="btn-primary flex-1 py-3">
            <Check className="h-4 w-4" />
            {category ? 'Simpan perubahan' : 'Tambah kategori'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
