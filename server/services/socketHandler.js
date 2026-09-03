const jwt = require('jsonwebtoken');
const { User, Message } = require('../models');

const onlineUsers = new Map(); // userId -> socketId

const setupSocket = (io) => {
  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('Authentication required'));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findByPk(decoded.id);
      if (!user) return next(new Error('User not found'));

      socket.user = user;
      next();
    } catch (error) {
      console.error('Socket auth error:', error.message);
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', async (socket) => {
    const userId = socket.user.id;
    console.log(`User connected: ${socket.user.username} (${userId})`);

    // Track online status
    onlineUsers.set(userId, socket.id);
    await User.update({ is_online: true }, { where: { id: userId } });
    io.emit('user:online', { userId, online: true });

    // Join personal room for DMs
    socket.join(userId);

    // Send message
    socket.on('message:send', async (data) => {
      try {
        const { receiverId, content } = data;
        if (!receiverId || !content) return;

        const message = await Message.create({
          sender_id: userId,
          receiver_id: receiverId,
          content,
        });

        const messageData = {
          ...message.toJSON(),
          sender: {
            id: socket.user.id,
            username: socket.user.username,
            avatar: socket.user.avatar,
          },
        };

        // Send to receiver if online
        io.to(receiverId).emit('message:receive', messageData);
        // Confirm to sender
        socket.emit('message:sent', messageData);
      } catch (error) {
        console.error('Socket message error:', error);
        socket.emit('message:error', { error: 'Failed to send message' });
      }
    });

    // Typing indicators — use senderId (the person typing) so receiver can identify who
    socket.on('typing:start', ({ receiverId }) => {
      if (receiverId) {
        io.to(receiverId).emit('typing:start', { userId });
      }
    });

    socket.on('typing:stop', ({ receiverId }) => {
      if (receiverId) {
        io.to(receiverId).emit('typing:stop', { userId });
      }
    });

    // Mark messages as read
    socket.on('message:read', async ({ senderId }) => {
      if (!senderId) return;
      await Message.update(
        { is_read: true },
        { where: { sender_id: senderId, receiver_id: userId, is_read: false } }
      );
      io.to(senderId).emit('message:read', { readBy: userId });
    });

    // Disconnect
    socket.on('disconnect', async () => {
      onlineUsers.delete(userId);
      await User.update(
        { is_online: false, last_active: new Date() },
        { where: { id: userId } }
      );
      io.emit('user:online', { userId, online: false });
      console.log(`User disconnected: ${socket.user.username}`);
    });
  });
};

module.exports = { setupSocket, onlineUsers };
