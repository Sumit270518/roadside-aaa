const Complaint = require('../models/Complaint');
const ServiceRequest = require('../models/ServiceRequest');
const { ROLES } = require('../constants/roles');
const { COMPLAINT_STATUS } = require('../constants/status');
const { logAudit } = require('../utils/audit');

// @desc    Submit a complaint linked to a booking
// @route   POST /api/v1/complaints
// @access  Private
const createComplaint = async (req, res, next) => {
  try {
    const { bookingId, category, description } = req.body;

    const booking = await ServiceRequest.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Referenced booking not found.' });
    }

    // Verify submitter was involved in booking
    const isCustomer = booking.customer.toString() === req.user.id;
    if (!isCustomer && req.user.role !== ROLES.ADMIN) {
      return res.status(403).json({
        success: false,
        message: 'You can only submit complaints for services you booked.',
      });
    }

    const complaint = await Complaint.create({
      bookingId: booking._id,
      submittedBy: req.user.id,
      category: category || 'other',
      description: description.trim(),
      status: COMPLAINT_STATUS.SUBMITTED,
    });

    await logAudit({
      actor: req.user.id,
      action: 'COMPLAINT_SUBMITTED',
      resourceType: 'complaint',
      resourceId: complaint._id,
      metadata: { bookingReference: booking.bookingReference },
      ipAddress: req.ip,
    });

    return res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully. An administrator will review your issue.',
      data: complaint,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get complaints list
// @route   GET /api/v1/complaints
// @access  Private
const getComplaints = async (req, res, next) => {
  try {
    const filter = req.user.role === ROLES.ADMIN ? {} : { submittedBy: req.user.id };

    const complaints = await Complaint.find(filter)
      .populate('submittedBy', 'name email phone')
      .populate('bookingId')
      .populate('assignedAdmin', 'name')
      .sort({ createdAt: -1 });

    // If not admin, sanitize internalNotes
    const sanitized = complaints.map((c) => {
      const obj = c.toObject();
      if (req.user.role !== ROLES.ADMIN) {
        delete obj.internalNotes;
      }
      return obj;
    });

    return res.status(200).json({
      success: true,
      count: sanitized.length,
      data: sanitized,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get complaint details by ID
// @route   GET /api/v1/complaints/:id
// @access  Private
const getComplaintById = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('submittedBy', 'name email phone')
      .populate('bookingId')
      .populate('assignedAdmin', 'name');

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    if (complaint.submittedBy._id.toString() !== req.user.id && req.user.role !== ROLES.ADMIN) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const obj = complaint.toObject();
    if (req.user.role !== ROLES.ADMIN) {
      delete obj.internalNotes;
    }

    return res.status(200).json({
      success: true,
      data: obj,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createComplaint,
  getComplaints,
  getComplaintById,
};
