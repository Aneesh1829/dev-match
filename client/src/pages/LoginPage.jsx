import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Heart, Eye, EyeOff, ArrowRight, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { user, login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen light-mesh-bg flex items-center justify-center px-4 relative overflow-hidden">
      {/* Ambient warm glow orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 rounded-full blur-[100px] animate-float" style={{ background: 'rgba(232, 120, 138, 0.08)' }} />
      <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full blur-[120px] animate-float-delayed" style={{ background: 'rgba(192, 132, 252, 0.06)' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[150px]" style={{ background: 'rgba(245, 197, 163, 0.05)' }} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 shadow-xl animate-float" style={{ background: 'linear-gradient(to bottom right, #e8788a, #c084fc)', boxShadow: '0 10px 40px rgba(232, 120, 138, 0.30)' }}>
            <Heart className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-4xl font-black mb-1" style={{ background: 'linear-gradient(to right, #e8788a, #f5c5a3)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>DevMatch</h1>
          <p className="text-ink-400 font-medium flex items-center justify-center gap-1.5">
            <Sparkles className="w-4 h-4" style={{ color: '#e8b86d' }} />
            Code. Connect. Belong.
          </p>
        </motion.div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="glass-card p-8 glow-accent"
        >
          {/* Top glow line */}
          <div className="absolute top-0 left-1/4 right-1/4 h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(232, 120, 138, 0.50), transparent)' }} />

          <h2 className="text-xl font-bold text-ink-900 mb-6">Welcome back</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-ink-500 mb-1.5">Email</label>
              <input
                type="email"
                className="input-field"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-ink-500 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input-field pr-10"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-accent-400 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn-primary w-full py-3 flex items-center justify-center gap-2 relative overflow-hidden"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <><span className="relative z-10">Sign In</span> <ArrowRight className="w-4 h-4 relative z-10" /></>
              )}
            </motion.button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-ink-100" /></div>
            <div className="relative flex justify-center"><span className="bg-white backdrop-blur px-3 text-xs text-ink-400 font-medium">New here?</span></div>
          </div>

          <Link to="/register">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn-secondary w-full py-2.5 flex items-center justify-center gap-2 text-sm"
            >
              Create an account <ArrowRight className="w-3.5 h-3.5" />
            </motion.div>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
