const User = require('../models/User');
const PartnerProfile = require('../models/PartnerProfile');
const ServiceRequest = require('../models/ServiceRequest');
const ServiceCategory = require('../models/ServiceCategory');
const Complaint = require('../models/Complaint');
const AuditLog = require('../models/AuditLog');
const Review = require('../models/Review');
const Notification = require('../models/Notification');
const { BOOKING_STATUS, COMPLAINT_STATUS } = require('../constants/status');
const { ROLES, VERIFICATION_STATUS } = require('../constants/roles');
const { logAudit } = require('../utils/audit');

// @desc    Admin overview stats calculated from real database records
// @route   GET /api/v1/admin/stats
// @access  Admin
const getAdminStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments({ role: ROLES.USER });
    const totalPartners = await PartnerProfile.countDocuments({});
    const pendingVerifications = await PartnerProfile.countDocuments({ verificationStatus: VERIFICATION_STATUS.PENDING });
    const verifiedPartners = await PartnerProfile.countDocuments({ verificationStatus: VERIFICATION_STATUS.VERIFIED });

    const activeRequests = await ServiceRequest.countDocuments({
      status: {
        $in: [
          BOOKING_STATUS.REQUESTED,
          BOOKING_STATUS.SEARCHING,
          BOOKING_STATUS.ACCEPTED,
          BOOKING_STATUS.EN_ROUTE,
          BOOKING_STATUS.ARRIVED,
          BOOKING_STATUS.IN_PROGRESS,
        ],
      },
    });

    const completedBookings = await ServiceRequest.countDocuments({ status: BOOKING_STATUS.COMPLETED });
    const cancelledBookings = await ServiceRequest.countDocuments({ status: BOOKING_STATUS.CANCELLED });
    const totalBookings = await ServiceRequest.countDocuments({});

    // Financial calculations
    const completedRequests = await ServiceRequest.find({ status: BOOKING_STATUS.COMPLETED });
    const grossServiceValue = completedRequests.reduce((sum, r) => sum + (r.finalPrice?.total || 0), 0);
    const platformCommissionRate = 0.10; // 10%
    const estimatedPlatformRevenue = Math.round(grossServiceValue * platformCommissionRate);

    // Customer satisfaction
    const reviews = await Review.find({});
    const avgRating =
      reviews.length > 0
        ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10) / 10
        : 5.0;

    const pendingComplaints = await Complaint.countDocuments({
      status: { $in: [COMPLAINT_STATUS.SUBMITTED, COMPLAINT_STATUS.UNDER_REVIEW] },
    });

    return res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalPartners,
        pendingVerifications,
        verifiedPartners,
        activeRequests,
        completedBookings,
        cancelledBookings,
        totalBookings,
        grossServiceValue,
        estimatedPlatformRevenue,
        currency: 'INR',
        customerSatisfaction: avgRating,
        totalReviewsCount: reviews.length,
        pendingComplaints,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all users with search, role filter and status filter
