const express = require('express');
const { body } = require('express-validator');
const { Message, User } = require('../models');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');

const router = express.Router();

// GET /api/messages/conversations - List all conversations
router.get('/conversations', authenticate, async (req, res) => {
  try {
    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { sender_id: req.user.id },
          { receiver_id: req.user.id },
        ],
      },
      order: [['created_at', 'DESC']],
    });

    // Build conversation list with latest message
    const conversationMap = new Map();
    for (const msg of messages) {
      const partnerId = msg.sender_id === req.user.id ? msg.receiver_id : msg.sender_id;
      if (!conversationMap.has(partnerId)) {
        conversationMap.set(partnerId, msg);
      }
    }

    const partnerIds = [...conversationMap.keys()];

    if (partnerIds.length === 0) {
      return res.json({ conversations: [] });
    }

    const partners = await User.findAll({
      where: { id: { [Op.in]: partnerIds } },
      attributes: ['id', 'username', 'full_name', 'avatar', 'is_online'],
    });

    const partnerMap = new Map(partners.map(p => [p.id, p]));

    // Count unread per conversation
    const unreadCounts = await Message.findAll({
      where: { receiver_id: req.user.id, is_read: false },
      attributes: ['sender_id', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      group: ['sender_id'],
      raw: true,
    });
    const unreadMap = new Map(unreadCounts.map(u => [u.sender_id, parseInt(u.count)]));

    const conversations = partnerIds.map(pid => ({
      partner: partnerMap.get(pid) || null,
      lastMessage: conversationMap.get(pid),
      unreadCount: unreadMap.get(pid) || 0,
    })).filter(c => c.partner !== null);

    res.json({ conversations });
  } catch (error) {
    console.error('Conversations error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/messages - Send a message via HTTP (fallback for socket)
router.post('/', authenticate, [
  body('receiver_id').isUUID(),
  body('content').trim().notEmpty(),
  validate,
], async (req, res) => {
  try {
    const { receiver_id, content } = req.body;

    const receiver = await User.findByPk(receiver_id);
    if (!receiver) return res.status(404).json({ error: 'User not found' });

    const message = await Message.create({
      sender_id: req.user.id,
      receiver_id,
      content,
    });

    res.status(201).json({ message });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/messages/:userId - Get messages with a user
router.get('/:userId', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;

    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { sender_id: req.user.id, receiver_id: userId },
          { sender_id: userId, receiver_id: req.user.id },
        ],
      },
      order: [['created_at', 'ASC']],
      limit,
      offset: (page - 1) * limit,
    });

    // Mark as read
    await Message.update(
      { is_read: true },
      { where: { sender_id: userId, receiver_id: req.user.id, is_read: false } }
    );

    res.json({ messages });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
