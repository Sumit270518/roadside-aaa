const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ServiceRequest = require('../models/ServiceRequest');
const PartnerProfile = require('../models/PartnerProfile');
const ChatMessage = require('../models/ChatMessage');
const { ROLES } = require('../constants/roles');
const { BOOKING_STATUS } = require('../constants/status');
const { isValidCoordinates } = require('../utils/geo');

const setupSocket = (io) => {
  // Socket authentication middleware
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.split(' ')[1] ||
        socket.handshake.query?.token;

      if (!token) {
        return next(new Error('Authentication required for WebSocket connection'));
      }

      const secret = process.env.JWT_SECRET || 'roadside_aaa_super_secure_jwt_secret_dev_key_2026';
      const decoded = jwt.verify(token, secret);

      const user = await User.findById(decoded.id);
      if (!user || user.status === 'suspended') {
        return next(new Error('User account unauthorized or suspended'));
      }

      socket.user = user;
      next();
    } catch (err) {
      next(new Error(`Socket authentication failed: ${err.message}`));
    }
  });

  io.on('connection', (socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.user.name} (${socket.user.role}) - ID: ${socket.id}`);

    // Join personal user room for direct user notifications
    socket.join(`user:${socket.user._id}`);

    // Join booking room with strict server-side authorization check
    socket.on('booking:join', async (bookingId) => {
      try {
        if (!bookingId) return;

        const booking = await ServiceRequest.findById(bookingId);
        if (!booking) {
          socket.emit('error', { message: 'Booking does not exist' });
          return;
        }

        const isCustomer = booking.customer.toString() === socket.user._id.toString();
        const isAdmin = socket.user.role === ROLES.ADMIN;
        let isAssignedPartner = false;

        if (booking.assignedPartner) {
          const partner = await PartnerProfile.findOne({ user: socket.user._id });
          if (partner && booking.assignedPartner.toString() === partner._id.toString()) {
            isAssignedPartner = true;
          }
        }

        // Available mechanics can listen to pending requests in searching state
        const isEligiblePartner =
          (socket.user.role === ROLES.MECHANIC || socket.user.role === ROLES.TOWING_PARTNER) &&
          (booking.status === BOOKING_STATUS.REQUESTED || booking.status === BOOKING_STATUS.SEARCHING);

        if (!isCustomer && !isAdmin && !isAssignedPartner && !isEligiblePartner) {
          socket.emit('error', { message: 'Unauthorized to join this booking room' });
          return;
        }

        socket.join(`booking:${bookingId}`);
        console.log(`[Socket.IO] Socket ${socket.id} joined room booking:${bookingId}`);
        socket.emit('booking:joined', { bookingId });
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    socket.on('booking:leave', (bookingId) => {
      socket.leave(`booking:${bookingId}`);
      console.log(`[Socket.IO] Socket ${socket.id} left room booking:${bookingId}`);
    });

    // Partner live location update event via Socket
    socket.on('partner:location:update', async ({ bookingId, coordinates, heading }) => {
      try {
        if (!isValidCoordinates(coordinates)) return;

        const booking = await ServiceRequest.findById(bookingId);
        if (!booking) return;

        // Verify that caller is the assigned partner
        const partner = await PartnerProfile.findOne({ user: socket.user._id });
        if (!partner || booking.assignedPartner.toString() !== partner._id.toString()) {
          return;
        }

        // Persist location
        booking.tracking.currentLocation = {
          type: 'Point',
          coordinates,
        };
        booking.tracking.lastUpdatedAt = new Date();
        if (heading !== undefined) booking.tracking.heading = heading;
        await booking.save();

        // Broadcast to booking room
        io.to(`booking:${bookingId}`).emit('partner:location:updated', {
          bookingId,
          coordinates,
          heading: booking.tracking.heading,
          lastUpdatedAt: booking.tracking.lastUpdatedAt,
        });
      } catch (err) {
        console.error('[Socket.IO] Location update error:', err.message);
      }
    });

    // Real-time chat message via Socket
    socket.on('chat:send', async ({ bookingId, message }) => {
      try {
        if (!bookingId || !message || !message.trim()) return;

        const booking = await ServiceRequest.findById(bookingId);
        if (!booking) return;

        const isCustomer = booking.customer.toString() === socket.user._id.toString();
        const isAdmin = socket.user.role === ROLES.ADMIN;
        let isPartner = false;

        if (booking.assignedPartner) {
          const partner = await PartnerProfile.findOne({ user: socket.user._id });
          if (partner && booking.assignedPartner.toString() === partner._id.toString()) {
            isPartner = true;
          }
        }

        if (!isCustomer && !isAdmin && !isPartner) {
          socket.emit('error', { message: 'Unauthorized to send message in this booking' });
          return;
        }

        const newMsg = await ChatMessage.create({
          bookingId,
          sender: socket.user._id,
          senderRole: socket.user.role,
          senderName: socket.user.name,
          message: message.trim(),
        });

        const populated = await ChatMessage.findById(newMsg._id).populate('sender', 'name role');
        io.to(`booking:${bookingId}`).emit('chat:new-message', populated);
      } catch (err) {
        console.error('[Socket.IO] Chat message error:', err.message);
      }
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
  });
};

module.exports = { setupSocket };
