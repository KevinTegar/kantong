import { TrendingUp, TrendingDown, Wallet, PiggyBank, Plus, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import AlertBanner from '../components/alerts/AlertBanner';
import SummaryCard from '../components/ui/SummaryCard';
import CategoryProgressList from '../components/transactions/CategoryProgressList';
import SpendingChart from '../components/charts/SpendingChart';
import CategoryPieChart from '../components/charts/CategoryPieChart';
import { useDashboardSummary } from '../hooks/useDashboardSummary';
import { formatIDR } from '../lib/formatCurrency';

export default function DashboardPage() {
  const { totalIncome, totalExpense, balance, isLoading } = useDashboardSummary();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-900">Dashboard</h1>
          <p className="text-dark-400 mt-1">Ringkasan keuangan bulan ini</p>
        </div>
        <Link
          to="/transactions"
          className="btn-primary inline-flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">Tambah Transaksi</span>
          <span className="sm:hidden">Tambah</span>
        </Link>
      </div>

      {/* Alert Banner */}
      <AlertBanner />

      {/* Summary Cards - Responsive Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
        <SummaryCard
          title="Pemasukan"
          value={formatIDR(totalIncome)}
          icon={TrendingUp}
          variant="income"
        />
        <SummaryCard
          title="Pengeluaran"
          value={formatIDR(totalExpense)}
          icon={TrendingDown}
          variant="expense"
        />
        <SummaryCard
          title="Saldo"
          value={formatIDR(balance)}
          icon={Wallet}
          variant={balance >= 0 ? 'budget' : 'expense'}
        />
        <SummaryCard
          title="Budget Tersisa"
          value={formatIDR(Math.max(0, balance))}
          icon={PiggyBank}
          variant="budget"
        />
      </div>

      {/* Quick Actions - Mobile: Stack, Desktop: 3 columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          to="/transactions"
          className="flex items-center justify-between p-4 bg-success-50 hover:bg-success-100 rounded-xl transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-success-500 rounded-xl flex items-center justify-center shadow-sm">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-dark-800">Pemasukan</p>
              <p className="text-sm text-dark-400">Catat uang masuk</p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-dark-400 group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link
          to="/transactions"
          className="flex items-center justify-between p-4 bg-danger-50 hover:bg-danger-100 rounded-xl transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-danger-500 rounded-xl flex items-center justify-center shadow-sm">
              <TrendingDown className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-dark-800">Pengeluaran</p>
              <p className="text-sm text-dark-400">Catat uang keluar</p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-dark-400 group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link
          to="/categories"
          className="flex items-center justify-between p-4 bg-primary-50 hover:bg-primary-100 rounded-xl transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-primary-500 rounded-xl flex items-center justify-center shadow-sm">
              <PiggyBank className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-dark-800">Budget</p>
              <p className="text-sm text-dark-400">Atur spending cap</p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-dark-400 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Charts - Mobile: Stack, Desktop: 2 columns */}
      {!isLoading && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <SpendingChart />
          <CategoryPieChart />
        </div>
      )}

      {/* Category Progress */}
      {!isLoading && (
        <div className="card p-4 lg:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-dark-800">Progress Budget</h3>
            <Link
              to="/categories"
              className="text-sm font-medium text-primary-600 hover:text-primary-700"
            >
              Kelola
            </Link>
          </div>
          <CategoryProgressList />
        </div>
      )}
    </div>
  );
}