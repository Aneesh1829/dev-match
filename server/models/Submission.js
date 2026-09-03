const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Submission = sequelize.define('Submission', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  problem_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  language: {
    type: DataTypes.STRING(30),
    allowNull: false,
  },
  code: {
    type: DataTypes.TEXT('long'),
    allowNull: false,
  },
  mode: {
    type: DataTypes.ENUM('run', 'submit'),
    defaultValue: 'submit',
    comment: 'run = visible test cases only, submit = all test cases',
  },
  status: {
    type: DataTypes.ENUM('Accepted', 'Wrong Answer', 'Time Limit Exceeded', 'Runtime Error', 'Compilation Error', 'Partial', 'Pending'),
    defaultValue: 'Pending',
  },
  score: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Score out of problem max_score based on test cases passed',
  },
  passed_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  total_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  runtime: {
    type: DataTypes.FLOAT,
    defaultValue: null,
    comment: 'Total execution time in ms',
  },
  memory: {
    type: DataTypes.FLOAT,
    defaultValue: null,
    comment: 'Peak memory usage in KB',
  },
  visible_results: {
    type: DataTypes.JSON,
    defaultValue: [],
    comment: 'Detailed results for visible test cases (shown to user)',
  },
  hidden_results: {
    type: DataTypes.JSON,
    defaultValue: [],
    comment: 'Summary results for hidden test cases (pass/fail only)',
  },
  // Legacy field
  test_results: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
}, {
  tableName: 'submissions',
});

module.exports = Submission;
