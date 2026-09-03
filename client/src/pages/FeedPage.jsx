import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { socialAPI } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedPage, { StaggerContainer, StaggerItem } from '../components/UI/AnimatedPage';
import { Heart, MessageCircle, Send, Award, Code2, MessageSquare, Globe, Users } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

export default function FeedPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState('');
  const [postType, setPostType] = useState('general');
  const [posting, setPosting] = useState(false);
  const [commentText, setCommentText] = useState({});
  const [feedMode, setFeedMode] = useState('all');

  useEffect(() => { fetchFeed(); }, [feedMode]);

  const fetchFeed = async () => {
    setLoading(true);
    try {
      const res = await socialAPI.getFeed({ limit: 30, mode: feedMode });
      setPosts(res.data.posts || []);
    } catch (err) { console.error('Feed error:', err); }
    finally { setLoading(false); }
  };

  const handleCreatePost = async () => {
    if (!newPost.trim()) return;
    setPosting(true);
    try {
      const res = await socialAPI.createPost({ content: newPost, type: postType });
      setPosts(prev => [{ ...res.data.post, comments: [], liked: false }, ...prev]);
      setNewPost('');
      setPostType('general');
      toast.success('Post created!');
    } catch (err) { toast.error('Failed to create post'); }
    finally { setPosting(false); }
  };

  const handleLike = async (postId) => {
    try {
      const res = await socialAPI.likePost(postId);
      setPosts(prev => prev.map(p =>
        p.id === postId ? { ...p, liked: res.data.liked, likes_count: res.data.likes_count } : p
      ));
    } catch (err) { toast.error('Failed to like post'); }
  };

  const handleComment = async (postId) => {
    const text = commentText[postId]?.trim();
    if (!text) return;
    try {
      const res = await socialAPI.commentPost(postId, text);
      setPosts(prev => prev.map(p =>
        p.id === postId ? {
          ...p, comments_count: (p.comments_count || 0) + 1,
          comments: [...(p.comments || []), res.data.comment],
        } : p
      ));
      setCommentText(prev => ({ ...prev, [postId]: '' }));
    } catch (err) { toast.error('Failed to comment'); }
  };

  const typeIcons = { achievement: Award, solution: Code2, discussion: MessageSquare, general: MessageCircle };
  const typeColors = { achievement: 'text-amber-400', solution: 'text-emerald-600', discussion: 'text-blue-600', general: 'text-ink-500' };

  return (
    <AnimatedPage className="max-w-2xl mx-auto space-y-6">
      {/* Header with feed toggle */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink-900">Activity Feed</h1>
        <div className="flex bg-white rounded-xl p-1 border border-ink-100">
          {[{ mode: 'all', icon: Globe, label: 'All' }, { mode: 'following', icon: Users, label: 'Following' }].map(({ mode, icon: Icon, label }) => (
            <button
              key={mode}
              onClick={() => setFeedMode(mode)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                feedMode === mode
                  ? 'bg-accent-50 text-accent-600 shadow-sm'
                  : 'text-ink-400 hover:text-ink-700'
              }`}
            >
              <Icon className="w-3.5 h-3.5" /> {label}
            </button>
          ))}
        </div>
      </div>

      {/* Create Post */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card">
        <div className="flex gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-accent-500 to-neon-purple rounded-xl flex items-center justify-center shrink-0 shadow-sm">
            <span className="text-white font-semibold text-sm">{user?.username?.charAt(0)?.toUpperCase() || 'U'}</span>
          </div>
          <div className="flex-1">
            <textarea
              className="input-field resize-none"
              rows={3}
              placeholder="Share something with the community..."
              value={newPost}
              onChange={e => setNewPost(e.target.value)}
            />
            <div className="flex items-center justify-between mt-3">
              <div className="flex gap-1.5 flex-wrap">
                {['general', 'discussion', 'achievement', 'solution'].map(type => {
                  const Icon = typeIcons[type];
                  return (
                    <motion.button
                      key={type}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setPostType(type)}
                      className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium capitalize transition-all duration-300 ${
                        postType === type
                          ? 'bg-accent-50 text-accent-600 border border-accent-200'
                          : 'bg-white text-ink-400 border border-ink-100 hover:text-ink-700'
                      }`}
                    >
                      <Icon className="w-3 h-3" /> {type}
                    </motion.button>
                  );
                })}
              </div>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleCreatePost}
                disabled={posting || !newPost.trim()}
                className="btn-primary text-sm flex items-center gap-1"
              >
                <Send className="w-4 h-4 relative z-10" />
                <span className="relative z-10">{posting ? 'Posting...' : 'Post'}</span>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Posts */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="glass-card animate-pulse">
              <div className="flex gap-3">
                <div className="w-10 h-10 bg-surface-200 rounded-xl shrink-0" />
                <div className="flex-1 space-y-3">
                  <div className="h-4 bg-surface-200 rounded w-1/3" />
                  <div className="h-4 bg-surface-200 rounded w-full" />
                  <div className="h-4 bg-surface-200 rounded w-2/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : posts.length > 0 ? (
        <StaggerContainer className="space-y-4" staggerDelay={0.08}>
          {posts.map(post => {
            const TypeIcon = typeIcons[post.type] || MessageCircle;
            const typeColor = typeColors[post.type] || 'text-ink-500';
            return (
              <StaggerItem key={post.id}>
                <div className="glass-card hover:border-ink-200 transition-all duration-300">
                  <div className="flex gap-3">
                    <Link to={`/profile/${post.author?.username}`} className="shrink-0">
                      <div className="w-10 h-10 bg-gradient-to-br from-accent-100 to-purple-100 rounded-xl flex items-center justify-center border border-ink-100">
                        <span className="text-accent-600 font-semibold text-sm">
                          {post.author?.username?.charAt(0)?.toUpperCase() || '?'}
                        </span>
                      </div>
                    </Link>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Link to={`/profile/${post.author?.username}`} className="font-semibold text-ink-900 text-sm hover:text-accent-600 transition-colors">
                          {post.author?.full_name || post.author?.username}
                        </Link>
                        <span className={`flex items-center gap-0.5 text-xs capitalize ${typeColor}`}>
                          <TypeIcon className="w-3 h-3" /> {post.type}
                        </span>
                        <span className="text-xs text-ink-300">
                          {post.created_at ? formatDistanceToNow(new Date(post.created_at), { addSuffix: true }) : ''}
                        </span>
                      </div>
                      <p className="text-ink-700 text-sm whitespace-pre-wrap mb-3">{post.content}</p>

                      {/* Actions */}
                      <div className="flex items-center gap-4 pb-2">
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleLike(post.id)}
                          className={`flex items-center gap-1.5 text-sm font-medium transition-all duration-300 ${
                            post.liked ? 'text-rose-500' : 'text-ink-400 hover:text-rose-500'
                          }`}
                        >
                          <motion.div animate={post.liked ? { scale: [1, 1.3, 1] } : {}} transition={{ duration: 0.3 }}>
                            <Heart className={`w-4 h-4 ${post.liked ? 'fill-current' : ''}`} />
                          </motion.div>
                          {post.likes_count || 0}
                        </motion.button>
                        <span className="flex items-center gap-1.5 text-sm text-ink-400">
                          <MessageCircle className="w-4 h-4" />
                          {post.comments_count || 0}
                        </span>
                      </div>

                      {/* Comments */}
                      <AnimatePresence>
                        {post.comments?.length > 0 && (
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2 border-t border-ink-100 pt-3">
                            {post.comments.map(comment => (
                              <div key={comment.id} className="flex gap-2">
                                <div className="w-6 h-6 bg-surface-200 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                                  <span className="text-xs font-medium text-ink-500">{comment.user?.username?.charAt(0)?.toUpperCase() || '?'}</span>
                                </div>
                                <div className="bg-white rounded-xl px-3 py-2 flex-1 border border-ink-100/50">
                                  <Link to={`/profile/${comment.user?.username}`} className="text-xs font-semibold text-ink-700 hover:text-accent-600 transition-colors">
                                    {comment.user?.username}
                                  </Link>
                                  <p className="text-xs text-ink-500 mt-0.5">{comment.content}</p>
                                </div>
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Add Comment */}
                      <div className="flex gap-2 mt-3">
                        <input
                          type="text"
                          className="input-field text-sm py-1.5"
                          placeholder="Write a comment..."
                          value={commentText[post.id] || ''}
                          onChange={e => setCommentText(prev => ({ ...prev, [post.id]: e.target.value }))}
                          onKeyDown={e => e.key === 'Enter' && handleComment(post.id)}
                        />
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleComment(post.id)}
                          disabled={!commentText[post.id]?.trim()}
                          className="btn-primary text-sm px-3 disabled:opacity-40"
                        >
                          <Send className="w-4 h-4 relative z-10" />
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      ) : (
        <div className="glass-card text-center py-16">
          <MessageCircle className="w-14 h-14 text-ink-300 mx-auto mb-4" />
          <h3 className="font-semibold text-ink-700 mb-1">
            {feedMode === 'following' ? 'No posts from people you follow' : 'No posts yet'}
          </h3>
          <p className="text-ink-400 text-sm">
            {feedMode === 'following'
              ? 'Follow more users or switch to All to see community posts.'
              : 'Be the first to share something with the community!'}
          </p>
        </div>
      )}
    </AnimatedPage>
  );
}
