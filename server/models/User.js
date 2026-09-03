const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    validate: { len: [3, 50] },
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: { isEmail: true },
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  full_name: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  avatar: {
    type: DataTypes.STRING(500),
    defaultValue: null,
  },
  bio: {
    type: DataTypes.TEXT,
    defaultValue: '',
  },
  github_url: {
    type: DataTypes.STRING(255),
    defaultValue: null,
  },
  linkedin_url: {
    type: DataTypes.STRING(255),
    defaultValue: null,
  },
  skill_vector: {
    type: DataTypes.JSON,
    defaultValue: {},
    comment: 'JSON object mapping tags to solve counts, e.g. {"dp": 5, "graphs": 3}',
  },
  total_solved: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  rating: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  is_online: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  last_active: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'users',
  hooks: {
    beforeCreate: async (user) => {
      user.password = await bcrypt.hash(user.password, 12);
    },
  },
});

User.prototype.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

User.prototype.toSafeJSON = function () {
  const values = { ...this.get() };
  delete values.password;
  return values;
};

module.exports = User;
