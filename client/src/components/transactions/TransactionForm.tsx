import { useState } from 'react';
import { X, Check, TrendingUp, TrendingDown, Pencil } from 'lucide-react';
import { buildPeriodDate, getCurrentPeriod } from '../../lib/period';
import type { Category, TransactionFormData, Transaction } from '../../types';

interface TransactionFormProps {
  categories: Category[];
  transaction?: Transaction;
  selectedMonth: number;
  selectedYear: number;
  onSubmit: (data: TransactionFormData) => Promise<void>;
  onClose: () => void;
  isSubmitting?: boolean;
}

export default function TransactionForm({
  categories,
  transaction,
  selectedMonth,
  selectedYear,
  onSubmit,
  onClose,
  isSubmitting,
}: TransactionFormProps) {
  const currentPeriod = getCurrentPeriod();
  const today = new Date();
  const defaultDate = selectedMonth === currentPeriod.month && selectedYear === currentPeriod.year
    ? today.toISOString().split('T')[0]
    : buildPeriodDate({ month: selectedMonth, year: selectedYear }, today.getDate());

  const [formData, setFormData] = useState<TransactionFormData>({
    type: transaction?.type || 'expense',
    amount: transaction?.amount || 0,
    category_id: transaction?.category_id || null,
    description: transaction?.description || '',
    date: transaction?.date || defaultDate,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.amount <= 0) return;
    await onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-dark-900/35 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md overflow-hidden rounded-[22px] border border-white/80 bg-white shadow-elevated animate-slide-up">
        <div className="p-6 border-b border-dark-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${transaction ? 'bg-warning-100' : 'bg-primary-100'}`}>
                {transaction ? (
                  <Pencil className="w-5 h-5 text-warning-600" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-primary-600" />
                )}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-dark-900">
                  {transaction ? 'Edit Transaksi' : 'Tambah Transaksi'}
                </h2>
                <p className="text-sm text-dark-500">
                  {transaction ? 'Perbarui detail transaksi' : 'Catat transaksi baru'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-xl border border-dark-200 p-2 text-dark-400 transition-colors hover:bg-dark-50 hover:text-dark-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="surface-muted flex gap-2 p-1.5">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'income' })}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 font-semibold transition-all ${
                formData.type === 'income'
                  ? 'bg-success-500 text-white shadow-soft'
                  : 'text-dark-500 hover:text-dark-700'
              }`}
            >
              <TrendingUp className="w-5 h-5" />
              Pemasukan
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'expense' })}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 font-semibold transition-all ${
                formData.type === 'expense'
                  ? 'bg-danger-500 text-white shadow-soft'
                  : 'text-dark-500 hover:text-dark-700'
              }`}
            >
              <TrendingDown className="w-5 h-5" />
              Pengeluaran
            </button>
          </div>

          <div>
            <label className="label">Jumlah</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400">Rp</span>
              <input
                type="number"
                value={formData.amount || ''}
                onChange={(e) => setFormData({ ...formData, amount: parseInt(e.target.value) || 0 })}
                className="input pl-10 text-lg font-semibold"
                placeholder="0"
                min="1"
                required
              />
            </div>
          </div>

          <div>
            <label className="label">Kategori</label>
            <select
              value={formData.category_id || ''}
              onChange={(e) => setFormData({ ...formData, category_id: e.target.value || null })}
              className="input"
            >
              <option value="">Pilih kategori</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Deskripsi</label>
            <input
              type="text"
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input"
              placeholder={formData.type === 'income' ? 'Contoh: Gaji bulanan' : 'Contoh: Makan siang'}
            />
          </div>

          <div>
            <label className="label">Tanggal</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="input"
              required
            />
          </div>

          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <button
              type="submit"
              disabled={isSubmitting || formData.amount <= 0}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 font-semibold transition-all ${
                formData.type === 'income'
                  ? 'bg-success-500 hover:bg-success-600 text-white'
                  : 'bg-danger-500 hover:bg-danger-600 text-white'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <Check className="w-5 h-5" />
              {isSubmitting ? 'Menyimpan...' : (transaction ? 'Simpan' : 'Tambah')}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-dark-200 px-4 py-3 font-medium text-dark-600 transition-colors hover:bg-dark-50 sm:min-w-[112px]"
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
