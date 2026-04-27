import { useState } from 'react';
import { X, Check, TrendingUp, TrendingDown, Pencil } from 'lucide-react';
import type { Category, TransactionFormData, Transaction } from '../../types';

interface TransactionFormProps {
  categories: Category[];
  transaction?: Transaction;
  onSubmit: (data: TransactionFormData) => Promise<void>;
  onClose: () => void;
  isSubmitting?: boolean;
}

export default function TransactionForm({
  categories,
  transaction,
  onSubmit,
  onClose,
  isSubmitting,
}: TransactionFormProps) {
  const today = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState<TransactionFormData>({
    type: transaction?.type || 'expense',
    amount: transaction?.amount || 0,
    category_id: transaction?.category_id || null,
    description: transaction?.description || '',
    date: transaction?.date || today,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.amount <= 0) return;
    await onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-elevated w-full max-w-md animate-slide-up">
        <div className="p-6 border-b border-dark-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${transaction ? 'bg-warning-100' : 'bg-primary-100'}`}>
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
                <p className="text-sm text-dark-400">
                  {transaction ? 'Perbarui detail transaksi' : 'Catat transaksi baru'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-dark-400 hover:text-dark-600 hover:bg-dark-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Type Toggle */}
          <div className="flex gap-2 p-1 bg-dark-100 rounded-xl">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'income' })}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                formData.type === 'income'
                  ? 'bg-success-500 text-white shadow-md'
                  : 'text-dark-500 hover:text-dark-700'
              }`}
            >
              <TrendingUp className="w-5 h-5" />
              Pemasukan
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'expense' })}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                formData.type === 'expense'
                  ? 'bg-danger-500 text-white shadow-md'
                  : 'text-dark-500 hover:text-dark-700'
              }`}
            >
              <TrendingDown className="w-5 h-5" />
              Pengeluaran
            </button>
          </div>

          {/* Amount */}
          <div>
            <label className="label">Jumlah</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400">Rp</span>
              <input
                type="number"
                value={formData.amount || ''}
                onChange={(e) => setFormData({ ...formData, amount: parseInt(e.target.value) || 0 })}
                className="input pl-10"
                placeholder="0"
                min="1"
                required
              />
            </div>
          </div>

          {/* Category */}
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

          {/* Description */}
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

          {/* Date */}
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

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={isSubmitting || formData.amount <= 0}
              className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
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
              className="py-3 px-4 rounded-xl font-medium border border-dark-200 text-dark-600 hover:bg-dark-50 transition-colors"
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}