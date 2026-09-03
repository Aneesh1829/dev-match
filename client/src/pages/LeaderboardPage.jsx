import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { usersAPI } from '../services/api';
import { motion } from 'framer-motion';
import AnimatedPage from '../components/UI/AnimatedPage';
import { Trophy, Medal, Award } from 'lucide-react';

export default function LeaderboardPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await usersAPI.getLeaderboard();
        setUsers(res.data.users || []);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchLeaderboard();
  }, []);

  const rankConfig = {
    0: { icon: Trophy, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-200', shadow: 'shadow-sm', glow: 'from-amber-50' },
    1: { icon: Medal, color: 'text-ink-700', bg: 'bg-gray-100', border: 'border-gray-300', shadow: 'shadow-sm', glow: 'from-gray-100' },
    2: { icon: Award, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', shadow: 'shadow-sm', glow: 'from-amber-100' },
  };

  return (
    <AnimatedPage className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center border border-amber-200">
          <Trophy className="w-5 h-5 text-amber-500" />
        </div>
        <h1 className="text-2xl font-bold text-ink-900">Leaderboard</h1>
      </div>

      {/* Top 3 Cards */}
      {!loading && users.length >= 3 && (
        <div className="grid grid-cols-3 gap-4">
          {[1, 0, 2].map((rank) => {
            const u = users[rank];
            if (!u) return null;
            const config = rankConfig[rank];
            const Icon = config.icon;
            const isFirst = rank === 0;
            return (
              <motion.div
                key={u.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: rank * 0.15 }}
                className={`${isFirst ? 'row-start-1 -mt-4' : ''}`}
              >
                <Link to={`/profile/${u.username}`}>
                  <div className={`glass-card text-center hover:border-ink-200 transition-all group ${isFirst ? 'py-8' : 'py-6'} relative overflow-hidden`}>
                    {/* Glow */}
                    <div className={`absolute inset-0 bg-gradient-to-b ${config.glow} to-transparent opacity-20`} />

                    <div className="relative z-10">
                      <motion.div whileHover={{ scale: 1.1, rotate: 5 }} className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${config.bg} ${config.border} border mb-3 shadow-lg ${config.shadow}`}>
                        <Icon className={`w-4 h-4 ${config.color}`} />
                      </motion.div>

                      <div className={`w-14 h-14 mx-auto mb-3 bg-gradient-to-br from-accent-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-xl shadow-warm group-hover:shadow-warm-lg transition-shadow ${isFirst ? 'w-16 h-16' : ''}`}>
                        <span className={`text-white font-bold ${isFirst ? 'text-xl' : 'text-lg'}`}>{u.username?.charAt(0).toUpperCase()}</span>
                      </div>

                      <p className="font-bold text-ink-900 text-sm truncate px-2">{u.full_name || u.username}</p>
                      <p className="text-xs text-ink-400 mb-2">@{u.username}</p>
                      <p className={`text-lg font-black ${config.color}`}>{u.rating}</p>
                      <p className="text-xs text-ink-400">{u.total_solved} solved</p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Full Rankings Table */}
      <div className="glass-card !p-0 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-ink-100">
              <th className="text-left px-6 py-3 text-xs font-semibold text-ink-400 uppercase w-16">Rank</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-ink-400 uppercase">User</th>
              <th className="text-right px-6 py-3 text-xs font-semibold text-ink-400 uppercase">Solved</th>
              <th className="text-right px-6 py-3 text-xs font-semibold text-ink-400 uppercase">Rating</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100/50">
            {loading ? (
              Array.from({ length: 10 }).map((_, i) => (
                <tr key={i}>
                  <td className="px-6 py-4"><div className="h-4 bg-surface-200 rounded w-8 animate-pulse" /></td>
                  <td className="px-6 py-4"><div className="h-4 bg-surface-200 rounded w-40 animate-pulse" /></td>
                  <td className="px-6 py-4"><div className="h-4 bg-surface-200 rounded w-10 ml-auto animate-pulse" /></td>
                  <td className="px-6 py-4"><div className="h-4 bg-surface-200 rounded w-12 ml-auto animate-pulse" /></td>
                </tr>
              ))
            ) : (
              users.map((u, i) => {
                const config = rankConfig[i];
                return (
                  <motion.tr
                    key={u.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="hover:bg-surface-50 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      {config ? (
                        <div className={`w-7 h-7 rounded-full ${config.bg} ${config.border} border flex items-center justify-center`}>
                          <config.icon className={`w-3.5 h-3.5 ${config.color}`} />
                        </div>
                      ) : (
                        <span className="text-sm font-medium text-ink-400 pl-1.5">{i + 1}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <Link to={`/profile/${u.username}`} className="flex items-center gap-3 group-hover:text-accent-600 transition-colors">
                        <div className="w-8 h-8 bg-gradient-to-br from-accent-100 to-purple-100 rounded-lg flex items-center justify-center border border-ink-100">
                          <span className="text-accent-600 font-semibold text-xs">{u.username?.charAt(0).toUpperCase()}</span>
                        </div>
                        <div>
                          <p className="font-medium text-sm text-ink-800 group-hover:text-accent-600 transition-colors">{u.full_name || u.username}</p>
                          <p className="text-xs text-ink-300">@{u.username}</p>
                        </div>
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium text-ink-500">{u.total_solved}</td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm font-bold text-accent-600">{u.rating}</span>
                    </td>
                  </motion.tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </AnimatedPage>
  );
}
