import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { Code2, LayoutDashboard, Trophy, MessageSquare, LogOut, Rss, Heart, User } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/problems', label: 'Problems', icon: Code2 },
    { path: '/feed', label: 'Feed', icon: Rss },
    { path: '/chat', label: 'Chat', icon: MessageSquare },
    { path: '/leaderboard', label: 'Ranks', icon: Trophy },
  ];

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-ink-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2.5 group">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="w-9 h-9 bg-gradient-to-br from-accent-500 to-neon-purple rounded-xl flex items-center justify-center shadow-lg shadow-warm group-hover:shadow-accent-500/40 transition-shadow"
            >
              <Heart className="w-5 h-5 text-white fill-white/30" />
            </motion.div>
            <span className="text-xl font-extrabold gradient-text-warm hidden sm:block">DevMatch</span>
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-1 bg-surface-100 rounded-2xl p-1 border border-ink-100">
            {navItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className="relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300"
              >
                {isActive(item.path) && (
                  <motion.div
                    layoutId="navbar-active"
                    className="absolute inset-0 bg-accent-50 rounded-xl border border-accent-200"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className={`relative z-10 flex items-center gap-2 ${isActive(item.path) ? 'text-accent-600' : 'text-ink-500 hover:text-ink-900'}`}>
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </span>
              </Link>
            ))}
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-2">
            <Link
              to={`/profile/${user?.username}`}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl hover:bg-surface-100 transition-all duration-300 group"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-accent-500 to-neon-purple rounded-lg flex items-center justify-center shadow-md shadow-warm group-hover:shadow-accent-500/40 transition-shadow">
                {user?.avatar ? (
                  <img src={user.avatar} alt="" className="w-8 h-8 rounded-lg object-cover" />
                ) : (
                  <span className="text-white font-bold text-sm">{user?.username?.charAt(0)?.toUpperCase()}</span>
                )}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-semibold text-ink-800 leading-tight">{user?.username}</p>
                <p className="text-xs text-ink-400 leading-tight">{user?.rating || 0} pts</p>
              </div>
            </Link>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={logout}
              className="p-2 text-ink-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all duration-300"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </motion.button>
          </div>
        </div>

        {/* Mobile Nav */}
        <div className="md:hidden flex overflow-x-auto gap-1 pb-3 -mx-4 px-4 scrollbar-hide">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive(item.path)
                  ? 'bg-accent-50 text-accent-600 border border-accent-200'
                  : 'bg-surface-100 text-ink-500 border border-ink-100 hover:border-ink-200'
              }`}
            >
              <item.icon className="w-3.5 h-3.5" />
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
