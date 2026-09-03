const express = require('express');
const { Problem, Submission } = require('../models');
const { authenticate } = require('../middleware/auth');
const { Op } = require('sequelize');

const router = express.Router();

// GET /api/problems/tags/all - MUST be before /:slug
router.get('/tags/all', authenticate, async (req, res) => {
  try {
    const problems = await Problem.findAll({ attributes: ['tags'] });
    const tagSet = new Set();
    problems.forEach(p => {
      if (p.tags) p.tags.forEach(t => tagSet.add(t));
    });
    res.json({ tags: [...tagSet].sort() });
  } catch (error) {
    console.error('Get tags error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/problems - List all problems
router.get('/', authenticate, async (req, res) => {
  try {
    const { difficulty, tag, search, page = 1, limit = 20 } = req.query;
    const where = {};

    if (difficulty) where.difficulty = difficulty;
    if (search) where.title = { [Op.like]: `%${search}%` };

    const offset = (page - 1) * limit;
    const { count, rows } = await Problem.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['id', 'ASC']],
      // Never expose hidden test cases or solutions in listing
      attributes: { exclude: ['hidden_test_cases', 'test_cases', 'solution', 'visible_test_cases'] },
    });

    let problems = rows;
    if (tag) {
      problems = rows.filter(p => p.tags && p.tags.includes(tag));
    }

    const solvedSubmissions = await Submission.findAll({
      where: { user_id: req.user.id, status: 'Accepted', mode: 'submit' },
      attributes: ['problem_id'],
      raw: true,
    });
    const solvedIds = new Set(solvedSubmissions.map(s => s.problem_id));

    const enriched = problems.map(p => ({
      ...p.toJSON(),
      solved: solvedIds.has(p.id),
    }));

    res.json({ problems: enriched, total: count, page: parseInt(page), totalPages: Math.ceil(count / limit) });
  } catch (error) {
    console.error('Get problems error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/problems/:slug - MUST be after /tags/all
router.get('/:slug', authenticate, async (req, res) => {
  try {
    const problem = await Problem.findOne({
      where: { slug: req.params.slug },
      // Expose visible test cases but NEVER hidden ones
      attributes: { exclude: ['hidden_test_cases', 'solution', 'test_cases'] },
    });
    if (!problem) return res.status(404).json({ error: 'Problem not found' });

    // Include hidden test case COUNT so UI knows total
    const fullProblem = await Problem.findByPk(problem.id, { attributes: ['hidden_test_cases'] });
    const hiddenCount = (fullProblem.hidden_test_cases || []).length;

    const userSubmissions = await Submission.findAll({
      where: { user_id: req.user.id, problem_id: problem.id, mode: 'submit' },
      attributes: ['id', 'status', 'score', 'passed_count', 'total_count', 'runtime', 'memory', 'language', 'created_at'],
      order: [['created_at', 'DESC']],
      limit: 10,
    });

    // Best submission
    const bestSubmission = await Submission.findOne({
      where: { user_id: req.user.id, problem_id: problem.id, mode: 'submit' },
      order: [['score', 'DESC'], ['runtime', 'ASC']],
    });

    // Latest submission code so user can resume
    const latestSubmission = await Submission.findOne({
      where: { user_id: req.user.id, problem_id: problem.id },
      attributes: ['code'],
      order: [['created_at', 'DESC']],
    });

    res.json({
      problem: {
        ...problem.toJSON(),
        hiddenTestCount: hiddenCount,
        totalTestCount: (problem.visible_test_cases || []).length + hiddenCount,
      },
      submissions: userSubmissions,
      bestScore: bestSubmission?.score || 0,
      lastCode: latestSubmission?.code || null,
    });
  } catch (error) {
    console.error('Get problem error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
