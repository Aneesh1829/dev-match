const express = require('express');
const { body } = require('express-validator');
const { Op } = require('sequelize');
const { Submission, Problem, User } = require('../models');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const codeExecutor = require('../services/codeExecutor');

const router = express.Router();

/**
 * POST /api/submissions/run
 * Run code against VISIBLE test cases only (no scoring, no save)
 */
router.post('/run', authenticate, [
  body('problem_id').isInt(),
  body('code').notEmpty(),
  validate,
], async (req, res) => {
  try {
    const { problem_id, code } = req.body;
    const language = 'python'; // Python only for now

    const problem = await Problem.findByPk(problem_id);
    if (!problem) return res.status(404).json({ error: 'Problem not found' });

    const visibleTests = problem.visible_test_cases || problem.test_cases || [];
    const timeLimit = problem.time_limit || 5000;

    const execution = await codeExecutor.run(code, language, visibleTests, timeLimit);

    res.json({
      mode: 'run',
      status: execution.status,
      results: execution.results,
      runtime: execution.runtime,
      memory: execution.memory,
      passedCount: execution.results.filter(r => r.passed).length,
      totalCount: execution.results.length,
    });
  } catch (error) {
    console.error('Run error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * POST /api/submissions/submit
 * Submit code against ALL test cases (visible + hidden), calculate score, save
 */
router.post('/submit', authenticate, [
  body('problem_id').isInt(),
  body('code').notEmpty(),
  validate,
], async (req, res) => {
  try {
    const { problem_id, code } = req.body;
    const language = 'python';

    const problem = await Problem.findByPk(problem_id);
    if (!problem) return res.status(404).json({ error: 'Problem not found' });

    const visibleTests = problem.visible_test_cases || problem.test_cases || [];
    const hiddenTests = problem.hidden_test_cases || [];
    const timeLimit = problem.time_limit || 5000;
    const maxScore = problem.max_score || 100;

    const execution = await codeExecutor.submit(
      code, language, visibleTests, hiddenTests, timeLimit, maxScore
    );

    // Save submission
    const submission = await Submission.create({
      user_id: req.user.id,
      problem_id,
      language,
      code,
      mode: 'submit',
      status: execution.status,
      score: execution.score,
      passed_count: execution.passedCount,
      total_count: execution.totalCount,
      runtime: execution.runtime,
      memory: execution.memory,
      visible_results: execution.visibleResults,
      hidden_results: execution.hiddenResults,
      test_results: execution.visibleResults, // legacy
    });

    // Update problem stats
    await problem.increment('total_submissions');
    if (execution.allPassed) {
      await problem.increment('total_accepted');
    }

    // Refresh acceptance rate
    const totalSub = await Submission.count({ where: { problem_id, mode: 'submit' } });
    const totalAcc = await Submission.count({ where: { problem_id, status: 'Accepted', mode: 'submit' } });
    await problem.update({
      acceptance_rate: totalSub > 0 ? (totalAcc / totalSub) * 100 : 0,
    });

    // Update user stats if fully accepted & first time
    if (execution.allPassed) {
      const skillVector = { ...req.user.skill_vector };
      if (problem.tags) {
        problem.tags.forEach(tag => {
          skillVector[tag] = (skillVector[tag] || 0) + 1;
        });
      }

      const previousAccepted = await Submission.count({
        where: { user_id: req.user.id, problem_id, status: 'Accepted', id: { [Op.ne]: submission.id } },
      });

      if (previousAccepted === 0) {
        const ratingGain = problem.difficulty === 'Easy' ? 10 : problem.difficulty === 'Medium' ? 20 : 35;
        await req.user.update({
          skill_vector: skillVector,
          total_solved: req.user.total_solved + 1,
          rating: req.user.rating + ratingGain,
        });
      }
    }

    res.json({
      mode: 'submit',
      submission: {
        id: submission.id,
        status: submission.status,
        score: execution.score,
        maxScore: execution.maxScore,
        passedCount: execution.passedCount,
        totalCount: execution.totalCount,
        runtime: execution.runtime,
        memory: execution.memory,
      },
      visibleResults: execution.visibleResults,
      hiddenResults: execution.hiddenResults,
      allPassed: execution.allPassed,
    });
  } catch (error) {
    console.error('Submit error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Legacy POST /api/submissions (redirect to submit)
router.post('/', authenticate, [
  body('problem_id').isInt(),
  body('code').notEmpty(),
  validate,
], async (req, res) => {
  // Forward to submit logic
  req.body.language = 'python';
  const { problem_id, code } = req.body;
  const language = 'python';

  try {
    const problem = await Problem.findByPk(problem_id);
    if (!problem) return res.status(404).json({ error: 'Problem not found' });

    const visibleTests = problem.visible_test_cases || problem.test_cases || [];
    const hiddenTests = problem.hidden_test_cases || [];
    const execution = await codeExecutor.submit(code, language, visibleTests, hiddenTests, problem.time_limit || 5000, problem.max_score || 100);

    const submission = await Submission.create({
      user_id: req.user.id,
      problem_id,
      language,
      code,
      mode: 'submit',
      status: execution.status,
      score: execution.score,
      passed_count: execution.passedCount,
      total_count: execution.totalCount,
      runtime: execution.runtime,
      memory: execution.memory,
      visible_results: execution.visibleResults,
      hidden_results: execution.hiddenResults,
      test_results: execution.visibleResults,
    });

    res.json({ submission: submission.toJSON(), execution });
  } catch (error) {
    console.error('Submit error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/submissions/user/:userId
router.get('/user/:userId', authenticate, async (req, res) => {
  try {
    const submissions = await Submission.findAll({
      where: { user_id: req.params.userId, mode: 'submit' },
      include: [{ model: Problem, as: 'problem', attributes: ['title', 'slug', 'difficulty', 'tags', 'max_score'] }],
      order: [['created_at', 'DESC']],
      limit: 50,
    });
    res.json({ submissions });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
