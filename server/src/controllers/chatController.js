const ChatMessage = require('../models/ChatMessage');
const ServiceRequest = require('../models/ServiceRequest');
const PartnerProfile = require('../models/PartnerProfile');
const { ROLES } = require('../constants/roles');

// Helper to check user participation in booking
const isAuthorizedParticipant = async (bookingId, userId, userRole) => {
  if (userRole === ROLES.ADMIN) return true;

  const booking = await ServiceRequest.findById(bookingId);
  if (!booking) return false;

  if (booking.customer.toString() === userId.toString()) return true;

  if (booking.assignedPartner) {
    const partner = await PartnerProfile.findOne({ user: userId });
    if (partner && booking.assignedPartner.toString() === partner._id.toString()) {
      return true;
    }
  }

  return false;
};

// @desc    Get messages for a booking
// @route   GET /api/v1/requests/:id/messages
// @access  Private
const getMessages = async (req, res, next) => {
  try {
    const authorized = await isAuthorizedParticipant(req.params.id, req.user.id, req.user.role);
    if (!authorized) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. You are not a participant in this booking.',
      });
    }

    const messages = await ChatMessage.find({ bookingId: req.params.id })
      .populate('sender', 'name role')
      .sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      count: messages.length,
      data: messages,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Send chat message
// @route   POST /api/v1/requests/:id/messages
// @access  Private
const sendMessage = async (req, res, next) => {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message content cannot be empty' });
    }

    const authorized = await isAuthorizedParticipant(req.params.id, req.user.id, req.user.role);
    if (!authorized) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. You are not an authorized participant in this booking.',
      });
    }

    const newMessage = await ChatMessage.create({
      bookingId: req.params.id,
      sender: req.user.id,
      senderRole: req.user.role,
      senderName: req.user.name,
      message: message.trim(),
    });

    const populated = await ChatMessage.findById(newMessage._id).populate('sender', 'name role');

    // Emit to booking socket room
    const io = req.app.get('io');
    if (io) {
      io.to(`booking:${req.params.id}`).emit('chat:new-message', populated);
    }

    return res.status(201).json({
      success: true,
      data: populated,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getMessages,
  sendMessage,
};
