import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, LogIn, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import logoImg from '../../assets/spiritual_journey_logo.png';

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isRegistered = searchParams.get('registered') === 'true';

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const loggedInUser = await login(form);
      if (loggedInUser.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl border border-primary-100 overflow-hidden">
          {/* Top accent bar */}
          <div className="h-2 bg-gradient-to-r from-primary-800 via-accent to-primary-800" />

          <div className="p-6 sm:p-10">
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <img src={logoImg} alt="Logo" className="h-16 sm:h-20 object-contain" />
            </div>

            <h1 className="text-2xl font-serif font-black text-primary-900 text-center mb-1">
              ወደ ሂሳብዎ ይግቡ
            </h1>
            <p className="text-primary-500 text-center text-sm mb-8">Sign in to your account</p>

            {isRegistered && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3.5 rounded-2xl text-xs mb-6 flex items-start gap-2.5 shadow-sm">
                <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>ምዝገባዎ ተጠናቋል!</strong> አሁን በኢሜይልዎና በይለፍ ቃልዎ በመግባት ትኬትዎን መውሰድ ይችላሉ።
                </span>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-6 flex items-center gap-2">
                <span className="text-red-500">⚠</span> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-primary-800 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-400" />
                  <input
                    id="login-email"
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-primary-200 rounded-xl bg-primary-50 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-colors text-primary-900"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-primary-800 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-400" />
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full pl-10 pr-12 py-3 border border-primary-200 rounded-xl bg-primary-50 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-colors text-primary-900"
                    placeholder="Your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-primary-400 hover:text-primary-700 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                id="login-submit"
                type="submit"
                disabled={loading}
                className="w-full bg-primary-800 hover:bg-primary-900 disabled:opacity-60 text-white py-3.5 rounded-xl font-semibold text-base transition-all shadow-lg flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="inline-block w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <><LogIn className="w-4 h-4" /> ይግቡ (Sign In)</>
                )}
              </button>
            </form>

            <p className="text-center text-sm text-primary-500 mt-6">
              Don't have an account?{' '}
              <Link to="/register" className="text-accent font-semibold hover:text-accent-hover transition-colors">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
