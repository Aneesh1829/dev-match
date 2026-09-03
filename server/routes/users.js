const express = require('express');
const { User, Submission, Problem, Follow, Friendship } = require('../models');
const { authenticate } = require('../middleware/auth');
const { Op } = require('sequelize');

const router = express.Router();

// GET /api/users/search?q=  — MUST be before /:username
router.get('/search', authenticate, async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) return res.json({ users: [] });

    const users = await User.findAll({
      where: {
        [Op.or]: [
          { username: { [Op.like]: `%${q}%` } },
          { full_name: { [Op.like]: `%${q}%` } },
        ],
        id: { [Op.ne]: req.user.id },
      },
      attributes: ['id', 'username', 'full_name', 'avatar', 'rating', 'total_solved', 'is_online'],
      limit: 20,
    });

    res.json({ users });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/users/leaderboard — MUST be before /:username
router.get('/leaderboard', authenticate, async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'username', 'full_name', 'avatar', 'rating', 'total_solved'],
      order: [['rating', 'DESC']],
      limit: 50,
    });
    res.json({ users });
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/users/by-id/:id — Get basic user info by UUID (for chat)
router.get('/by-id/:id', authenticate, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: ['id', 'username', 'full_name', 'avatar', 'is_online', 'rating'],
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/users/:username — MUST be LAST (catch-all param route)
router.get('/:username', authenticate, async (req, res) => {
  try {
    const user = await User.findOne({
      where: { username: req.params.username },
      attributes: { exclude: ['password'] },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get unique accepted problem IDs with their problem data
    const acceptedSubmissions = await Submission.findAll({
      where: { user_id: user.id, status: 'Accepted' },
      include: [{ model: Problem, as: 'problem', attributes: ['id', 'difficulty', 'tags'] }],
      raw: false,
    });

    // Deduplicate by problem_id to count unique solved problems
    const solvedProblems = new Map();
    acceptedSubmissions.forEach(s => {
      if (s.problem && !solvedProblems.has(s.problem_id)) {
        solvedProblems.set(s.problem_id, s.problem);
      }
    });

    const stats = { easy: 0, medium: 0, hard: 0 };
    solvedProblems.forEach(problem => {
      const d = problem.difficulty?.toLowerCase();
      if (stats[d] !== undefined) stats[d]++;
    });

    // Get follow counts
    const followersCount = await Follow.count({ where: { following_id: user.id } });
    const followingCount = await Follow.count({ where: { follower_id: user.id } });

    // Check if current user follows this user
    let isFollowing = false;
    if (req.user.id !== user.id) {
      const follow = await Follow.findOne({
        where: { follower_id: req.user.id, following_id: user.id },
      });
      isFollowing = !!follow;
    }

    // Check friendship status
    let friendshipStatus = null;
    if (req.user.id !== user.id) {
      const friendship = await Friendship.findOne({
        where: {
          [Op.or]: [
            { requester_id: req.user.id, recipient_id: user.id },
            { requester_id: user.id, recipient_id: req.user.id },
          ],
        },
      });
      friendshipStatus = friendship ? friendship.status : null;
    }

    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        avatar: user.avatar,
        bio: user.bio,
        github_url: user.github_url,
        linkedin_url: user.linkedin_url,
        skill_vector: user.skill_vector,
        total_solved: user.total_solved,
        rating: user.rating,
        is_online: user.is_online,
        last_active: user.last_active,
        created_at: user.created_at,
      },
      stats,
      followersCount,
      followingCount,
      isFollowing,
      friendshipStatus,
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
