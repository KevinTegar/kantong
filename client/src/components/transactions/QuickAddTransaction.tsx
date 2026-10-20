import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useCategories } from '../../hooks/useCategories';
import { useSelectedPeriod } from '../../hooks/useSelectedPeriod';
import { useCreateTransaction } from '../../hooks/useTransactions';
import { useToastStore } from '../../store/useToastStore';
import TransactionForm from './TransactionForm';
import type { TransactionFormData } from '../../types';

// Tombol "Catat" di topbar: quick add transaksi dari halaman mana pun
export default function QuickAddTransaction() {
  const [isOpen, setIsOpen] = useState(false);
  const { month, year } = useSelectedPeriod();
  const { data: categories } = useCategories();
  const createTransaction = useCreateTransaction();
  const pushToast = useToastStore((state) => state.push);

  const handleSubmit = async (data: TransactionFormData) => {
    await createTransaction.mutateAsync(data);
    setIsOpen(false);
    pushToast(data.type === 'income' ? 'Pemasukan tercatat' : 'Pengeluaran tercatat');
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="btn-primary h-9 w-9 px-0 py-0 sm:w-auto sm:px-4"
        aria-label="Catat transaksi"
      >
        <Plus className="h-4 w-4" />
        <span className="hidden sm:inline">Catat</span>
      </button>

      {isOpen ? (
        <TransactionForm
          categories={categories ?? []}
          selectedMonth={month}
          selectedYear={year}
          onSubmit={handleSubmit}
          onClose={() => setIsOpen(false)}
          isSubmitting={createTransaction.isPending}
        />
      ) : null}
    </>
  );
}
