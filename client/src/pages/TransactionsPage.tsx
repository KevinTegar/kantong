import { useState, useMemo } from 'react';
import { Search, Plus, ChevronDown, TrendingUp, TrendingDown, Filter, Pencil, Trash2 } from 'lucide-react';
import { useTransactions, useCreateTransaction, useUpdateTransaction, useDeleteTransaction } from '../hooks/useTransactions';
import { useCategories } from '../hooks/useCategories';
import { formatIDR } from '../lib/formatCurrency';
import TransactionForm from '../components/transactions/TransactionForm';
import type { TransactionType, TransactionFormData, Transaction } from '../types';

export default function TransactionsPage() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<TransactionType | ''>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const { data: transactions, isLoading } = useTransactions();
  const { data: categories } = useCategories();
  const createTransaction = useCreateTransaction();
  const updateTransaction = useUpdateTransaction();
  const deleteTransaction = useDeleteTransaction();

  const filteredTransactions = useMemo(() => {
    if (!transactions) return [];

    return transactions.filter((tx) => {
      const matchesSearch = search === '' ||
        tx.description?.toLowerCase().includes(search.toLowerCase()) ||
        formatIDR(tx.amount).includes(search);

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

  const handleAddTransaction = async (data: TransactionFormData) => {
    await createTransaction.mutateAsync(data);
    setIsFormOpen(false);
    setEditingTransaction(null);
  };

  const handleEditTransaction = async (data: TransactionFormData) => {
    if (!editingTransaction) return;
    await updateTransaction.mutateAsync({ id: editingTransaction.id, data });
    setIsFormOpen(false);
    setEditingTransaction(null);
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
    setEditingTransaction(null);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-dark-900">Transaksi</h1>
          <p className="text-dark-400 mt-1">Kelola semua transaksi keuanganmu</p>
        </div>
        <button
          onClick={openAddForm}
          className="btn-primary inline-flex items-center gap-2 self-start"
        >
          <Plus className="w-5 h-5" />
          Tambah Transaksi
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
            <input
              type="text"
              placeholder="Cari transaksi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-11"
            />
          </div>

          <div className="flex gap-3 flex-wrap">
            <div className="relative">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as TransactionType | '')}
                className="input appearance-none pr-10 min-w-[140px]"
              >
                <option value="">Semua Tipe</option>
                <option value="income">Pemasukan</option>
                <option value="expense">Pengeluaran</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400 pointer-events-none" />
            </div>

            <div className="relative">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="input appearance-none pr-10 min-w-[160px]"
              >
                <option value="">Semua Kategori</option>
                {categories?.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-4 flex items-center gap-4">
          <div className="p-3 bg-success-100 rounded-xl">
            <TrendingUp className="w-6 h-6 text-success-600" />
          </div>
          <div>
            <p className="text-sm text-dark-400">Total Pemasukan</p>
            <p className="text-lg font-bold text-success-600">
              {formatIDR(
                transactions?.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0) || 0
              )}
            </p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-4">
          <div className="p-3 bg-danger-100 rounded-xl">
            <TrendingDown className="w-6 h-6 text-danger-600" />
          </div>
          <div>
            <p className="text-sm text-dark-400">Total Pengeluaran</p>
            <p className="text-lg font-bold text-danger-600">
              {formatIDR(
                transactions?.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0) || 0
              )}
            </p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-4">
          <div className="p-3 bg-primary-100 rounded-xl">
            <Filter className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <p className="text-sm text-dark-400">Jumlah Transaksi</p>
            <p className="text-lg font-bold text-dark-800">{filteredTransactions.length}</p>
          </div>
        </div>
      </div>

      {/* Transaction List */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-20 h-20 bg-dark-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-10 h-10 text-dark-400" />
            </div>
            <h3 className="text-lg font-semibold text-dark-700 mb-2">
              {transactions?.length === 0 ? 'Belum ada transaksi' : 'Tidak ada hasil'}
            </h3>
            <p className="text-dark-400 mb-4">
              {transactions?.length === 0
                ? 'Mulai catat transaksi pertamamu'
                : 'Coba ubah filter pencarian'}
            </p>
            {transactions?.length === 0 && (
              <button onClick={openAddForm} className="btn-primary inline-flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Tambah Transaksi
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-dark-200">
            {filteredTransactions.map((tx) => (
              <div
                key={tx.id}
                className="p-4 hover:bg-dark-50 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        tx.type === 'income' ? 'bg-success-100' : 'bg-danger-100'
                      }`}
                    >
                      {tx.type === 'income' ? (
                        <TrendingUp className="w-6 h-6 text-success-600" />
                      ) : (
                        <TrendingDown className="w-6 h-6 text-danger-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-dark-800">
                        {tx.description || (tx.type === 'income' ? 'Pemasukan' : 'Pengeluaran')}
                      </p>
                      <div className="flex items-center gap-3 text-sm text-dark-400">
                        <span>{formatDate(tx.date)}</span>
                        {tx.category && (
                          <>
                            <span>•</span>
                            <span
                              className="inline-flex items-center gap-1.5"
                              style={{ color: tx.category.color }}
                            >
                              <span
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: tx.category.color }}
                              />
                              {tx.category.name}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className={`font-bold text-lg ${
                      tx.type === 'income' ? 'text-success-600' : 'text-danger-600'
                    }`}>
                      {tx.type === 'income' ? '+' : '-'}{formatIDR(tx.amount)}
                    </p>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEditForm(tx)}
                        className="p-2 text-dark-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteTransaction(tx.id)}
                        className="p-2 text-dark-400 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
                        title="Hapus"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Transaction Modal */}
      {isFormOpen && categories && (
        <TransactionForm
          categories={categories}
          transaction={editingTransaction}
          onSubmit={editingTransaction ? handleEditTransaction : handleAddTransaction}
          onClose={() => {
            setIsFormOpen(false);
            setEditingTransaction(null);
          }}
          isSubmitting={createTransaction.isPending || updateTransaction.isPending}
        />
      )}
    </div>
  );
}