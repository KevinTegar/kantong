import { useState } from 'react';
import { X, Check, TrendingUp, TrendingDown } from 'lucide-react';
import { buildPeriodDate, getCurrentPeriod } from '../../lib/period';
import Modal from '../ui/Modal';
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
    <Modal onClose={onClose} labelledBy="transaction-form-title">
      <div className="flex items-start justify-between gap-4 px-6 pt-6">
        <div>
          <h2 id="transaction-form-title" className="text-2xl font-light tracking-tight text-dark-900">
            {transaction ? 'Edit transaksi' : 'Catat transaksi'}
          </h2>
          <p className="mt-1 text-sm text-dark-500">
            {transaction ? 'Perbarui detail transaksi.' : 'Pemasukan atau pengeluaran baru.'}
          </p>
        </div>
        <button type="button" onClick={onClose} className="icon-btn" aria-label="Tutup">
          <X className="h-4 w-4" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 p-6">
        <div className="flex gap-1 rounded-full bg-dark-100/80 p-1">
          <button
            type="button"
            onClick={() => setFormData({ ...formData, type: 'income' })}
            className={`flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-all ${
              formData.type === 'income'
                ? 'bg-primary-400 text-dark-900 shadow-soft'
                : 'text-dark-500 hover:text-dark-800'
            }`}
          >
            <TrendingUp className="h-4 w-4" />
            Pemasukan
          </button>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, type: 'expense' })}
            className={`flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-all ${
              formData.type === 'expense'
                ? 'bg-dark-900 text-white shadow-soft'
                : 'text-dark-500 hover:text-dark-800'
            }`}
          >
            <TrendingDown className="h-4 w-4" />
            Pengeluaran
          </button>
        </div>

        <div>
          <label className="label">Jumlah</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-light text-dark-400">Rp</span>
            <input
              type="number"
              value={formData.amount || ''}
              onChange={(e) => setFormData({ ...formData, amount: parseInt(e.target.value) || 0 })}
              className="input pl-12 text-2xl font-light tracking-tight"
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

        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row">
          <button type="button" onClick={onClose} className="btn-ghost sm:min-w-[112px]">
            Batal
          </button>
          <button
            type="submit"
            disabled={isSubmitting || formData.amount <= 0}
            className={`flex-1 py-3 ${formData.type === 'income' ? 'btn-accent' : 'btn-primary'}`}
          >
            <Check className="h-4 w-4" />
            {isSubmitting ? 'Menyimpan...' : (transaction ? 'Simpan' : 'Tambah')}
          </button>
        </div>
      </form>
    </Modal>
  );
}
