const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const PostLike = sequelize.define('PostLike', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  post_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
}, {
  tableName: 'post_likes',
  indexes: [
    { unique: true, fields: ['user_id', 'post_id'] },
  ],
});

module.exports = PostLike;
