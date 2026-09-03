const express = require('express');
const { body } = require('express-validator');
const { User, Friendship, Follow, Post, PostLike, Comment } = require('../models');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { Op } = require('sequelize');

const router = express.Router();

// ===== FRIEND REQUESTS =====

// POST /api/social/friend-request
router.post('/friend-request', authenticate, [
  body('recipient_id').isUUID(),
  validate,
], async (req, res) => {
  try {
    const { recipient_id } = req.body;
    if (recipient_id === req.user.id) {
      return res.status(400).json({ error: 'Cannot send request to yourself' });
    }

    const existing = await Friendship.findOne({
      where: {
        [Op.or]: [
          { requester_id: req.user.id, recipient_id },
          { requester_id: recipient_id, recipient_id: req.user.id },
        ],
      },
    });

    if (existing) {
      // If previously rejected, delete old record and allow re-sending
      if (existing.status === 'rejected') {
        await existing.destroy();
      } else {
        return res.status(400).json({ error: 'Friend request already exists' });
      }
    }

    const friendship = await Friendship.create({
      requester_id: req.user.id,
      recipient_id,
    });

    res.status(201).json({ friendship });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/social/friend-request/:id
router.put('/friend-request/:id', authenticate, async (req, res) => {
  try {
    const { status } = req.body; // 'accepted' or 'rejected'
    const friendship = await Friendship.findByPk(req.params.id);

    if (!friendship || friendship.recipient_id !== req.user.id) {
      return res.status(404).json({ error: 'Request not found' });
    }

    await friendship.update({ status });
    res.json({ friendship });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/social/friends
router.get('/friends', authenticate, async (req, res) => {
  try {
    const friendships = await Friendship.findAll({
      where: {
        status: 'accepted',
        [Op.or]: [
          { requester_id: req.user.id },
          { recipient_id: req.user.id },
        ],
      },
      include: [
        { model: User, as: 'requester', attributes: ['id', 'username', 'full_name', 'avatar', 'is_online', 'rating'] },
        { model: User, as: 'recipient', attributes: ['id', 'username', 'full_name', 'avatar', 'is_online', 'rating'] },
      ],
    });

    const friends = friendships.map(f => {
      return f.requester_id === req.user.id ? f.recipient : f.requester;
    });

    res.json({ friends });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/social/friend-requests
router.get('/friend-requests', authenticate, async (req, res) => {
  try {
    const requests = await Friendship.findAll({
      where: { recipient_id: req.user.id, status: 'pending' },
      include: [
        { model: User, as: 'requester', attributes: ['id', 'username', 'full_name', 'avatar', 'rating'] },
      ],
    });
    res.json({ requests });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ===== FOLLOW SYSTEM =====

// POST /api/social/follow/:userId
router.post('/follow/:userId', authenticate, async (req, res) => {
  try {
    const followingId = req.params.userId;
    if (followingId === req.user.id) {
      return res.status(400).json({ error: 'Cannot follow yourself' });
    }

    const existing = await Follow.findOne({
      where: { follower_id: req.user.id, following_id: followingId },
    });

    if (existing) {
      await existing.destroy();
      return res.json({ followed: false });
    }

    await Follow.create({ follower_id: req.user.id, following_id: followingId });
    res.json({ followed: true });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/social/followers/:userId
router.get('/followers/:userId', authenticate, async (req, res) => {
  try {
    const follows = await Follow.findAll({
      where: { following_id: req.params.userId },
      include: [{ model: User, as: 'follower', attributes: ['id', 'username', 'full_name', 'avatar', 'rating'] }],
    });
    res.json({ followers: follows.map(f => f.follower) });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/social/following/:userId
router.get('/following/:userId', authenticate, async (req, res) => {
  try {
    const follows = await Follow.findAll({
      where: { follower_id: req.params.userId },
      include: [{ model: User, as: 'followedUser', attributes: ['id', 'username', 'full_name', 'avatar', 'rating'] }],
    });
    res.json({ following: follows.map(f => f.followedUser) });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ===== POSTS / FEED =====

// POST /api/social/posts
router.post('/posts', authenticate, [
  body('content').trim().notEmpty(),
  body('type').optional().isIn(['achievement', 'discussion', 'solution', 'general']),
  validate,
], async (req, res) => {
  try {
    const { content, type, problem_id } = req.body;
    const post = await Post.create({
      user_id: req.user.id,
      content,
      type: type || 'general',
      problem_id: problem_id || null,
    });

    const fullPost = await Post.findByPk(post.id, {
      include: [{ model: User, as: 'author', attributes: ['id', 'username', 'full_name', 'avatar'] }],
    });

    res.status(201).json({ post: fullPost });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/social/feed
router.get('/feed', authenticate, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const mode = req.query.mode || 'all'; // 'all' or 'following'

    // Build where clause based on mode
    let whereClause = {};
    if (mode === 'following') {
      const follows = await Follow.findAll({
        where: { follower_id: req.user.id },
        attributes: ['following_id'],
        raw: true,
      });
      const followingIds = follows.map(f => f.following_id);
      followingIds.push(req.user.id);
      whereClause = { user_id: { [Op.in]: followingIds } };
    }

    // Fetch posts (without nested comment include to avoid Sequelize issues)
    const { count, rows } = await Post.findAndCountAll({
      where: whereClause,
      include: [
        { model: User, as: 'author', attributes: ['id', 'username', 'full_name', 'avatar'] },
      ],
      order: [['created_at', 'DESC']],
      limit,
      offset: (page - 1) * limit,
      distinct: true,
    });

    // Fetch comments separately for each post
    const postIds = rows.map(p => p.id);

    let commentsMap = {};
    if (postIds.length > 0) {
      const comments = await Comment.findAll({
        where: { post_id: { [Op.in]: postIds } },
        include: [{ model: User, as: 'user', attributes: ['id', 'username', 'avatar'] }],
        order: [['created_at', 'ASC']],
      });
      comments.forEach(c => {
        const pid = c.post_id;
        if (!commentsMap[pid]) commentsMap[pid] = [];
        commentsMap[pid].push(c);
      });
    }

    // Check which posts current user has liked
    let likedPostIds = new Set();
    if (postIds.length > 0) {
      const userLikes = await PostLike.findAll({
        where: { user_id: req.user.id, post_id: { [Op.in]: postIds } },
        raw: true,
      });
      likedPostIds = new Set(userLikes.map(l => l.post_id));
    }

    const enriched = rows.map(p => ({
      ...p.toJSON(),
      comments: (commentsMap[p.id] || []).slice(-5),
      liked: likedPostIds.has(p.id),
    }));

    res.json({ posts: enriched, total: count, page, totalPages: Math.ceil(count / limit) });
  } catch (error) {
    console.error('Feed error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/social/posts/:id/like
router.post('/posts/:id/like', authenticate, async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const existing = await PostLike.findOne({
      where: { user_id: req.user.id, post_id: post.id },
    });

    if (existing) {
      await existing.destroy();
      await post.decrement('likes_count');
      return res.json({ liked: false, likes_count: post.likes_count - 1 });
    }

    await PostLike.create({ user_id: req.user.id, post_id: post.id });
    await post.increment('likes_count');
    res.json({ liked: true, likes_count: post.likes_count + 1 });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/social/posts/:id/comment
router.post('/posts/:id/comment', authenticate, [
  body('content').trim().notEmpty(),
  validate,
], async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const comment = await Comment.create({
      user_id: req.user.id,
      post_id: post.id,
      content: req.body.content,
    });

    await post.increment('comments_count');

    const fullComment = await Comment.findByPk(comment.id, {
      include: [{ model: User, as: 'user', attributes: ['id', 'username', 'avatar'] }],
    });

    res.status(201).json({ comment: fullComment });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
