const { User, Problem, Submission } = require('../models');
const { Op } = require('sequelize');

class RecommendationEngine {
  /**
   * Compute cosine similarity between two skill vectors
   */
  cosineSimilarity(vecA, vecB) {
    const allKeys = new Set([...Object.keys(vecA), ...Object.keys(vecB)]);
    let dotProduct = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;

    for (const key of allKeys) {
      const a = vecA[key] || 0;
      const b = vecB[key] || 0;
      dotProduct += a * b;
      magnitudeA += a * a;
      magnitudeB += b * b;
    }

    magnitudeA = Math.sqrt(magnitudeA);
    magnitudeB = Math.sqrt(magnitudeB);

    if (magnitudeA === 0 || magnitudeB === 0) return 0;
    return dotProduct / (magnitudeA * magnitudeB);
  }

  /**
   * Recommend users with similar skill profiles
   */
  async recommendUsers(userId, limit = 10) {
    const currentUser = await User.findByPk(userId);
    if (!currentUser || !currentUser.skill_vector || Object.keys(currentUser.skill_vector).length === 0) {
      // Return top-rated users if no skill data
      const users = await User.findAll({
        where: { id: { [Op.ne]: userId } },
        order: [['rating', 'DESC']],
        limit,
        attributes: { exclude: ['password'] },
      });
      return users.map(u => ({ user: u.toSafeJSON(), similarity: 0, reason: 'Top rated' }));
    }

    const allUsers = await User.findAll({
      where: { id: { [Op.ne]: userId } },
      attributes: { exclude: ['password'] },
    });

    const scored = allUsers
      .map(user => ({
        user: user.toSafeJSON(),
        similarity: this.cosineSimilarity(currentUser.skill_vector, user.skill_vector || {}),
      }))
      .filter(item => item.similarity > 0)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);

    // Add reason based on shared top tags
    return scored.map(item => {
      const sharedTags = Object.keys(currentUser.skill_vector)
        .filter(tag => (item.user.skill_vector || {})[tag])
        .sort((a, b) => (currentUser.skill_vector[b] || 0) - (currentUser.skill_vector[a] || 0))
        .slice(0, 3);
      return { ...item, reason: `Shared interests: ${sharedTags.join(', ')}` };
    });
  }

  /**
   * Recommend problems based on user's weak areas
   */
  async recommendProblems(userId, limit = 10) {
    const user = await User.findByPk(userId);
    if (!user) return [];

    // Get solved problem IDs
    const solvedSubmissions = await Submission.findAll({
      where: { user_id: userId, status: 'Accepted' },
      attributes: ['problem_id'],
      group: ['problem_id'],
    });
    const solvedIds = solvedSubmissions.map(s => s.problem_id);

    // Get all unsolved problems
    const whereClause = solvedIds.length > 0
      ? { id: { [Op.notIn]: solvedIds } }
      : {};

    const problems = await Problem.findAll({
      where: whereClause,
      attributes: { exclude: ['test_cases', 'solution'] },
    });

    if (!user.skill_vector || Object.keys(user.skill_vector).length === 0) {
      // New user: recommend easy problems
      return problems
        .filter(p => p.difficulty === 'Easy')
        .slice(0, limit)
        .map(p => ({ problem: p, score: 1, reason: 'Good for beginners' }));
    }

    // Score problems: prioritize weak areas
    const skillVector = user.skill_vector;
    const maxSkill = Math.max(...Object.values(skillVector), 1);

    const scored = problems.map(problem => {
      let score = 0;
      let reason = '';

      if (problem.tags) {
        const weakTags = problem.tags.filter(tag => {
          const strength = (skillVector[tag] || 0) / maxSkill;
          return strength < 0.3;
        });

        const strongTags = problem.tags.filter(tag => {
          const strength = (skillVector[tag] || 0) / maxSkill;
          return strength >= 0.3;
        });

        // Prioritize problems that mix weak + known areas
        score = weakTags.length * 2 + strongTags.length * 0.5;

        if (weakTags.length > 0) {
          reason = `Strengthen: ${weakTags.join(', ')}`;
        } else {
          reason = `Practice: ${problem.tags.slice(0, 2).join(', ')}`;
        }
      }

      // Difficulty bonus
      if (problem.difficulty === 'Easy') score += 0.5;
      if (problem.difficulty === 'Medium') score += 1;
      if (problem.difficulty === 'Hard') score += 0.3;

      return { problem, score, reason };
    });

    return scored.sort((a, b) => b.score - a.score).slice(0, limit);
  }
}

module.exports = new RecommendationEngine();
