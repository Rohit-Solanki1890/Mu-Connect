const Room = require('../models/Room');
const Notification = require('../models/Notification');

module.exports = function socketHandler(io) {
  io.on('connection', (socket) => {
    // Join room channel
    socket.on('room:join', async ({ roomId, userId }) => {
      socket.join(`room:${roomId}`);
      io.to(`room:${roomId}`).emit('room:user-joined', { userId });
      try {
        const room = await Room.findById(roomId);
        if (room) {
          room.updateMemberStatus(userId, true);
          await room.save();
        }
      } catch {}
    });

    // Leave room channel
    socket.on('room:leave', async ({ roomId, userId }) => {
      socket.leave(`room:${roomId}`);
      io.to(`room:${roomId}`).emit('room:user-left', { userId });
      try {
        const room = await Room.findById(roomId);
        if (room) {
          room.updateMemberStatus(userId, false);
          await room.save();
        }
      } catch {}
    });

    // Text message
    socket.on('room:message', ({ roomId, message }) => {
      io.to(`room:${roomId}`).emit('room:message', message);
    });

    // Game events
    socket.on('game:event', ({ roomId, event }) => {
      io.to(`room:${roomId}`).emit('game:event', event);
    });

    // Notifications
    socket.on('notify', async ({ recipientId, payload }) => {
      io.to(`user:${recipientId}`).emit('notify', payload);
      try {
        await Notification.createNotification(
          recipientId,
          payload.senderId,
          payload.type,
          payload.title,
          payload.message,
          payload.data || {}
        );
      } catch {}
    });

    // Voice/video signal relay (WebRTC signaling)
    socket.on('webrtc:signal', ({ roomId, signal }) => {
      io.to(`room:${roomId}`).emit('webrtc:signal', signal);
    });

    // User personal room for direct notifications
    socket.on('user:join', ({ userId }) => {
      socket.join(`user:${userId}`);
    });
  });
};



