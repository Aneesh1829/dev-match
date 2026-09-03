import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from './Navbar';
import { Heart } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AppLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen light-mesh-bg flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="relative w-16 h-16 mx-auto mb-4">
            <motion.div
              className="absolute inset-0 rounded-2xl bg-gradient-to-br from-accent-500 to-neon-purple"
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              style={{ opacity: 0.2, filter: 'blur(8px)' }}
            />
            <div className="relative w-16 h-16 bg-gradient-to-br from-accent-500 to-neon-purple rounded-2xl flex items-center justify-center shadow-xl shadow-warm">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Heart className="w-8 h-8 text-white fill-white/30" />
              </motion.div>
            </div>
          </div>
          <p className="text-sm text-ink-400 font-medium">Loading DevMatch...</p>
        </motion.div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen light-mesh-bg grid-pattern">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 relative">
        <Outlet />
      </main>
    </div>
  );
}
