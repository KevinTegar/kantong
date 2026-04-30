import { useState } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { useSelectedPeriod } from '../../hooks/useSelectedPeriod';
import {
  LayoutDashboard,
  Receipt,
  Tags,
  BarChart3,
  LogOut,
  Menu,
  X,
  Wallet
} from 'lucide-react';
import MonthHistorySwitcher from './MonthHistorySwitcher';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/transactions', label: 'Transaksi', icon: Receipt },
  { path: '/categories', label: 'Kategori', icon: Tags },
  { path: '/reports', label: 'Laporan', icon: BarChart3 },
];

export default function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, user } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const currentNav = navItems.find((item) => item.path === location.pathname);
  const { label: selectedPeriodLabel } = useSelectedPeriod();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-transparent">
      {/* Mobile Header */}
      <header className="fixed left-0 right-0 top-0 z-50 border-b border-white/70 bg-white/85 backdrop-blur-xl lg:hidden">
        <div className="flex h-16 items-center justify-between px-4">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-600 shadow-soft">
              <Wallet className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-base font-bold tracking-tight text-dark-900">Kantong</p>
              <p className="max-w-[180px] truncate text-[11px] font-medium text-dark-400">
                {[currentNav?.label ?? 'Dashboard', selectedPeriodLabel].join(' • ')}
              </p>
            </div>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-dark-200 text-dark-600 transition-colors hover:bg-dark-50"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-dark-900/35 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 h-full w-80 border-r border-white/70 bg-white/95 px-4 pb-4 pt-5 shadow-elevated backdrop-blur-xl transition-transform duration-300 ease-in-out lg:hidden ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="mb-6 flex items-center justify-between border-b border-dark-200 pb-5">
          <Link to="/dashboard" className="flex items-center gap-3" onClick={() => setMobileMenuOpen(false)}>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-600 shadow-soft">
              <Wallet className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-lg font-bold tracking-tight text-dark-900">Kantong</p>
              <p className="text-xs text-dark-400">Money control workspace</p>
            </div>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-dark-200 text-dark-500 transition-colors hover:bg-dark-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* User Info */}
        <div className="mb-5 rounded-2xl border border-dark-200 bg-dark-50 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-600 text-sm font-semibold text-white">
              {user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-dark-800 truncate">
                {user?.email?.split('@')[0] || 'User'}
              </p>
              <p className="text-xs text-dark-500 truncate">{user?.email}</p>
            </div>
          </div>
          <div className="mt-4 rounded-xl bg-white px-3 py-2 text-xs font-medium text-dark-500 shadow-soft">
            Fokus periode aktif: pantau cashflow dan budget kategori.
          </div>
        </div>

        <MonthHistorySwitcher />

        {/* Navigation */}
        <nav className="px-1 py-1">
          <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-dark-400">
            Navigasi
          </p>
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 rounded-2xl px-4 py-3 transition-all duration-200 ${
                      isActive
                        ? 'bg-primary-600 text-white shadow-soft'
                        : 'text-dark-600 hover:bg-dark-50'
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="font-semibold">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="absolute bottom-4 left-4 right-4 border-t border-dark-200 pt-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-dark-500 transition-colors hover:bg-danger-50 hover:text-danger-600"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-semibold">Keluar</span>
          </button>
        </div>
      </aside>

      {/* Desktop Sidebar */}
      <aside className="hidden border-r border-white/80 bg-white/90 backdrop-blur-xl lg:fixed lg:inset-y-0 lg:flex lg:w-[292px] lg:flex-col">
        {/* Logo */}
        <div className="flex h-24 items-center border-b border-dark-200 px-6">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-600 shadow-soft">
              <Wallet className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-dark-900">Kantong</h1>
              <p className="text-xs font-medium text-dark-400">Focused money tracker</p>
            </div>
          </Link>
        </div>

        {/* User Profile */}
        <div className="px-4 py-5">
          <div className="rounded-2xl border border-dark-200 bg-dark-50 p-4 shadow-soft">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-600 text-sm font-semibold text-white">
              {user?.email?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-dark-800">
                  {user?.email?.split('@')[0] || 'User'}
                </p>
                <p className="truncate text-xs text-dark-500">{user?.email}</p>
              </div>
            </div>
            <div className="mt-4 rounded-xl bg-white px-3 py-3 shadow-soft">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-dark-400">
                Momentum
              </p>
              <p className="mt-1 text-sm leading-6 text-dark-600">
                Buka dashboard untuk cek cashflow, budget risk, dan transaksi terbaru.
              </p>
            </div>
          </div>

          <div className="mt-4">
            <MonthHistorySwitcher />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-2">
          <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-dark-400">
            Navigasi
          </p>
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center gap-3 rounded-2xl px-4 py-3 transition-all duration-200 ${
                      isActive
                        ? 'bg-primary-600 text-white shadow-soft'
                        : 'text-dark-600 hover:bg-dark-50'
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="font-semibold">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="border-t border-dark-200 p-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-dark-500 transition-colors hover:bg-danger-50 hover:text-danger-600"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-semibold">Keluar</span>
          </button>
        </div>
      </aside>

      {/* Main Content - Desktop */}
      <div className="hidden lg:block lg:ml-[292px]">
        <main className="min-h-screen px-8 py-8 xl:px-10">
          <div className="mx-auto max-w-[1200px]">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Main Content - Mobile */}
      <div className="min-h-screen px-4 pb-6 pt-20 lg:hidden">
        <Outlet />
      </div>
    </div>
  );
}
