const express = require('express');
const { authenticate } = require('../middleware/auth');
const recommendation = require('../services/recommendation');

const router = express.Router();

// GET /api/recommendations/users
router.get('/users', authenticate, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const users = await recommendation.recommendUsers(req.user.id, limit);
    res.json({ recommendations: users });
  } catch (error) {
    console.error('User recommendation error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/recommendations/problems
router.get('/problems', authenticate, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const problems = await recommendation.recommendProblems(req.user.id, limit);
    res.json({ recommendations: problems });
  } catch (error) {
    console.error('Problem recommendation error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
