import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import Popover from '../ui/Popover';

export default function UserMenu() {
  const navigate = useNavigate();
  const { signOut, user } = useAuthStore();
  const initial = user?.email?.[0]?.toUpperCase() || 'U';

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <Popover
      panelClassName="w-64"
      trigger={({ open, toggle }) => (
        <button
          type="button"
          onClick={toggle}
          aria-expanded={open}
          aria-label="Menu akun"
          className="icon-btn text-sm font-medium"
        >
          {initial}
        </button>
      )}
    >
      {() => (
        <div>
          <div className="flex items-center gap-3 px-3 py-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-dark-900 text-sm font-medium text-white">
              {initial}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-dark-900">{user?.email?.split('@')[0] || 'User'}</p>
              <p className="truncate text-xs text-dark-500">{user?.email}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm text-dark-600 transition-colors hover:bg-red-50 hover:text-red-600"
          >
            <LogOut className="h-4 w-4" />
            Keluar
          </button>
        </div>
      )}
    </Popover>
  );
}
