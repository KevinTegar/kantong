import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, Eye, EyeOff, Lock, LogIn, Mail, Wallet } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

export default function LoginPage() {
  const navigate = useNavigate();
  const signIn = useAuthStore((state) => state.signIn);
  const isLoading = useAuthStore((state) => state.isLoading);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const { error: signInError } = await signIn(email, password);
    if (signInError) {
      setError(signInError.message);
    } else {
      navigate('/dashboard');
    }
  };

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
                  Focused Money Tracker
                </p>
                <h1 className="text-4xl font-bold tracking-tight text-dark-900">
                  Pegang kendali uangmu tanpa dashboard yang terasa berat.
                </h1>
                <p className="text-base leading-7 text-dark-500">
                  Kantong membantu kamu membaca cashflow, budget kategori, dan titik risiko pengeluaran dalam ritme harian yang lebih tenang.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="surface-muted p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-dark-400">Cashflow</p>
                <p className="mt-2 text-sm font-semibold text-dark-800">Lebih mudah dipantau</p>
              </div>
              <div className="surface-muted p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-dark-400">Budget</p>
                <p className="mt-2 text-sm font-semibold text-dark-800">Kategori lebih terkontrol</p>
              </div>
              <div className="surface-muted p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-dark-400">Review</p>
                <p className="mt-2 text-sm font-semibold text-dark-800">Insight bulanan lebih jelas</p>
              </div>
            </div>
          </div>
        </section>

        <section className="card mx-auto w-full max-w-md p-8 shadow-elevated">
          <div className="mb-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[20px] bg-primary-600 shadow-soft lg:hidden">
              <Wallet className="h-7 w-7 text-white" />
            </div>
            <h2 className="mt-5 text-3xl font-bold tracking-tight text-dark-900">Masuk ke Kantong</h2>
            <p className="mt-2 text-sm leading-6 text-dark-500">
              Lanjutkan review cashflow dan budget bulananmu dari tempat terakhir.
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
                  placeholder="Masukkan password"
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

            <button type="submit" disabled={isLoading} className="btn-primary w-full py-3">
              {isLoading ? (
                <span className="h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : (
                <>
                  <LogIn className="h-5 w-5" />
                  Masuk
                </>
              )}
            </button>
          </form>

          <div className="mt-6 rounded-2xl bg-dark-50 px-4 py-3 text-sm leading-6 text-dark-500">
            Belum punya akun?{' '}
            <Link to="/register" className="font-semibold text-primary-700 hover:text-primary-800">
              Daftar di sini
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
