import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, CheckCircle, Eye, EyeOff, Lock, Mail, UserPlus, Wallet } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

export default function RegisterPage() {
  const signUp = useAuthStore((state) => state.signUp);
  const isLoading = useAuthStore((state) => state.isLoading);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Password tidak cocok');
      return;
    }

    if (password.length < 6) {
      setError('Password minimal 6 karakter');
      return;
    }

    const { error: signUpError } = await signUp(email, password);
    if (signUpError) {
      setError(signUpError.message);
    } else {
      setSuccess(true);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-dark-50 px-4 py-8">
        <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md items-center">
          <div className="card w-full p-8 text-center shadow-elevated">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success-100">
              <CheckCircle className="h-8 w-8 text-success-600" />
            </div>
            <h2 className="mt-6 text-3xl font-bold tracking-tight text-dark-900">Registrasi berhasil</h2>
            <p className="mt-3 text-sm leading-6 text-dark-500">
              Kami mengirimkan link verifikasi ke <strong className="text-dark-800">{email}</strong>.
              Cek inbox kamu lalu kembali masuk ke Kantong.
            </p>
            <Link to="/login" className="btn-primary mt-8 inline-flex">
              <Mail className="h-5 w-5" />
              Kembali ke Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-50 px-4 py-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-8 lg:grid-cols-[1fr_460px]">
        <section className="hidden rounded-[28px] border border-white/80 bg-white/80 p-10 shadow-card backdrop-blur-xl lg:block">
          <div className="flex h-full flex-col justify-between">
            <div>
              <div className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-primary-600 shadow-soft">
                <Wallet className="h-7 w-7 text-white" />
              </div>
              <div className="mt-8 max-w-xl space-y-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary-700">
                  Build Better Money Habits
                </p>
                <h1 className="text-4xl font-bold tracking-tight text-dark-900">
                  Mulai dengan struktur budget yang terasa ringan dipakai setiap hari.
                </h1>
                <p className="text-base leading-7 text-dark-500">
                  Buat akun, susun kategori, lalu mulai lihat pola pengeluaranmu dari minggu pertama.
                </p>
              </div>
            </div>
            <div className="surface-muted p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-dark-400">Yang akan kamu dapat</p>
              <ul className="mt-3 space-y-2 text-sm text-dark-600">
                <li>Ringkasan cashflow yang cepat dipindai</li>
                <li>Budget kategori dengan sinyal risiko yang jelas</li>
                <li>Laporan bulanan yang terasa lebih operasional</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="card mx-auto w-full max-w-md p-8 shadow-elevated">
          <div className="mb-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[20px] bg-primary-600 shadow-soft lg:hidden">
              <Wallet className="h-7 w-7 text-white" />
            </div>
            <h2 className="mt-5 text-3xl font-bold tracking-tight text-dark-900">Buat akun baru</h2>
            <p className="mt-2 text-sm leading-6 text-dark-500">
              Mulai mengatur transaksi, kategori, dan budget dengan workflow yang lebih fokus.
            </p>
          </div>

          {error ? (
            <div className="mb-6 flex items-center gap-3 rounded-2xl border border-danger-200 bg-danger-50 px-4 py-3">
              <AlertCircle className="h-5 w-5 flex-shrink-0 text-danger-600" />
              <p className="text-sm text-danger-700">{error}</p>
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="label">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-dark-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input pl-12"
                  placeholder="nama@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="label">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-dark-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pl-12 pr-12"
                  placeholder="Minimal 6 karakter"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="label">Konfirmasi Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-dark-400" />
                <input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input pl-12"
                  placeholder="Ulangi password"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="btn-primary w-full py-3">
              {isLoading ? (
                <span className="h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : (
                <>
                  <UserPlus className="h-5 w-5" />
                  Daftar
                </>
              )}
            </button>
          </form>

          <div className="mt-6 rounded-2xl bg-dark-50 px-4 py-3 text-sm leading-6 text-dark-500">
            Sudah punya akun?{' '}
            <Link to="/login" className="font-semibold text-primary-700 hover:text-primary-800">
              Masuk di sini
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
