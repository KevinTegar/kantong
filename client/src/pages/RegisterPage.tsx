import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, CheckCircle, Eye, EyeOff, Lock, Mail, UserPlus } from 'lucide-react';
import AuthShell from '../components/layout/AuthShell';
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
      <AuthShell>
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary-400">
            <CheckCircle className="h-7 w-7 text-dark-900" />
          </div>
          <h2 className="mt-6 text-3xl font-light tracking-tight text-dark-900">Registrasi berhasil</h2>
          <p className="mt-3 text-sm leading-6 text-dark-500">
            Kami mengirimkan link verifikasi ke <strong className="font-medium text-dark-800">{email}</strong>.
            Cek inbox kamu lalu kembali masuk ke Kantong.
          </p>
          <Link to="/login" className="btn-primary mt-8">
            <Mail className="h-4 w-4" />
            Kembali ke login
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <div className="mb-7">
        <h2 className="text-3xl font-light tracking-tight text-dark-900">Buat akun</h2>
        <p className="mt-2 text-sm leading-6 text-dark-500">
          Susun kategori, catat transaksi, dan pantau burn rate dari minggu pertama.
        </p>
      </div>

      {error ? (
        <div className="mb-5 flex items-center gap-3 rounded-2xl bg-red-50 px-4 py-3">
          <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="email" className="label">Email</label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-dark-400" />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input pl-11"
              placeholder="nama@email.com"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="label">Password</label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-dark-400" />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input pl-11 pr-12"
              placeholder="Minimal 6 karakter"
              required
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-700"
              aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="label">Konfirmasi password</label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-dark-400" />
            <input
              id="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input pl-11"
              placeholder="Ulangi password"
              required
              minLength={6}
            />
          </div>
        </div>

        <button type="submit" disabled={isLoading} className="btn-primary w-full py-3">
          {isLoading ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <>
              <UserPlus className="h-4 w-4" />
              Daftar
            </>
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-dark-500">
        Sudah punya akun?{' '}
        <Link to="/login" className="font-medium text-dark-900 underline decoration-primary-400 decoration-2 underline-offset-4">
          Masuk di sini
        </Link>
      </p>
    </AuthShell>
  );
}
