import { useMemo, useState } from 'react';
import {
  ChevronDown,
  Filter,
  Pencil,
  Plus,
  ReceiptText,
  Search,
  Trash2,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { useTransactions, useCreateTransaction, useUpdateTransaction, useDeleteTransaction } from '../hooks/useTransactions';
import { useCategories } from '../hooks/useCategories';
import { formatIDR } from '../lib/formatCurrency';
import TransactionForm from '../components/transactions/TransactionForm';
import MetricCard from '../components/ui/MetricCard';
import PageHeader from '../components/ui/PageHeader';
import { useSelectedPeriod } from '../hooks/useSelectedPeriod';
import type { TransactionType, TransactionFormData, Transaction } from '../types';

export default function TransactionsPage() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<TransactionType | ''>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>(undefined);
  const { month, year, label } = useSelectedPeriod();

  const { data: transactions, isLoading } = useTransactions({ month, year });
  const { data: categories } = useCategories();
  const createTransaction = useCreateTransaction();
  const updateTransaction = useUpdateTransaction();
  const deleteTransaction = useDeleteTransaction();

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

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  };

  const totalIncome = transactions?.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0) || 0;
  const totalExpense = transactions?.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0) || 0;

  const handleAddTransaction = async (data: TransactionFormData) => {
    await createTransaction.mutateAsync(data);
    setIsFormOpen(false);
    setEditingTransaction(undefined);
  };

  const handleEditTransaction = async (data: TransactionFormData) => {
    if (!editingTransaction) return;
    await updateTransaction.mutateAsync({ id: editingTransaction.id, data });
    setIsFormOpen(false);
    setEditingTransaction(undefined);
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!confirm('Yakin ingin menghapus transaksi ini?')) return;
    await deleteTransaction.mutateAsync(id);
  };

  const openEditForm = (tx: Transaction) => {
    setEditingTransaction(tx);
    setIsFormOpen(true);
  };

  const openAddForm = () => {
    setEditingTransaction(undefined);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        eyebrow={label}
        title="Transaksi"
        description="Catat, telusuri, dan review pergerakan uang harianmu pada bulan yang sedang aktif. Filter tetap dekat dengan daftar supaya proses cek bulanan terasa cepat."
        action={(
          <button onClick={openAddForm} className="btn-primary">
            <Plus className="h-5 w-5" />
            Tambah Transaksi
          </button>
        )}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <MetricCard
          label="Pemasukan"
          value={formatIDR(totalIncome)}
          icon={TrendingUp}
          tone="success"
          description="Total pemasukan yang tercatat untuk daftar aktif."
        />
        <MetricCard
          label="Pengeluaran"
          value={formatIDR(totalExpense)}
          icon={TrendingDown}
          tone="danger"
          description="Total pengeluaran yang sedang kamu review."
        />
        <MetricCard
          label="Hasil Filter"
          value={filteredTransactions.length}
          icon={Filter}
          description="Jumlah transaksi yang cocok dengan pencarian sekarang."
        />
      </div>

      <div className="card p-4 lg:p-5">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto_auto]">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-dark-400" />
            <input
              type="text"
              placeholder="Cari transaksi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-11"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="relative">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as TransactionType | '')}
                className="input min-w-[140px] appearance-none pr-10"
              >
                <option value="">Semua Tipe</option>
                <option value="income">Pemasukan</option>
                <option value="expense">Pengeluaran</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-dark-400" />
            </div>

            <div className="relative">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="input min-w-[160px] appearance-none pr-10"
              >
                <option value="">Semua Kategori</option>
                {categories?.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-dark-400" />
            </div>
          </div>

          <div className="surface-muted flex items-center gap-3 px-4 py-3 text-sm text-dark-500">
            <Filter className="h-4 w-4 text-dark-400" />
            Filter membantu kamu fokus ke transaksi yang penting dulu.
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="border-b border-dark-200 px-5 py-4 lg:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-100 text-primary-700">
              <ReceiptText className="h-5 w-5" />
            </div>
            <div>
              <h2 className="panel-title">Daftar Transaksi</h2>
              <p className="panel-caption">Review detail, nominal, dan kategori dari semua catatanmu.</p>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="p-8 text-center">
            <div className="mx-auto h-8 w-8 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" />
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-dark-100">
              <Search className="h-10 w-10 text-dark-400" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-dark-700">
              {transactions?.length === 0 ? 'Belum ada transaksi' : 'Tidak ada hasil'}
            </h3>
            <p className="mb-4 text-dark-400">
              {transactions?.length === 0
                ? 'Mulai catat transaksi pertamamu.'
                : 'Coba ubah kata kunci atau filter yang sedang aktif.'}
            </p>
            {transactions?.length === 0 ? (
              <button onClick={openAddForm} className="btn-primary">
                <Plus className="h-5 w-5" />
                Tambah Transaksi
              </button>
            ) : null}
          </div>
        ) : (
          <div className="divide-y divide-dark-200">
            {filteredTransactions.map((tx) => (
              <div key={tx.id} className="group px-5 py-4 transition-colors hover:bg-dark-50/60 lg:px-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex min-w-0 items-center gap-4">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                        tx.type === 'income' ? 'bg-success-100 text-success-700' : 'bg-danger-100 text-danger-600'
                      }`}
                    >
                      {tx.type === 'income' ? (
                        <TrendingUp className="h-6 w-6" />
                      ) : (
                        <TrendingDown className="h-6 w-6" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-dark-800">
                        {tx.description || (tx.type === 'income' ? 'Pemasukan' : 'Pengeluaran')}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-dark-400">
                        <span>{formatDate(tx.date)}</span>
                        {tx.category ? (
                          <>
                            <span aria-hidden="true">&bull;</span>
                            <span className="inline-flex items-center gap-1.5" style={{ color: tx.category.color }}>
                              <span
                                className="h-2 w-2 rounded-full"
                                style={{ backgroundColor: tx.category.color }}
                              />
                              {tx.category.name}
                            </span>
                          </>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 lg:justify-end">
                    <p className={`text-lg font-bold tracking-tight ${
                      tx.type === 'income' ? 'text-success-700' : 'text-danger-600'
                    }`}>
                      {tx.type === 'income' ? '+' : '-'}{formatIDR(tx.amount)}
                    </p>
                    <div className="flex gap-1 lg:opacity-0 lg:transition-opacity lg:group-hover:opacity-100">
                      <button
                        onClick={() => openEditForm(tx)}
                        className="rounded-xl p-2 text-dark-400 transition-colors hover:bg-primary-50 hover:text-primary-600"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteTransaction(tx.id)}
                        className="rounded-xl p-2 text-dark-400 transition-colors hover:bg-danger-50 hover:text-danger-600"
                        title="Hapus"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
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