// @route   GET /api/v1/admin/users
// @access  Admin
const getUsers = async (req, res, next) => {
  try {
    const { role, status, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (role) query.role = role;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const users = await User.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit));
    const total = await User.countDocuments(query);

    return res.status(200).json({
      success: true,
      count: users.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: users,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Suspend or reactivate user
// @route   PATCH /api/v1/admin/users/:id/status
// @access  Admin
const updateUserStatus = async (req, res, next) => {
  try {
    const { status, reason } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Protect against suspending administrator accounts
    if (user.role === ROLES.ADMIN) {
      return res.status(400).json({
        success: false,
        message: 'Cannot suspend an administrator account.',
      });
    }

    if (!['active', 'suspended'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    user.status = status;
    await user.save();

    await logAudit({
      actor: req.user.id,
      action: status === 'suspended' ? 'USER_SUSPENDED' : 'USER_REACTIVATED',
      resourceType: 'user',
      resourceId: user._id,
      metadata: { reason: reason || 'Admin action' },
      ipAddress: req.ip,
    });

    return res.status(200).json({
      success: true,
      message: `User status updated to ${status}`,
      data: user,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get partner applications for verification
// @route   GET /api/v1/admin/partners
// @access  Admin
const getPartners = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status) query.verificationStatus = status;

    const partners = await PartnerProfile.find(query)
      .populate('user', 'name email phone status')
      .populate('serviceCategories')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: partners.length,
      data: partners,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Approve or reject partner verification
// @route   PATCH /api/v1/admin/partners/:id/verify
// @access  Admin
const verifyPartner = async (req, res, next) => {
  try {
    const { status, reason } = req.body;
    const partner = await PartnerProfile.findById(req.params.id).populate('user');

    if (!partner) {
      return res.status(404).json({ success: false, message: 'Partner profile not found' });
    }

    if (!Object.values(VERIFICATION_STATUS).includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid verification status' });
    }

    partner.verificationStatus = status;
    partner.verificationDecisionHistory.push({
      status,
      reason: reason || (status === VERIFICATION_STATUS.VERIFIED ? 'Application approved by administrator' : 'Application rejected'),
      decidedBy: req.user.id,
      date: new Date(),
    });

    await partner.save();

    // Send notification to partner
    await Notification.create({
      recipient: partner.user._id,
      type: 'system',
      title: status === VERIFICATION_STATUS.VERIFIED ? 'Partner Account Approved!' : 'Verification Status Update',
      message:
        status === VERIFICATION_STATUS.VERIFIED
          ? 'Congratulations! Your partner account has been verified. You can now toggle online and receive roadside assistance requests.'
          : `Your partner account status is now '${status}'. Reason: ${reason || 'Contact support for details.'}`,
    });

    await logAudit({
      actor: req.user.id,
      action: `PARTNER_${status.toUpperCase()}`,
      resourceType: 'partner',
      resourceId: partner._id,
      metadata: { reason, businessName: partner.businessName },
      ipAddress: req.ip,
    });

    return res.status(200).json({
      success: true,
      message: `Partner status updated to ${status}`,
      data: partner,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Live booking management / intervention
// @route   GET /api/v1/admin/bookings
// @access  Admin
const getLiveBookings = async (req, res, next) => {
  try {
    const { status, limit = 50 } = req.query;
    const query = {};
    if (status) query.status = status;

    const bookings = await ServiceRequest.find(query)
      .populate('customer', 'name phone email')
      .populate('vehicle')
      .populate('serviceCategory')
      .populate({
        path: 'assignedPartner',
        populate: { path: 'user', select: 'name phone' },
      })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    return res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Resolve complaint
// @route   PATCH /api/v1/admin/complaints/:id
// @access  Admin
const updateComplaint = async (req, res, next) => {
  try {
    const { status, internalNote, resolutionDetails } = req.body;
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    if (status) complaint.status = status;
    if (resolutionDetails) complaint.resolutionDetails = resolutionDetails;
    if (internalNote) {
      complaint.internalNotes.push({
        note: internalNote,
        author: req.user.id,
        date: new Date(),
      });
    }

    if (status === COMPLAINT_STATUS.RESOLVED) {
      complaint.resolvedAt = new Date();
    }
    complaint.assignedAdmin = req.user.id;

    await complaint.save();

    // Notify user
    await Notification.create({
      recipient: complaint.submittedBy,
      type: 'complaint_update',
      title: 'Complaint Update',
      message: `Your complaint has been updated to: ${complaint.status}. ${resolutionDetails ? `Resolution: ${resolutionDetails}` : ''}`,
      bookingId: complaint.bookingId,
    });

    await logAudit({
      actor: req.user.id,
      action: 'COMPLAINT_UPDATED',
      resourceType: 'complaint',
      resourceId: complaint._id,
      metadata: { status: complaint.status },
      ipAddress: req.ip,
    });

    return res.status(200).json({
      success: true,
      message: 'Complaint updated successfully',
      data: complaint,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Operational Reports & Analytics
// @route   GET /api/v1/admin/reports
// @access  Admin
const getReports = async (req, res, next) => {
  try {
    // 1. Requests by service category
    const categoryStats = await ServiceRequest.aggregate([
      {
        $group: {
          _id: '$serviceCategorySnapshot.name',
          count: { $sum: 1 },
          totalRevenue: { $sum: '$finalPrice.total' },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // 2. Booking status distribution
    const statusStats = await ServiceRequest.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    // 3. Requests trend over recent days
    const recentRequests = await ServiceRequest.find({})
      .select('createdAt status finalPrice')
      .sort({ createdAt: -1 })
      .limit(100);

    // Group by date (YYYY-MM-DD)
    const trendMap = {};
    recentRequests.forEach((req) => {
      const dateKey = new Date(req.createdAt).toISOString().split('T')[0];
      if (!trendMap[dateKey]) {
        trendMap[dateKey] = { date: dateKey, total: 0, completed: 0, revenue: 0 };
      }
      trendMap[dateKey].total += 1;
      if (req.status === BOOKING_STATUS.COMPLETED) {
        trendMap[dateKey].completed += 1;
        trendMap[dateKey].revenue += req.finalPrice?.total || 0;
      }
    });

    const timelineData = Object.values(trendMap).sort((a, b) => a.date.localeCompare(b.date));

    // 4. Partner performance summary
    const topPartners = await PartnerProfile.find({ verificationStatus: VERIFICATION_STATUS.VERIFIED })
      .select('businessName partnerType ratingSummary')
      .sort({ 'ratingSummary.averageRating': -1 })
      .limit(5);

    return res.status(200).json({
      success: true,
      data: {
        categoryStats: categoryStats.map((c) => ({
          name: c._id || 'Standard Assistance',
          count: c.count,
          totalRevenue: c.totalRevenue,
        })),
        statusStats: statusStats.map((s) => ({
          status: s._id,
          count: s.count,
        })),
        timelineData,
        topPartners,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get system audit logs
// @route   GET /api/v1/admin/audit-logs
// @access  Admin
const getAuditLogs = async (req, res, next) => {
  try {
    const logs = await AuditLog.find({})
      .populate('actor', 'name email role')
      .sort({ createdAt: -1 })
      .limit(100);

    return res.status(200).json({
      success: true,
      count: logs.length,
      data: logs,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAdminStats,
  getUsers,
  updateUserStatus,
  getPartners,
  verifyPartner,
  getLiveBookings,
  updateComplaint,
  getReports,
  getAuditLogs,
};
