import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usersAPI, socialAPI, submissionsAPI, authAPI } from '../services/api';
import { motion } from 'framer-motion';
import AnimatedPage, { StaggerContainer, StaggerItem } from '../components/UI/AnimatedPage';
import GlassCard from '../components/UI/GlassCard';
import { User, ExternalLink, UserPlus, UserCheck, Users, Edit3, Save, X, MessageSquare, CheckCircle2, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { username } = useParams();
  const { user: currentUser, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({ easy: 0, medium: 0, hard: 0 });
  const [isFollowing, setIsFollowing] = useState(false);
  const [friendshipStatus, setFriendshipStatus] = useState(null);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});

  const isOwnProfile = currentUser?.username === username;

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setProfile(null);
      setSubmissions([]);
      try {
        const res = await usersAPI.getProfile(username);
        setProfile(res.data.user);
        setStats(res.data.stats || { easy: 0, medium: 0, hard: 0 });
        setIsFollowing(res.data.isFollowing || false);
        setFriendshipStatus(res.data.friendshipStatus || null);
        setFollowersCount(res.data.followersCount || 0);
        setFollowingCount(res.data.followingCount || 0);
        try {
          const subRes = await submissionsAPI.getUserSubmissions(res.data.user.id);
          setSubmissions(subRes.data.submissions || []);
        } catch (subErr) { console.error('Failed to load submissions:', subErr); }
      } catch (err) {
        if (err.response?.status === 404) toast.error('User not found');
        else { toast.error('Failed to load profile'); console.error('Profile error:', err); }
      } finally { setLoading(false); }
    };
    if (username) fetchProfile();
  }, [username]);

  const handleFollow = async () => {
    if (!profile?.id) return;
    try {
      const res = await socialAPI.toggleFollow(profile.id);
      setIsFollowing(res.data.followed);
      setFollowersCount(prev => res.data.followed ? prev + 1 : prev - 1);
    } catch (err) { toast.error('Failed to follow'); }
  };

  const handleFriendRequest = async () => {
    if (!profile?.id) return;
    try {
      await socialAPI.sendFriendRequest(profile.id);
      setFriendshipStatus('pending');
      toast.success('Friend request sent!');
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to send request'); }
  };

  const handleSaveProfile = async () => {
    try {
      const res = await authAPI.updateProfile(editForm);
      setProfile(res.data.user);
      updateUser(res.data.user);
      setEditing(false);
      toast.success('Profile updated!');
    } catch (err) { toast.error('Failed to update profile'); }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <motion.div
          className="w-12 h-12 rounded-full border-2 border-accent-200 border-t-accent-600"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-20">
        <User className="w-16 h-16 text-ink-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-ink-700 mb-2">User not found</h2>
        <p className="text-ink-400 mb-4">The user "@{username}" doesn't exist.</p>
        <Link to="/dashboard" className="btn-primary"><span className="relative z-10">Go to Dashboard</span></Link>
      </div>
    );
  }

  const skillVector = profile.skill_vector || {};
  const topSkills = Object.entries(skillVector).sort((a, b) => (b[1] || 0) - (a[1] || 0)).slice(0, 8);
  const totalSolved = (stats.easy || 0) + (stats.medium || 0) + (stats.hard || 0);

  return (
    <AnimatedPage className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header */}
      <GlassCard tilt={false} glow glowColor="accent" hover={false} className="!cursor-default">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className="w-24 h-24 bg-gradient-to-br from-accent-500 to-purple-500 rounded-2xl flex items-center justify-center shrink-0 shadow-xl shadow-warm"
          >
            {profile.avatar ? (
              <img src={profile.avatar} alt="" className="w-24 h-24 rounded-2xl object-cover" />
            ) : (
              <User className="w-10 h-10 text-white" />
            )}
          </motion.div>

          <div className="flex-1 min-w-0">
            {editing ? (
              <div className="space-y-3">
                <input className="input-field" placeholder="Full Name" value={editForm.full_name || ''} onChange={e => setEditForm({ ...editForm, full_name: e.target.value })} />
                <textarea className="input-field" placeholder="Bio" rows={2} value={editForm.bio || ''} onChange={e => setEditForm({ ...editForm, bio: e.target.value })} />
                <input className="input-field" placeholder="GitHub URL" value={editForm.github_url || ''} onChange={e => setEditForm({ ...editForm, github_url: e.target.value })} />
                <input className="input-field" placeholder="LinkedIn URL" value={editForm.linkedin_url || ''} onChange={e => setEditForm({ ...editForm, linkedin_url: e.target.value })} />
                <div className="flex gap-2">
                  <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={handleSaveProfile} className="btn-primary text-sm flex items-center gap-1">
                    <Save className="w-4 h-4 relative z-10" /> <span className="relative z-10">Save</span>
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => setEditing(false)} className="btn-secondary text-sm flex items-center gap-1">
                    <X className="w-4 h-4" /> Cancel
                  </motion.button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-2xl font-bold text-ink-900">{profile.full_name || profile.username}</h1>
                  {profile.is_online && (
                    <span className="inline-flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Online
                    </span>
                  )}
                </div>
                <p className="text-ink-400 mb-2">@{profile.username}</p>
                {profile.bio && <p className="text-ink-700 mb-3 text-sm">{profile.bio}</p>}

                <div className="flex items-center gap-4 text-sm text-ink-400 mb-4 flex-wrap">
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" /> <strong className="text-ink-900">{followersCount}</strong> followers
                  </span>
                  <span><strong className="text-ink-900">{followingCount}</strong> following</span>
                  {profile.github_url && (
                    <a href={profile.github_url} target="_blank" rel="noreferrer" className="hover:text-accent-600 flex items-center gap-1 transition-colors">
                      <ExternalLink className="w-4 h-4" /> GitHub
                    </a>
                  )}
                  {profile.linkedin_url && (
                    <a href={profile.linkedin_url} target="_blank" rel="noreferrer" className="hover:text-accent-600 flex items-center gap-1 transition-colors">
                      <ExternalLink className="w-4 h-4" /> LinkedIn
                    </a>
                  )}
                </div>

                {isOwnProfile ? (
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => { setEditing(true); setEditForm({ full_name: profile.full_name || '', bio: profile.bio || '', github_url: profile.github_url || '', linkedin_url: profile.linkedin_url || '' }); }}
                    className="btn-secondary text-sm flex items-center gap-1"
                  >
                    <Edit3 className="w-4 h-4" /> Edit Profile
                  </motion.button>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                      onClick={handleFollow} className={isFollowing ? 'btn-secondary text-sm' : 'btn-primary text-sm'}>
                      <span className="relative z-10">{isFollowing ? 'Unfollow' : 'Follow'}</span>
                    </motion.button>
                    {!friendshipStatus && (
                      <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                        onClick={handleFriendRequest} className="btn-secondary text-sm flex items-center gap-1">
                        <UserPlus className="w-4 h-4" /> Add Friend
                      </motion.button>
                    )}
                    {friendshipStatus === 'pending' && (
                      <span className="btn-secondary text-sm opacity-75 cursor-default">Request Pending</span>
                    )}
                    {friendshipStatus === 'accepted' && (
                      <span className="btn-secondary text-sm flex items-center gap-1 text-emerald-600 cursor-default">
                        <UserCheck className="w-4 h-4" /> Friends
                      </span>
                    )}
                    <Link to={`/chat/${profile.id}`}>
                      <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="btn-secondary text-sm flex items-center gap-1">
                        <MessageSquare className="w-4 h-4" /> Message
                      </motion.div>
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </GlassCard>

      <StaggerContainer className="grid md:grid-cols-3 gap-6" staggerDelay={0.1}>
        {/* Stats */}
        <StaggerItem>
          <GlassCard tilt glow glowColor="green" hover={false} className="text-center !cursor-default">
            <h3 className="text-3xl font-bold text-ink-900">{totalSolved}</h3>
            <p className="text-sm text-ink-400 mb-4">Problems Solved</p>
            <div className="space-y-2">
              <StatBar label="Easy" count={stats.easy || 0} color="bg-emerald-500" />
              <StatBar label="Medium" count={stats.medium || 0} color="bg-amber-500" />
              <StatBar label="Hard" count={stats.hard || 0} color="bg-rose-500" />
            </div>
          </GlassCard>
        </StaggerItem>

        {/* Rating */}
        <StaggerItem>
          <GlassCard tilt glow glowColor="accent" hover={false} className="text-center !cursor-default">
            <h3 className="text-3xl font-bold gradient-text-cyan">{profile.rating || 0}</h3>
            <p className="text-sm text-ink-400">Rating</p>
          </GlassCard>
        </StaggerItem>

        {/* Skills */}
        <StaggerItem>
          <GlassCard tilt glow glowColor="purple" hover={false} className="!cursor-default">
            <h3 className="font-semibold text-ink-900 mb-3">Top Skills</h3>
            {topSkills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {topSkills.map(([tag, count]) => (
                  <span key={tag} className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-accent-50 text-accent-600 font-medium capitalize border border-accent-200">
                    {tag.replace('-', ' ')} <span className="text-accent-400">({count})</span>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-ink-400">No skills yet</p>
            )}
          </GlassCard>
        </StaggerItem>
      </StaggerContainer>

      {/* Recent Submissions */}
      <GlassCard tilt={false} hover={false} className="!cursor-default">
        <h3 className="font-semibold text-ink-900 mb-4">Recent Submissions</h3>
        {submissions.length > 0 ? (
          <StaggerContainer className="space-y-2" staggerDelay={0.05}>
            {submissions.slice(0, 10).map((sub, i) => (
              <StaggerItem key={sub.id || i}>
                <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-ink-100 hover:border-ink-200 transition-all">
                  <div className="flex items-center gap-3">
                    {sub.status === 'Accepted' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-500" />
                    )}
                    <span className={`text-sm font-medium ${sub.status === 'Accepted' ? 'text-emerald-600' : 'text-rose-500'}`}>
                      {sub.status}
                    </span>
                    {sub.problem && (
                      <Link to={`/problems/${sub.problem.slug}`} className="text-sm text-ink-500 hover:text-accent-600 transition-colors">
                        {sub.problem.title}
                      </Link>
                    )}
                  </div>
                  <span className="text-xs text-ink-400 bg-white px-2 py-0.5 rounded border border-ink-100">{sub.language}</span>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        ) : (
          <p className="text-sm text-ink-400">No submissions yet</p>
        )}
      </GlassCard>
    </AnimatedPage>
  );
}

function StatBar({ label, count, color }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-ink-400 w-16 text-left">{label}</span>
      <div className="flex-1 bg-surface-200 rounded-full h-2 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min((count || 0) * 10, 100)}%` }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
          className={`${color} h-2 rounded-full`}
        />
      </div>
      <span className="text-xs font-medium text-ink-500 w-6">{count || 0}</span>
    </div>
  );
}
