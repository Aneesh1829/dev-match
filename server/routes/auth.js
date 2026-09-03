const express = require('express');
const { body } = require('express-validator');
const { User } = require('../models');
const { authenticate, generateToken } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const router = express.Router();

// POST /api/auth/register
router.post('/register', [
  body('username').trim().isLength({ min: 3, max: 50 }).withMessage('Username must be 3-50 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('full_name').optional().trim().isLength({ max: 100 }),
  validate,
], async (req, res) => {
  try {
    const { username, email, password, full_name } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const existingUsername = await User.findOne({ where: { username } });
    if (existingUsername) {
      return res.status(400).json({ error: 'Username already taken' });
    }

    const user = await User.create({ username, email, password, full_name });
    const token = generateToken(user.id);

    res.status(201).json({
      token,
      user: user.toSafeJSON(),
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/login
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
  validate,
], async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    await user.update({ is_online: true, last_active: new Date() });
    const token = generateToken(user.id);

    res.json({
      token,
      user: user.toSafeJSON(),
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/auth/me
router.get('/me', authenticate, async (req, res) => {
  res.json({ user: req.user.toSafeJSON() });
});

// PUT /api/auth/profile
router.put('/profile', authenticate, async (req, res) => {
  try {
    const { full_name, bio, github_url, linkedin_url, avatar } = req.body;
    await req.user.update({ full_name, bio, github_url, linkedin_url, avatar });
    res.json({ user: req.user.toSafeJSON() });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
