import { useMemo, useRef, useState } from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { useTransactions, useCreateTransaction, useUpdateTransaction, useDeleteTransaction } from '../hooks/useTransactions';
import { useCategories } from '../hooks/useCategories';
import { useSelectedPeriod } from '../hooks/useSelectedPeriod';
import { useStaggerReveal } from '../hooks/useStaggerReveal';
import FirstUsePanel from '../components/onboarding/FirstUsePanel';
import TransactionForm from '../components/transactions/TransactionForm';
import BrandMark from '../components/ui/BrandMark';
import PageHeader from '../components/ui/PageHeader';
import StatFigure from '../components/ui/StatFigure';
import { formatIDR } from '../lib/formatCurrency';
import { EASE_OUT, gsap, prefersReducedMotion, useGSAP } from '../lib/motion';
import { useToastStore } from '../store/useToastStore';
import type { TransactionType, TransactionFormData, Transaction } from '../types';

const ROW_GRID = 'lg:grid lg:grid-cols-[minmax(0,2.2fr)_minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,0.9fr)_minmax(0,1.1fr)_72px]';

export default function TransactionsPage() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<TransactionType | ''>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>(undefined);
  const { month, year, label } = useSelectedPeriod();
  const pushToast = useToastStore((state) => state.push);

  const { data: transactions, isLoading } = useTransactions({ month, year });
  const { data: categories } = useCategories();
  const createTransaction = useCreateTransaction();
  const updateTransaction = useUpdateTransaction();
  const deleteTransaction = useDeleteTransaction();
  const scope = useStaggerReveal([isLoading]);
  const listRef = useRef<HTMLDivElement>(null);

  const filteredTransactions = useMemo(() => {
    if (!transactions) return [];

    return transactions.filter((tx) => {
      const matchesSearch = search === ''
        || tx.description?.toLowerCase().includes(search.toLowerCase())
        || formatIDR(tx.amount).includes(search);

      const matchesType = typeFilter === '' || tx.type === typeFilter;
      const matchesCategory = categoryFilter === '' || tx.category_id === categoryFilter;

      return matchesSearch && matchesType && matchesCategory;
    });
  }, [transactions, search, typeFilter, categoryFilter]);

  const typeCounts = useMemo(() => ({
    all: transactions?.length ?? 0,
    income: transactions?.filter((t) => t.type === 'income').length ?? 0,
    expense: transactions?.filter((t) => t.type === 'expense').length ?? 0,
  }), [transactions]);

  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const tx of transactions ?? []) {
      if (tx.category_id) counts.set(tx.category_id, (counts.get(tx.category_id) ?? 0) + 1);
    }
    return counts;
  }, [transactions]);

  const filterKey = [search, typeFilter, categoryFilter, filteredTransactions.length].join('|');

  // Baris muncul bertahap setiap kali filter berubah, seperti tabel People di Coterie
  useGSAP(() => {
    if (prefersReducedMotion()) return;

    gsap.fromTo(
      '[data-row]',
      { autoAlpha: 0, y: 8 },
      { autoAlpha: 1, y: 0, duration: 0.4, ease: EASE_OUT, stagger: 0.025, overwrite: true }
    );
  }, { scope: listRef, dependencies: [filterKey] });

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('id-ID', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });

  const totalIncome = transactions?.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0) || 0;
  const totalExpense = transactions?.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0) || 0;

  const handleAddTransaction = async (data: TransactionFormData) => {
    await createTransaction.mutateAsync(data);
    setIsFormOpen(false);
    setEditingTransaction(undefined);
    pushToast(data.type === 'income' ? 'Pemasukan tercatat' : 'Pengeluaran tercatat');
  };

  const handleEditTransaction = async (data: TransactionFormData) => {
    if (!editingTransaction) return;
    await updateTransaction.mutateAsync({ id: editingTransaction.id, data });
    setIsFormOpen(false);
    setEditingTransaction(undefined);
    pushToast('Transaksi diperbarui');
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!confirm('Yakin ingin menghapus transaksi ini?')) return;
    await deleteTransaction.mutateAsync(id);
    pushToast('Transaksi dihapus');
  };

  const openEditForm = (tx: Transaction) => {
    setEditingTransaction(tx);
    setIsFormOpen(true);
  };

  const openAddForm = () => {
    setEditingTransaction(undefined);
    setIsFormOpen(true);
  };

  const typeChips: { value: TransactionType | ''; label: string; count: number }[] = [
    { value: '', label: 'Semua', count: typeCounts.all },
    { value: 'income', label: 'Pemasukan', count: typeCounts.income },
    { value: 'expense', label: 'Pengeluaran', count: typeCounts.expense },
  ];

  return (
    <div ref={scope} className="space-y-6">
      <PageHeader
        eyebrow={label}
        title="Transaksi"
        action={(
          <>
            <StatFigure value={totalIncome} label="Pemasukan" icon={ArrowUpRight} format={formatIDR} />
            <StatFigure value={totalExpense} label="Pengeluaran" icon={ArrowDownRight} format={formatIDR} />
            <StatFigure value={filteredTransactions.length} label="Hasil filter" />
          </>
        )}
      />

      <div data-reveal className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-center gap-1 overflow-x-auto scrollbar-none [mask-image:linear-gradient(to_right,black_calc(100%-2.5rem),transparent)]">
          {typeChips.map((chip) => (
            <button
              key={chip.label}
              type="button"
              onClick={() => setTypeFilter(chip.value)}
              className={`chip ${typeFilter === chip.value ? 'chip-active' : ''}`}
            >
              {chip.label}
              <span className={typeFilter === chip.value ? 'text-white/60' : 'text-dark-400'}>{chip.count}</span>
            </button>
          ))}

          {categories && categories.length > 0 ? (
            <>
              <span className="mx-2 h-5 w-px flex-shrink-0 bg-dark-200" />
              <button
                type="button"
                onClick={() => setCategoryFilter('')}
                className={`chip ${categoryFilter === '' ? 'chip-active' : ''}`}
              >
                Semua kategori
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setCategoryFilter(category.id)}
                  className={`chip ${categoryFilter === category.id ? 'chip-active' : ''}`}
                >
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: category.color }} />
                  {category.name}
                  <span className={categoryFilter === category.id ? 'text-white/60' : 'text-dark-400'}>
                    {categoryCounts.get(category.id) ?? 0}
                  </span>
                </button>
              ))}
            </>
          ) : null}
        </div>

        <div className="flex flex-shrink-0 items-center gap-2">
          <div className="relative min-w-0 flex-1 lg:w-64 lg:flex-none">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-dark-400" />
            <input
              type="text"
              placeholder="Cari transaksi"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-pill pl-10 pr-9"
            />
            {search ? (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 z-10 -translate-y-1/2 text-dark-400 hover:text-dark-700"
                aria-label="Hapus pencarian"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </div>
          <button type="button" onClick={openAddForm} className="btn-primary flex-shrink-0">
            <Plus className="h-4 w-4" />
            Tambah
          </button>
        </div>
      </div>

      <div data-reveal className="card p-2 sm:p-3">
        {isLoading ? (
          <div className="flex flex-col items-center gap-3 py-16">
            <BrandMark className="h-8 w-8 animate-pulse" />
            <p className="text-sm text-dark-500">Memuat transaksi...</p>
          </div>
        ) : filteredTransactions.length === 0 ? (
          transactions?.length === 0 ? (
            <div className="p-2">
              <FirstUsePanel
                eyebrow={label}
                title="Belum ada transaksi di periode ini"
                description="Mulai dari satu catatan sederhana dulu. Setelah transaksi pertama masuk, daftar ini akan berubah jadi workspace harian untuk review pemasukan dan pengeluaranmu."
                highlights={[
                  'Gunakan tanggal yang sesuai supaya histori bulanan nanti tetap rapi.',
                  'Kamu bisa mulai dari pemasukan dulu, lalu tambahkan pengeluaran yang paling rutin.',
                  'Kalau mau lebih tertata, buat kategori sebelum mulai input banyak transaksi.',
                ]}
                actions={[
                  { label: 'Tambah Transaksi', onClick: openAddForm, icon: Plus },
                ]}
              />
            </div>
          ) : (
            <div className="py-16 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-dark-50">
                <Search className="h-6 w-6 text-dark-400" />
              </div>
              <h3 className="text-lg font-light text-dark-900">Tidak ada hasil</h3>
              <p className="mt-1 text-sm text-dark-500">Coba ubah kata kunci atau filter yang sedang aktif.</p>
            </div>
          )
        ) : (
          <div ref={listRef}>
            <div className={`hidden gap-3 px-4 pb-2 pt-2 text-xs text-dark-400 ${ROW_GRID}`}>
              <span>Deskripsi</span>
              <span>Kategori</span>
              <span>Tanggal</span>
              <span>Tipe</span>
              <span>Jumlah</span>
              <span />
            </div>

            <div className="space-y-0.5">
              {filteredTransactions.map((tx) => {
                const isIncome = tx.type === 'income';
                const title = tx.description || (isIncome ? 'Pemasukan' : 'Pengeluaran');

                return (
                  <div
                    key={tx.id}
                    data-row
                    className={`group flex items-center gap-3 rounded-2xl px-3 py-3 transition-colors hover:bg-primary-100/70 lg:px-4 ${ROW_GRID}`}
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <span
                        className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full ${
                          isIncome ? 'bg-primary-100 text-primary-800' : 'bg-dark-100 text-dark-700'
                        }`}
                      >
                        {isIncome ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-dark-900">{title}</p>
                        <p className="truncate text-xs text-dark-500 lg:hidden">
                          {[tx.category?.name || 'Tanpa kategori', formatDate(tx.date)].join(' • ')}
                        </p>
                      </div>
                    </div>

                    <div className="hidden min-w-0 items-center gap-2 text-sm text-dark-600 lg:flex">
                      {tx.category ? (
                        <>
                          <span className="h-2 w-2 flex-shrink-0 rounded-full" style={{ backgroundColor: tx.category.color }} />
                          <span className="truncate">{tx.category.name}</span>
                        </>
                      ) : (
                        <span className="text-dark-400">Tanpa kategori</span>
                      )}
                    </div>

                    <span className="hidden text-sm text-dark-600 lg:block">{formatDate(tx.date)}</span>

                    <span className="hidden lg:block">
                      {isIncome ? (
                        <span className="inline-flex items-center gap-1.5 text-xs text-success-600">
                          <span className="h-1.5 w-1.5 rounded-full bg-success-500" />
                          Pemasukan
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full bg-dark-900 px-2.5 py-0.5 text-[11px] text-white">
                          Pengeluaran
                        </span>
                      )}
                    </span>

                    <span className={`flex-shrink-0 text-sm font-medium tabular-nums ${isIncome ? 'text-success-600' : 'text-dark-900'}`}>
                      {isIncome ? '+' : '−'}{formatIDR(tx.amount)}
                    </span>

                    <div className="flex flex-shrink-0 justify-end gap-1 transition-opacity lg:opacity-0 lg:group-focus-within:opacity-100 lg:group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() => openEditForm(tx)}
                        className="rounded-full p-2 text-dark-500 transition-colors hover:bg-white hover:text-dark-900"
                        aria-label={`Edit ${title}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteTransaction(tx.id)}
                        className="rounded-full p-2 text-dark-500 transition-colors hover:bg-white hover:text-red-600"
                        aria-label={`Hapus ${title}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {isFormOpen && categories ? (
        <TransactionForm
          categories={categories}
          transaction={editingTransaction}
          selectedMonth={month}
          selectedYear={year}
          onSubmit={editingTransaction ? handleEditTransaction : handleAddTransaction}
          onClose={() => {
            setIsFormOpen(false);
            setEditingTransaction(undefined);
          }}
          isSubmitting={createTransaction.isPending || updateTransaction.isPending}
        />
      ) : null}
    </div>
  );
}
