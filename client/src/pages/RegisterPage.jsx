import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Heart, Eye, EyeOff, ArrowRight, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const { user, register } = useAuth();
  const [form, setForm] = useState({ username: '', email: '', password: '', full_name: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await register(form);
      toast.success('Welcome to DevMatch!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen light-mesh-bg flex items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Ambient warm glow orbs */}
      <div className="absolute top-10 right-20 w-80 h-80 rounded-full blur-[120px] animate-float" style={{ background: 'rgba(192, 132, 252, 0.06)' }} />
      <div className="absolute bottom-10 left-10 w-96 h-96 rounded-full blur-[120px] animate-float-delayed" style={{ background: 'rgba(232, 120, 138, 0.06)' }} />
      <div className="absolute top-1/3 left-1/3 w-[400px] h-[400px] rounded-full blur-[140px]" style={{ background: 'rgba(245, 197, 163, 0.04)' }} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="w-full max-w-md relative z-10"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 shadow-xl animate-float" style={{ background: 'linear-gradient(to bottom right, #c084fc, #e8788a)', boxShadow: '0 10px 40px rgba(192, 132, 252, 0.30)' }}>
            <Heart className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-4xl font-black mb-1" style={{ background: 'linear-gradient(to right, #c084fc, #e8788a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Join DevMatch</h1>
          <p className="text-ink-400 font-medium flex items-center justify-center gap-1.5">
            <Sparkles className="w-4 h-4" style={{ color: '#f7a8b8' }} />
            Where code meets connection
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="glass-card p-8 glow-purple"
        >
          <div className="absolute top-0 left-1/4 right-1/4 h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(192, 132, 252, 0.50), transparent)' }} />

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-ink-500 mb-1.5">Full Name</label>
                <input type="text" className="input-field" placeholder="John Doe"
                  value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-ink-500 mb-1.5">Username</label>
                <input type="text" className="input-field" placeholder="johndoe" required minLength={3}
                  value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-ink-500 mb-1.5">Email</label>
              <input type="email" className="input-field" placeholder="you@example.com" required
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>

            <div>
              <label className="block text-sm font-semibold text-ink-500 mb-1.5">Password</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} className="input-field pr-10"
                  placeholder="Min. 6 characters" required minLength={6}
                  value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-accent-400 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn-primary w-full py-3 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <><span className="relative z-10">Create Account</span> <ArrowRight className="w-4 h-4 relative z-10" /></>
              )}
            </motion.button>
          </form>

          <p className="text-center text-sm text-ink-400 mt-5">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold transition-colors" style={{ color: '#f7a8b8' }}>Sign in</Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
