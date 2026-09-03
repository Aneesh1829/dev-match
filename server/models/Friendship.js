const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Friendship = sequelize.define('Friendship', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  requester_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  recipient_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'accepted', 'rejected'),
    defaultValue: 'pending',
  },
}, {
  tableName: 'friendships',
  indexes: [
    { unique: true, fields: ['requester_id', 'recipient_id'] },
  ],
});

module.exports = Friendship;
