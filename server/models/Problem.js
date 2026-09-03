const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Problem = sequelize.define('Problem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  slug: {
    type: DataTypes.STRING(200),
    allowNull: false,
    unique: true,
  },
  description: {
    type: DataTypes.TEXT('long'),
    allowNull: false,
  },
  difficulty: {
    type: DataTypes.ENUM('Easy', 'Medium', 'Hard'),
    allowNull: false,
  },
  tags: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  constraints: {
    type: DataTypes.TEXT,
    defaultValue: '',
  },
  examples: {
    type: DataTypes.JSON,
    defaultValue: [],
    comment: 'Array of {input, output, explanation} — shown in description',
  },
  visible_test_cases: {
    type: DataTypes.JSON,
    defaultValue: [],
    comment: 'Array of {input, expected_output} — 3 cases shown to user during Run',
  },
  hidden_test_cases: {
    type: DataTypes.JSON,
    defaultValue: [],
    comment: 'Array of {input, expected_output} — 10 secret cases tested during Submit',
  },
  // Keep legacy field for backward compat during migration
  test_cases: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  starter_code: {
    type: DataTypes.JSON,
    defaultValue: {},
    comment: '{"python": "code..."}',
  },
  solution: {
    type: DataTypes.TEXT,
    defaultValue: null,
  },
  time_limit: {
    type: DataTypes.INTEGER,
    defaultValue: 5000,
    comment: 'Time limit per test case in ms',
  },
  max_score: {
    type: DataTypes.INTEGER,
    defaultValue: 100,
    comment: 'Maximum score for this problem',
  },
  acceptance_rate: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
  total_submissions: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  total_accepted: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  tableName: 'problems',
});

module.exports = Problem;
