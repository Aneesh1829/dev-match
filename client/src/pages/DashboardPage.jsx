import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { recommendationsAPI, socialAPI } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedPage, { StaggerContainer, StaggerItem } from '../components/UI/AnimatedPage';
import GlassCard from '../components/UI/GlassCard';
import { SkeletonCard } from '../components/UI/LoadingSpinner';
import {
  Heart, Users, UserPlus, Sparkles, Trophy, Code2,
  ChevronRight, Target, Check, X, TrendingUp, Star,
  MessageCircleHeart, HandHeart, CircleDot
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const { user } = useAuth();
  const [recUsers, setRecUsers] = useState([]);
  const [recProblems, setRecProblems] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sendingRequest, setSendingRequest] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, problemsRes, requestsRes, friendsRes] = await Promise.all([
          recommendationsAPI.getUsers(6),
          recommendationsAPI.getProblems(6),
          socialAPI.getFriendRequests(),
          socialAPI.getFriends(),
        ]);
        setRecUsers(usersRes.data.recommendations || usersRes.data.users || []);
        setRecProblems(problemsRes.data.recommendations || problemsRes.data.problems || []);
        setFriendRequests(requestsRes.data.requests || []);
        setFriends(friendsRes.data.friends || []);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleFriendResponse = async (requestId, status) => {
    try {
      await socialAPI.respondFriendRequest(requestId, status);
      setFriendRequests(prev => prev.filter(r => r.id !== requestId));
      if (status === 'accepted') {
        // Refresh friends list after accepting
        const friendsRes = await socialAPI.getFriends();
        setFriends(friendsRes.data.friends || []);
      }
      toast.success(status === 'accepted' ? 'A new connection blooms!' : 'Request declined.');
    } catch (err) {
      toast.error('Failed to respond');
    }
  };

  const handleSendFriendRequest = async (userId) => {
    setSendingRequest(prev => ({ ...prev, [userId]: true }));
    try {
      await socialAPI.sendFriendRequest(userId);
      toast.success('Friend request sent with love!');
      setSendingRequest(prev => ({ ...prev, [userId]: 'sent' }));
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not send request');
      setSendingRequest(prev => ({ ...prev, [userId]: false }));
    }
  };

  const skillVector = user?.skill_vector || {};
  const topSkills = Object.entries(skillVector)
    .sort((a, b) => (b[1] || 0) - (a[1] || 0))
    .slice(0, 6);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <AnimatedPage className="space-y-8">
      {/* ============================================= */}
      {/* WELCOME HERO                                  */}
      {/* ============================================= */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-accent-50 via-pink-50 to-purple-50 p-8 sm:p-10 text-ink-900 border border-accent-100"
      >
        {/* Warm glowing orbs */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-accent-100/50 rounded-full -translate-y-1/2 translate-x-1/4 blur-[100px] animate-float" />
        <div className="absolute bottom-0 left-0 w-56 h-56 bg-orange-100/30 rounded-full translate-y-1/3 -translate-x-1/4 blur-[80px] animate-float-delayed" />
        <div className="absolute top-1/2 right-1/4 w-40 h-40 bg-amber-100/30 rounded-full blur-[60px] animate-float" />

        <div className="absolute inset-0 grid-pattern opacity-20" />

        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-2 mb-3"
          >
            <Heart className="w-5 h-5 text-accent-600 fill-accent-300" />
            <span className="text-sm font-semibold text-accent-400">{getGreeting()}</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl sm:text-4xl font-black mb-2 bg-gradient-to-r from-ink-900 via-accent-700 to-accent-500 bg-clip-text text-transparent"
          >
            {user?.full_name || user?.username}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-ink-500 mb-8 max-w-lg text-base"
          >
            Every line of code is a chance to connect. Your developer community is here, waiting for you.
          </motion.p>

          <StaggerContainer className="grid grid-cols-2 sm:grid-cols-4 gap-3" staggerDelay={0.1}>
            <StaggerItem>
              <StatCard icon={Code2} label="Problems Solved" value={user?.total_solved || 0} color="rose" />
            </StaggerItem>
            <StaggerItem>
              <StatCard icon={Trophy} label="Rating" value={user?.rating || 0} color="gold" />
            </StaggerItem>
            <StaggerItem>
              <StatCard icon={Heart} label="Friends" value={friends.length} color="blush" />
            </StaggerItem>
            <StaggerItem>
              <StatCard icon={Sparkles} label={topSkills.length > 0 ? 'Skills' : 'Matches'} value={topSkills.length > 0 ? topSkills.length : recUsers.length} color="purple" />
            </StaggerItem>
          </StaggerContainer>
        </div>
      </motion.div>

      {/* ============================================= */}
      {/* FRIENDS SECTION                               */}
      {/* ============================================= */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-ink-900 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-50 to-accent-50 flex items-center justify-center border border-accent-200">
              <Heart className="w-4.5 h-4.5 text-accent-600 fill-accent-200" />
            </div>
            Your People
          </h2>
          {friends.length > 0 && (
            <span className="text-sm text-accent-500 font-medium">
              {friends.length} {friends.length === 1 ? 'friend' : 'friends'}
            </span>
          )}
        </div>

        {loading ? (
          <div className="flex gap-4 overflow-hidden">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="w-36 shrink-0">
                <SkeletonCard lines={2} />
              </div>
            ))}
          </div>
        ) : friends.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex gap-4 overflow-x-auto pb-3 scrollbar-thin scrollbar-thumb-accent-500/20 scrollbar-track-transparent"
          >
            {friends.map((friend, i) => (
              <motion.div
                key={friend.id || i}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
              >
                <Link
                  to={`/profile/${friend.username}`}
                  className="group block w-36 shrink-0"
                >
                  <div className="relative bg-white backdrop-blur-sm rounded-2xl p-4 border border-ink-100 hover:border-accent-300 transition-all duration-300 hover:bg-surface-100 hover:shadow-lg shadow-sm text-center">
                    {/* Avatar */}
                    <div className="relative mx-auto mb-3 w-14 h-14">
                      {friend.avatar_url ? (
                        <img
                          src={friend.avatar_url}
                          alt={friend.username}
                          className="w-14 h-14 rounded-full object-cover ring-2 ring-accent-500/20 group-hover:ring-accent-500/40 transition-all"
                        />
                      ) : (
                        <div className="w-14 h-14 bg-gradient-to-br from-accent-500 to-warm-coral rounded-full flex items-center justify-center ring-2 ring-accent-200 group-hover:ring-accent-400 transition-all shadow-lg shadow-warm">
                          <span className="text-white font-bold text-lg">
                            {friend.username?.charAt(0)?.toUpperCase()}
                          </span>
                        </div>
                      )}
                      {/* Online status dot */}
                      {friend.is_online && (
                        <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-white shadow-lg shadow-sm" />
                      )}
                    </div>

                    {/* Name & details */}
                    <p className="font-semibold text-sm text-ink-800 truncate group-hover:text-accent-600 transition-colors">
                      {friend.full_name || friend.username}
                    </p>
                    <p className="text-xs text-ink-400 truncate mb-1.5">
                      @{friend.username}
                    </p>
                    <div className="flex items-center justify-center gap-1 text-xs text-amber-600">
                      <Star className="w-3 h-3 fill-amber-400" />
                      <span className="font-semibold">{friend.rating || 0}</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <GlassCard tilt={false} hover={false} className="!cursor-default">
            <div className="text-center py-8">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
              >
                <HandHeart className="w-12 h-12 text-accent-400 mx-auto mb-3" />
              </motion.div>
              <p className="text-ink-500 text-sm mb-1 font-medium">No friends yet, but that is about to change</p>
              <p className="text-ink-400 text-xs max-w-xs mx-auto">
                Solve problems, connect with developers below, and build your circle. Great friendships start with a single line of code.
              </p>
            </div>
          </GlassCard>
        )}
      </section>

      {/* ============================================= */}
      {/* FRIEND REQUESTS                               */}
      {/* ============================================= */}
      <AnimatePresence>
        {friendRequests.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <GlassCard tilt={false} hover={false} className="!cursor-default border-l-2 !border-l-accent-500">
              <h2 className="text-lg font-bold text-ink-900 flex items-center gap-2.5 mb-5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-50 to-red-50 flex items-center justify-center border border-accent-200">
                  <UserPlus className="w-4 h-4 text-accent-600" />
                </div>
                Someone Wants to Connect
                <span className="bg-accent-50 text-accent-600 text-xs font-bold px-2.5 py-0.5 rounded-full border border-accent-200 animate-pulse">
                  {friendRequests.length}
                </span>
              </h2>

              <div className="space-y-3">
                <AnimatePresence>
                  {friendRequests.map(req => (
                    <motion.div
                      key={req.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10, height: 0 }}
                      className="flex items-center justify-between p-3.5 rounded-xl bg-white border border-ink-100 hover:border-accent-200 transition-all"
                    >
                      <Link to={`/profile/${req.requester?.username}`} className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-11 h-11 bg-gradient-to-br from-accent-500 to-warm-coral rounded-xl flex items-center justify-center shadow-lg shadow-warm shrink-0">
                          <span className="text-white font-bold text-sm">
                            {req.requester?.username?.charAt(0)?.toUpperCase()}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-ink-900 text-sm truncate">
                            {req.requester?.full_name || req.requester?.username}
                          </p>
                          <p className="text-xs text-ink-400 truncate">
                            @{req.requester?.username} · <Star className="w-3 h-3 inline text-amber-600 fill-amber-400" /> {req.requester?.rating || 0}
                          </p>
                        </div>
                      </Link>

                      <div className="flex gap-2 shrink-0 ml-3">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleFriendResponse(req.id, 'accepted')}
                          className="bg-accent-50 hover:bg-accent-100 text-accent-600 text-xs font-semibold px-3.5 py-2 rounded-xl flex items-center gap-1.5 border border-accent-200 hover:border-accent-400 transition-all"
                        >
                          <Heart className="w-3.5 h-3.5 fill-accent-300" /> Accept
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleFriendResponse(req.id, 'rejected')}
                          className="bg-surface-100 hover:bg-surface-200 text-ink-500 text-xs font-semibold px-3 py-2 rounded-xl flex items-center gap-1 border border-ink-100 hover:border-ink-200 transition-all"
                        >
                          <X className="w-3.5 h-3.5" />
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============================================= */}
      {/* RECOMMENDED DEVELOPERS                        */}
      {/* ============================================= */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-ink-900 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-50 to-accent-50 flex items-center justify-center border border-purple-200">
              <Users className="w-4.5 h-4.5 text-purple-600" />
            </div>
            Developers Like You
          </h2>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => <SkeletonCard key={i} lines={2} />)}
          </div>
        ) : recUsers.length > 0 ? (
          <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4" staggerDelay={0.07}>
            {recUsers.map((rec, i) => {
              const u = rec.user || rec;
              const userId = u.id;
              const requestState = sendingRequest[userId];
              return (
                <StaggerItem key={userId || i}>
                  <div className="relative bg-white rounded-2xl p-5 border border-ink-100 hover:border-purple-200 transition-all duration-300 hover:bg-surface-50 shadow-card group">
                    <div className="flex items-start gap-3.5">
                      <Link to={`/profile/${u.username}`} className="shrink-0">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-accent-500 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-warm transition-shadow">
                          <span className="text-white font-bold">
                            {u.username?.charAt(0)?.toUpperCase()}
                          </span>
                        </div>
                      </Link>

                      <div className="min-w-0 flex-1">
                        <Link to={`/profile/${u.username}`}>
                          <p className="font-semibold text-ink-800 text-sm truncate group-hover:text-purple-600 transition-colors">
                            {u.full_name || u.username}
                          </p>
                          <p className="text-xs text-ink-400 truncate">@{u.username}</p>
                        </Link>
                        {rec.reason && (
                          <p className="text-xs text-ink-400 mt-1 truncate italic">{rec.reason}</p>
                        )}
                      </div>

                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-amber-600 flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />{u.rating || 0}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex justify-end">
                      {requestState === 'sent' ? (
                        <span className="text-xs text-accent-600 font-medium flex items-center gap-1">
                          <Heart className="w-3.5 h-3.5 fill-accent-300" /> Request Sent
                        </span>
                      ) : (
                        <motion.button
                          whileHover={{ scale: 1.04 }}
                          whileTap={{ scale: 0.96 }}
                          onClick={() => handleSendFriendRequest(userId)}
                          disabled={requestState === true}
                          className="bg-accent-50 hover:bg-accent-100 text-accent-600 text-xs font-semibold px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 border border-accent-200 hover:border-accent-300 transition-all disabled:opacity-50 disabled:cursor-wait"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          {requestState === true ? 'Sending...' : 'Add Friend'}
                        </motion.button>
                      )}
                    </div>
                  </div>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        ) : (
          <GlassCard tilt={false} hover={false} className="!cursor-default">
            <div className="text-center py-8">
              <Users className="w-10 h-10 text-ink-300 mx-auto mb-2" />
              <p className="text-ink-400 text-sm">Solve more problems to discover kindred developers!</p>
            </div>
          </GlassCard>
        )}
      </section>

      {/* ============================================= */}
      {/* RECOMMENDED PROBLEMS                          */}
      {/* ============================================= */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-ink-900 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center border border-amber-200">
              <Target className="w-4.5 h-4.5 text-amber-600" />
            </div>
            Challenges For You
          </h2>
          <Link
            to="/problems"
            className="text-sm text-accent-600 hover:text-accent-700 font-semibold flex items-center gap-1 group transition-colors"
          >
            See all <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => <SkeletonCard key={i} lines={2} />)}
          </div>
        ) : recProblems.length > 0 ? (
          <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4" staggerDelay={0.06}>
            {recProblems.map((rec, i) => {
              const p = rec.problem || rec;
              return (
                <StaggerItem key={p.id || i}>
                  <Link
                    to={`/problems/${p.slug}`}
                    className="block bg-white rounded-2xl p-5 border border-ink-100 hover:border-amber-200 transition-all duration-300 hover:bg-surface-50 shadow-card group"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <p className="font-semibold text-ink-800 text-sm group-hover:text-amber-600 transition-colors leading-snug">
                        {p.title}
                      </p>
                      <span className={`badge-${p.difficulty?.toLowerCase()} shrink-0`}>
                        {p.difficulty}
                      </span>
                    </div>
                    {rec.reason && (
                      <p className="text-xs text-ink-400 italic">{rec.reason}</p>
                    )}
                    {p.tags && p.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {p.tags.slice(0, 3).map(tag => (
                          <span
                            key={tag}
                            className="text-[10px] font-medium text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </Link>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        ) : (
          <GlassCard tilt={false} hover={false} className="!cursor-default">
            <div className="text-center py-8">
              <MessageCircleHeart className="w-10 h-10 text-ink-300 mx-auto mb-2" />
              <p className="text-ink-400 text-sm">Start solving to unlock personalized challenges!</p>
            </div>
          </GlassCard>
        )}
      </section>
    </AnimatedPage>
  );
}

/* ================================================== */
/* STAT CARD COMPONENT                                */
/* ================================================== */
function StatCard({ icon: Icon, label, value, color }) {
  const colorMap = {
    rose: {
      border: 'border-accent-200',
      shadow: 'shadow-sm',
      iconBg: 'bg-accent-50',
      iconColor: 'text-accent-600',
    },
    gold: {
      border: 'border-amber-200',
      shadow: 'shadow-sm',
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-600',
    },
    blush: {
      border: 'border-pink-200',
      shadow: 'shadow-sm',
      iconBg: 'bg-pink-50',
      iconColor: 'text-pink-600',
    },
    purple: {
      border: 'border-purple-200',
      shadow: 'shadow-sm',
      iconBg: 'bg-purple-50',
      iconColor: 'text-purple-600',
    },
  };

  const c = colorMap[color] || colorMap.rose;

  return (
    <motion.div
      whileHover={{ scale: 1.04, y: -3 }}
      className={`bg-white border ${c.border} rounded-2xl p-4 ${c.shadow} transition-all cursor-default`}
    >
      <div className={`w-8 h-8 rounded-lg ${c.iconBg} flex items-center justify-center mb-2`}>
        <Icon className={`w-4 h-4 ${c.iconColor}`} />
      </div>
      <p className="text-2xl font-black text-ink-900">{value}</p>
      <p className="text-xs text-ink-400 font-medium mt-0.5">{label}</p>
    </motion.div>
  );
}
