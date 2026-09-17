import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Lock, Eye, EyeOff, UserPlus } from 'lucide-react';
import { authApi } from '../../api/auth.api';
import logoImg from '../../assets/spiritual_journey_logo.png';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await authApi.register({ name: form.name, email: form.email, phone: form.phone, password: form.password });
      navigate('/login?registered=true');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { id: 'reg-name', label: 'Full Name / ሙሉ ስም', key: 'name', type: 'text', icon: User, placeholder: 'Your full name' },
    { id: 'reg-email', label: 'Email Address', key: 'email', type: 'email', icon: Mail, placeholder: 'you@example.com' },
    { id: 'reg-phone', label: 'Phone Number / ስልክ ቁጥር', key: 'phone', type: 'tel', icon: Phone, placeholder: '09xxxxxxxx' },
  ] as const;

  return (
    <div className="min-h-screen bg-primary-50 flex items-center justify-center p-4 py-10">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl border border-primary-100 overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-primary-800 via-accent to-primary-800" />
          <div className="p-6 sm:p-10">
            <div className="flex justify-center mb-6">
              <img src={logoImg} alt="Logo" className="h-16 sm:h-20 object-contain" />
            </div>
            <h1 className="text-2xl font-serif font-black text-primary-900 text-center mb-1">ሂሳብ ይክፈቱ</h1>
            <p className="text-primary-500 text-center text-sm mb-8">Create your account to book tickets</p>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-6">
                ⚠ {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {fields.map(({ id, label, key, type, icon: Icon, placeholder }) => (
                <div key={key}>
                  <label className="block text-sm font-semibold text-primary-800 mb-1.5">{label}</label>
                  <div className="relative">
                    <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-400" />
                    <input
                      id={id}
                      type={type}
                      required
                      value={form[key]}
                      onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-primary-200 rounded-xl bg-primary-50 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-colors text-primary-900"
                      placeholder={placeholder}
                    />
                  </div>
                </div>
              ))}

              {/* Password */}
              {(['password', 'confirmPassword'] as const).map((field) => (
                <div key={field}>
                  <label className="block text-sm font-semibold text-primary-800 mb-1.5">
                    {field === 'password' ? 'Password' : 'Confirm Password'}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-400" />
                    <input
                      id={`reg-${field}`}
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={form[field]}
                      onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                      className="w-full pl-10 pr-12 py-3 border border-primary-200 rounded-xl bg-primary-50 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-colors text-primary-900"
                      placeholder={field === 'password' ? 'Create a password' : 'Repeat password'}
                    />
                    {field === 'confirmPassword' && (
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-primary-400 hover:text-primary-700">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    )}
                  </div>
                </div>
              ))}

              <button id="register-submit" type="submit" disabled={loading}
                className="w-full bg-primary-800 hover:bg-primary-900 disabled:opacity-60 text-white py-3.5 rounded-xl font-semibold text-base transition-all shadow-lg flex items-center justify-center gap-2 mt-2">
                {loading
                  ? <span className="inline-block w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  : <><UserPlus className="w-4 h-4" /> ሂሳብ ይፍጠሩ (Register)</>}
              </button>
            </form>

            <p className="text-center text-sm text-primary-500 mt-6">
              Already have an account?{' '}
              <Link to="/login" className="text-accent font-semibold hover:text-accent-hover">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
