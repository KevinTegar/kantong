import { useState } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
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

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-dark-100">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-dark-200 z-50 px-4">
        <div className="h-full flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-dark-900">Kantong</span>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-10 h-10 flex items-center justify-center text-dark-600 hover:bg-dark-100 rounded-lg transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-dark-900/60 z-40 backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`lg:hidden fixed top-0 left-0 h-full w-72 bg-white z-50 transform transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-dark-200 bg-gradient-to-r from-primary-600 to-primary-700">
          <Link to="/dashboard" className="flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
            <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white">Kantong</span>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="w-10 h-10 flex items-center justify-center text-white/80 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Info */}
        <div className="p-4">
          <div className="flex items-center gap-3 p-3 bg-dark-100 rounded-xl">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
              {user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-dark-800 truncate">
                {user?.email?.split('@')[0] || 'User'}
              </p>
              <p className="text-xs text-dark-400 truncate">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="px-4 py-2">
          <p className="text-[10px] font-semibold text-dark-400 uppercase tracking-wider mb-2 px-3">Menu</p>
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md'
                        : 'text-dark-600 hover:bg-dark-100'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-dark-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-dark-500 hover:bg-danger-50 hover:text-danger-600 rounded-xl transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Keluar</span>
          </button>
        </div>
      </aside>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white border-r border-dark-200">
        {/* Logo */}
        <div className="h-20 flex items-center px-6 border-b border-dark-200">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-md">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                Kantong
              </h1>
            </div>
          </Link>
        </div>

        {/* User Profile */}
        <div className="px-4 py-4">
          <div className="flex items-center gap-3 p-3 bg-dark-100 rounded-xl">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
              {user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-dark-800 truncate">
                {user?.email?.split('@')[0] || 'User'}
              </p>
              <p className="text-xs text-dark-400 truncate">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-2 overflow-y-auto">
          <p className="text-[10px] font-semibold text-dark-400 uppercase tracking-wider mb-2 px-3">Menu</p>
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md'
                        : 'text-dark-600 hover:bg-dark-100'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-dark-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-dark-500 hover:bg-danger-50 hover:text-danger-600 rounded-xl transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Keluar</span>
          </button>
        </div>
      </aside>

      {/* Main Content - Desktop */}
      <div className="hidden lg:block lg:ml-64">
        <main className="p-8 min-h-screen">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Main Content - Mobile */}
      <div className="lg:hidden pt-16 pb-6 px-4 min-h-screen">
        <Outlet />
      </div>
    </div>
  );
}