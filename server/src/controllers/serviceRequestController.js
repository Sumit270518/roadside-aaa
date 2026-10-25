const ServiceRequest = require('../models/ServiceRequest');
const Vehicle = require('../models/Vehicle');
const ServiceCategory = require('../models/ServiceCategory');
const PartnerProfile = require('../models/PartnerProfile');
const Notification = require('../models/Notification');
const PaymentRecord = require('../models/PaymentRecord');
const { BOOKING_STATUS, PAYMENT_STATUS, PAYMENT_METHODS } = require('../constants/status');
const { ROLES, VERIFICATION_STATUS } = require('../constants/roles');
const { isValidCoordinates, calculateHaversineDistance } = require('../utils/geo');
const { calculateEstimate, calculateFinalPrice } = require('../services/pricingService');
const { canTransition } = require('../services/stateTransitionService');
const { logAudit } = require('../utils/audit');
const { sendRequestCreatedEmail, sendJobAcceptedEmail } = require('../services/emailService');

// Helper to generate unique readable booking references
const generateBookingReference = () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `AAA-${dateStr}-${randomStr}`;
};

// @desc    Create a new assistance request
// @route   POST /api/v1/requests
// @access  Private (User)
const createRequest = async (req, res, next) => {
  try {
    const {
      vehicleId,
      serviceCategoryId,
      breakdownDescription,
      coordinates, // [longitude, latitude]
      address,
      landmark,
      targetPartnerId,
    } = req.body;

    // 1. Verify vehicle ownership
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle || vehicle.owner.toString() !== req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Invalid vehicle selected or you do not have ownership of this vehicle.',
      });
    }

    // 2. Verify service category
    const category = await ServiceCategory.findById(serviceCategoryId);
    if (!category || !category.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or inactive service category selected.',
      });
    }

    // 3. Validate coordinates
    if (!isValidCoordinates(coordinates)) {
      return res.status(400).json({
        success: false,
        message: 'Valid location coordinates [longitude, latitude] are required.',
      });
    }

    // 4. Calculate estimated price
    let estimatedDistance = 5; // default 5km estimate if no target partner
    let partnerBasePrice = category.basePrice;
    let partnerKmRate = category.perKmRate;

    if (targetPartnerId) {
      const targetPartner = await PartnerProfile.findById(targetPartnerId);
      if (targetPartner && targetPartner.location?.coordinates) {
        estimatedDistance = calculateHaversineDistance(coordinates, targetPartner.location.coordinates);
        if (targetPartner.pricing?.baseFee) partnerBasePrice = targetPartner.pricing.baseFee;
        if (targetPartner.pricing?.perKmRate) partnerKmRate = targetPartner.pricing.perKmRate;
      }
    }

    const estimate = calculateEstimate({
      basePrice: partnerBasePrice,
      perKmRate: partnerKmRate,
      distanceKm: estimatedDistance,
    });

    const bookingReference = generateBookingReference();

    // 5. Create ServiceRequest
    const request = await ServiceRequest.create({
      bookingReference,
      customer: req.user.id,
      vehicle: vehicle._id,
      vehicleSnapshot: {
        registrationNumber: vehicle.registrationNumber,
        make: vehicle.make,
        model: vehicle.model,
        vehicleType: vehicle.vehicleType,
        fuelType: vehicle.fuelType,
      },
      serviceCategory: category._id,
      serviceCategorySnapshot: {
        name: category.name,
        slug: category.slug,
      },
      breakdownDescription: breakdownDescription.trim(),
      location: {
        type: 'Point',
        coordinates,
      },
      address: address.trim(),
      landmark: landmark ? landmark.trim() : '',
      status: BOOKING_STATUS.SEARCHING,
      estimatedPrice: estimate,
      tracking: {
        currentLocation: {
          type: 'Point',
          coordinates,
        },
        lastUpdatedAt: new Date(),
      },
      statusHistory: [
        {
          status: BOOKING_STATUS.REQUESTED,
          timestamp: new Date(),
          note: 'Emergency service request created by customer.',
          updatedBy: req.user.id,
        },
        {
          status: BOOKING_STATUS.SEARCHING,
          timestamp: new Date(),
          note: 'Searching for nearby verified partners.',
          updatedBy: req.user.id,
        },
      ],
    });

    // Create confirmation notification
    await Notification.create({
      recipient: req.user.id,
      type: 'booking_status',
      title: 'Roadside Assistance Requested',
      message: `Your request (${bookingReference}) for ${category.name} has been dispatched. Searching for nearby mechanics.`,
      bookingId: request._id,
    });

    // Realtime notification broadcast through Socket.IO if available
    const io = req.app.get('io');
    if (io) {
      io.emit('partner:new-request', {
        bookingId: request._id,
        bookingReference: request.bookingReference,
        category: category.name,
        address: request.address,
        coordinates: request.location.coordinates,
        estimatedPayout: estimate.estimatedTotal,
      });
    }

    // Send Emergency Dispatch Confirmation Email to Customer (non-blocking)
    sendRequestCreatedEmail({
      to: req.user.email,
      name: req.user.name,
      bookingReference: request.bookingReference,
      serviceCategory: category.name,
      vehicle,
      address: request.address,
      landmark: request.landmark,
      estimatedTotal: estimate.estimatedTotal,
    }).catch((emailErr) => console.warn(`[Email Service] Request email failed: ${emailErr.message}`));

    return res.status(201).json({
      success: true,
      message: 'Roadside assistance requested successfully.',
      data: request,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get service requests (filtered by user role)
// @route   GET /api/v1/requests
// @access  Private
const getRequests = async (req, res, next) => {
  try {
    const { status, limit = 20, page = 1 } = req.query;
    const filter = {};

    if (req.user.role === ROLES.USER) {
      filter.customer = req.user.id;
    } else if (req.user.role === ROLES.MECHANIC || req.user.role === ROLES.TOWING_PARTNER) {
      const partnerProfile = await PartnerProfile.findOne({ user: req.user.id });
      if (!partnerProfile) {
        return res.status(200).json({ success: true, count: 0, data: [] });
      }

      if (status === 'incoming') {
        // Incoming requests within search pool
        filter.status = { $in: [BOOKING_STATUS.REQUESTED, BOOKING_STATUS.SEARCHING] };
        filter.assignedPartner = null;
      } else {
        filter.assignedPartner = partnerProfile._id;
      }
    }

    if (status && status !== 'incoming') {
      filter.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const requests = await ServiceRequest.find(filter)
      .populate('customer', 'name phone email')
      .populate('vehicle')
      .populate('serviceCategory')
      .populate({
        path: 'assignedPartner',
        populate: { path: 'user', select: 'name phone email' },
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await ServiceRequest.countDocuments(filter);

    return res.status(200).json({
      success: true,
      count: requests.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: requests,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single service request details
// @route   GET /api/v1/requests/:id
// @access  Private
const getRequestById = async (req, res, next) => {
  try {
    const request = await ServiceRequest.findById(req.params.id)
      .populate('customer', 'name phone email')
      .populate('vehicle')
      .populate('serviceCategory')
      .populate({
        path: 'assignedPartner',
        populate: { path: 'user', select: 'name phone email' },
      });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Service request not found',
      });
    }

    // Role-based ownership check
    const isCustomer = request.customer._id.toString() === req.user.id;
    const isPartner =
      request.assignedPartner &&
      request.assignedPartner.user &&
      request.assignedPartner.user._id.toString() === req.user.id;
    const isAdmin = req.user.role === ROLES.ADMIN;

    // If searching, an available partner can also view the details to evaluate accepting
    let isEligibleCandidate = false;
    if (
      (req.user.role === ROLES.MECHANIC || req.user.role === ROLES.TOWING_PARTNER) &&
      (request.status === BOOKING_STATUS.REQUESTED || request.status === BOOKING_STATUS.SEARCHING)
    ) {
      isEligibleCandidate = true;
    }

    if (!isCustomer && !isPartner && !isAdmin && !isEligibleCandidate) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. You do not have permission to view this service request.',
      });
    }

    return res.status(200).json({
      success: true,
      data: request,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Accept a service request (Atomic operation)
// @route   POST /api/v1/requests/:id/accept
// @access  Private (Partner)
const acceptRequest = async (req, res, next) => {
  try {
    const partner = await PartnerProfile.findOne({ user: req.user.id });

    if (!partner) {
      return res.status(403).json({
        success: false,
        message: 'You must have a partner profile to accept service requests.',
      });
    }

    if (partner.verificationStatus !== VERIFICATION_STATUS.VERIFIED) {
      return res.status(403).json({
        success: false,
        message: `Your account is ${partner.verificationStatus}. Only verified partners can accept requests.`,
      });
    }

    if (!partner.isAvailable) {
      return res.status(400).json({
        success: false,
        message: 'Please toggle your availability to Online before accepting jobs.',
      });
    }

    // Atomic assignment using findOneAndUpdate to guarantee concurrency safety
    const updatedRequest = await ServiceRequest.findOneAndUpdate(
      {
        _id: req.params.id,
        status: { $in: [BOOKING_STATUS.REQUESTED, BOOKING_STATUS.SEARCHING] },
        assignedPartner: null,
      },
      {
        $set: {
          assignedPartner: partner._id,
          assignedPartnerUser: req.user.id,
          status: BOOKING_STATUS.ACCEPTED,
          acceptedAt: new Date(),
          'tracking.currentLocation': partner.location,
          'tracking.lastUpdatedAt': new Date(),
        },
        $push: {
          statusHistory: {
            status: BOOKING_STATUS.ACCEPTED,
            timestamp: new Date(),
            note: `Request accepted by partner ${partner.businessName}.`,
            updatedBy: req.user.id,
          },
        },
      },
      { new: true }
    )
      .populate('customer', 'name phone email')
      .populate('vehicle')
      .populate('serviceCategory');

    if (!updatedRequest) {
      return res.status(409).json({
        success: false,
        message: 'This request is no longer available. It may have already been accepted or cancelled.',
      });
    }

    // Notify customer
    await Notification.create({
      recipient: updatedRequest.customer._id,
      type: 'partner_assigned',
      title: 'Mechanic Assigned!',
      message: `${partner.businessName} has accepted your request and will be en route shortly.`,
      bookingId: updatedRequest._id,
    });

    // Notify partner
    await Notification.create({
      recipient: req.user.id,
      type: 'booking_status',
      title: 'Job Assigned Successfully',
      message: `You accepted job ${updatedRequest.bookingReference}. Please proceed to update your en-route status.`,
      bookingId: updatedRequest._id,
    });

    // Emit realtime socket event
    const io = req.app.get('io');
    if (io) {
      io.to(`booking:${updatedRequest._id}`).emit('booking:assigned', {
        bookingId: updatedRequest._id,
        status: BOOKING_STATUS.ACCEPTED,
        partner: {
          businessName: partner.businessName,
          phone: req.user.phone,
          location: partner.location,
        },
      });
      io.emit('booking:updated', {
        bookingId: updatedRequest._id,
        status: BOOKING_STATUS.ACCEPTED,
      });
    }

    await logAudit({
      actor: req.user.id,
      action: 'REQUEST_ACCEPTED',
      resourceType: 'booking',
      resourceId: updatedRequest._id,
      metadata: { partner: partner.businessName, bookingReference: updatedRequest.bookingReference },
      ipAddress: req.ip,
    });

    // Send Job Assignment Notification Emails to Customer and Partner (non-blocking)
    sendJobAcceptedEmail({
      customerEmail: updatedRequest.customer.email,
      customerName: updatedRequest.customer.name,
      partnerEmail: req.user.email,
      partnerName: req.user.name,
      partnerPhone: req.user.phone,
      partnerBusiness: partner.businessName,
      bookingReference: updatedRequest.bookingReference,
      serviceCategory: updatedRequest.serviceCategory.name,
      vehicle: updatedRequest.vehicle,
      address: updatedRequest.address,
      landmark: updatedRequest.landmark,
    }).catch((emailErr) => console.warn(`[Email Service] Job accepted email failed: ${emailErr.message}`));

    return res.status(200).json({
      success: true,
      message: 'Request accepted successfully. You are assigned to this job.',
      data: updatedRequest,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update booking progress status (en_route, arrived, in_progress)
// @route   POST /api/v1/requests/:id/status
// @access  Private
const updateStatus = async (req, res, next) => {
  try {
    const { status: newStatus, note } = req.body;
    const request = await ServiceRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Service request not found' });
    }

    // Validate transition
    const transitionCheck = canTransition(request.status, newStatus, req.user.role);
    if (!transitionCheck.allowed) {
      return res.status(400).json({
        success: false,
        message: transitionCheck.reason,
      });
    }

    // Authorization check
    if (req.user.role !== ROLES.ADMIN) {
      const partner = await PartnerProfile.findOne({ user: req.user.id });
      if (!partner || request.assignedPartner.toString() !== partner._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Only the assigned partner can update the progress of this job.',
        });
      }
    }

    request.status = newStatus;
    if (newStatus === BOOKING_STATUS.ARRIVED) request.arrivedAt = new Date();

    request.statusHistory.push({
      status: newStatus,
      timestamp: new Date(),
      note: note || `Status updated to ${newStatus}`,
      updatedBy: req.user.id,
    });

    await request.save();

    // Create customer notification
    const readableStatus = newStatus.replace('_', ' ').toUpperCase();
    await Notification.create({
      recipient: request.customer,
      type: 'booking_status',
      title: `Service Update: ${readableStatus}`,
      message: `Your service status has been updated to: ${readableStatus}.`,
      bookingId: request._id,
    });

    // Realtime socket event
    const io = req.app.get('io');
    if (io) {
      io.to(`booking:${request._id}`).emit('booking:updated', {
        bookingId: request._id,
        status: newStatus,
        statusHistory: request.statusHistory,
      });
    }

    return res.status(200).json({
      success: true,
      message: `Job status updated to ${newStatus}`,
      data: request,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update partner live location tracking
// @route   POST /api/v1/requests/:id/location
// @access  Private (Partner)
const updateLocation = async (req, res, next) => {
  try {
    const { coordinates, heading } = req.body;

    if (!isValidCoordinates(coordinates)) {
      return res.status(400).json({
        success: false,
        message: 'Valid coordinates [longitude, latitude] required',
      });
    }

    const request = await ServiceRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    // Only active jobs allow location updates
    const activeStates = [BOOKING_STATUS.ACCEPTED, BOOKING_STATUS.EN_ROUTE, BOOKING_STATUS.ARRIVED, BOOKING_STATUS.IN_PROGRESS];
    if (!activeStates.includes(request.status)) {
      return res.status(400).json({
        success: false,
        message: 'Location tracking is only active during en-route or in-progress jobs.',
      });
    }

    request.tracking.currentLocation = {
      type: 'Point',
      coordinates,
    };
    request.tracking.lastUpdatedAt = new Date();
    if (heading !== undefined) request.tracking.heading = Number(heading);

    await request.save();

    // Emit live location update to booking room
    const io = req.app.get('io');
    if (io) {
      io.to(`booking:${request._id}`).emit('partner:location:updated', {
        bookingId: request._id,
        coordinates,
        heading: request.tracking.heading,
        lastUpdatedAt: request.tracking.lastUpdatedAt,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Location updated',
      data: request.tracking,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Complete job with itemized final pricing
// @route   POST /api/v1/requests/:id/complete
// @access  Private (Partner or Admin)
const completeRequest = async (req, res, next) => {
  try {
    const { additionalCharges, paymentMethod = PAYMENT_METHODS.CASH } = req.body;
    const request = await ServiceRequest.findById(req.params.id)
      .populate('serviceCategory')
      .populate('assignedPartner');

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    // State transition check
    const transitionCheck = canTransition(request.status, BOOKING_STATUS.COMPLETED, req.user.role);
    if (!transitionCheck.allowed) {
      return res.status(400).json({ success: false, message: transitionCheck.reason });
    }

    // Calculate final price server-side
    const partner = request.assignedPartner;
    const basePrice = partner?.pricing?.baseFee || request.estimatedPrice.base;
    const distanceRate = partner?.pricing?.perKmRate || request.estimatedPrice.distanceRate;
    const distanceKm = request.estimatedPrice.estimatedDistanceKm || 5;

    const finalCalculation = calculateFinalPrice({
      basePrice,
      distanceRate,
      distanceKm,
      additionalCharges,
    });

    request.status = BOOKING_STATUS.COMPLETED;
    request.completedAt = new Date();
    request.finalPrice = {
      base: finalCalculation.base,
      distanceRate: finalCalculation.distanceRate,
      additionalCharges: finalCalculation.additionalCharges,
      taxes: finalCalculation.taxes,
      total: finalCalculation.total,
      currency: 'INR',
      paymentStatus: PAYMENT_STATUS.PENDING,
      paymentMethod,
    };

    request.statusHistory.push({
      status: BOOKING_STATUS.COMPLETED,
      timestamp: new Date(),
      note: `Job completed. Total invoice amount: ₹${finalCalculation.total}`,
      updatedBy: req.user.id,
    });

    await request.save();

    // Create payment record
    await PaymentRecord.create({
      booking: request._id,
      user: request.customer,
      amount: finalCalculation.total,
      currency: 'INR',
      method: paymentMethod,
      status: PAYMENT_STATUS.PENDING,
      notes: `Invoice generated upon service completion for ${request.bookingReference}`,
    });

    // Notify customer
    await Notification.create({
      recipient: request.customer,
      type: 'service_completed',
      title: 'Service Completed!',
      message: `Your roadside assistance is complete. Total amount is ₹${finalCalculation.total}. Please review and rate your service.`,
      bookingId: request._id,
    });

    // Socket notification
    const io = req.app.get('io');
    if (io) {
      io.to(`booking:${request._id}`).emit('booking:updated', {
        bookingId: request._id,
        status: BOOKING_STATUS.COMPLETED,
        finalPrice: request.finalPrice,
      });
    }

    await logAudit({
      actor: req.user.id,
      action: 'REQUEST_COMPLETED',
      resourceType: 'booking',
      resourceId: request._id,
      metadata: { total: finalCalculation.total },
      ipAddress: req.ip,
    });

    return res.status(200).json({
      success: true,
      message: 'Service completed successfully. Final invoice generated.',
      data: request,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Cancel request
// @route   POST /api/v1/requests/:id/cancel
// @access  Private
const cancelRequest = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const request = await ServiceRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    // Cannot cancel already completed or cancelled requests
    if (request.status === BOOKING_STATUS.COMPLETED || request.status === BOOKING_STATUS.CANCELLED) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel a service that is already ${request.status}.`,
      });
    }

    // Role check: Customer can cancel before work started, or admin, or assigned partner with valid reason
    const isCustomer = request.customer.toString() === req.user.id;
    const isAdmin = req.user.role === ROLES.ADMIN;
    let isPartner = false;
    if (request.assignedPartner) {
      const partner = await PartnerProfile.findOne({ user: req.user.id });
      if (partner && request.assignedPartner.toString() === partner._id.toString()) {
        isPartner = true;
      }
    }

    if (!isCustomer && !isAdmin && !isPartner) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. You do not have permission to cancel this request.',
      });
    }

    request.status = BOOKING_STATUS.CANCELLED;
    request.cancellation = {
      reason: reason || 'Cancelled by user',
      cancelledBy: req.user.id,
      timestamp: new Date(),
    };

    request.statusHistory.push({
      status: BOOKING_STATUS.CANCELLED,
      timestamp: new Date(),
      note: `Cancelled: ${reason || 'No specific reason given.'}`,
      updatedBy: req.user.id,
    });

    await request.save();

    // Socket notification
    const io = req.app.get('io');
    if (io) {
      io.to(`booking:${request._id}`).emit('booking:cancelled', {
        bookingId: request._id,
        reason: request.cancellation.reason,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Service request cancelled successfully.',
      data: request,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get detailed itemized invoice for booking
// @route   GET /api/v1/requests/:id/invoice
// @access  Private
const getInvoice = async (req, res, next) => {
  try {
    const request = await ServiceRequest.findById(req.params.id)
      .populate('customer', 'name phone email')
      .populate('vehicle')
      .populate('serviceCategory')
      .populate({
        path: 'assignedPartner',
        populate: { path: 'user', select: 'name phone email' },
      });

    if (!request) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Ownership check
    const isCustomer = request.customer._id.toString() === req.user.id;
    const isPartner =
      request.assignedPartner &&
      request.assignedPartner.user &&
      request.assignedPartner.user._id.toString() === req.user.id;
    const isAdmin = req.user.role === ROLES.ADMIN;

    if (!isCustomer && !isPartner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. You are not authorized to view this invoice.',
      });
    }

    const invoiceData = {
      bookingReference: request.bookingReference,
      serviceDate: request.completedAt || request.createdAt,
      customer: {
        name: request.customer.name,
        phone: request.customer.phone,
        email: request.customer.email,
      },
      vehicle: {
        registrationNumber: request.vehicleSnapshot?.registrationNumber || request.vehicle?.registrationNumber,
        make: request.vehicleSnapshot?.make || request.vehicle?.make,
        model: request.vehicleSnapshot?.model || request.vehicle?.model,
      },
      service: {
        name: request.serviceCategorySnapshot?.name || request.serviceCategory?.name,
        address: request.address,
      },
      partner: request.assignedPartner
        ? {
            businessName: request.assignedPartner.businessName,
            phone: request.assignedPartner.user?.phone,
            address: request.assignedPartner.address,
          }
        : null,
      pricing: request.status === BOOKING_STATUS.COMPLETED ? request.finalPrice : request.estimatedPrice,
      isFinal: request.status === BOOKING_STATUS.COMPLETED,
      currency: 'INR',
    };

    return res.status(200).json({
      success: true,
      data: invoiceData,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createRequest,
  getRequests,
  getRequestById,
  acceptRequest,
  updateStatus,
  updateLocation,
  completeRequest,
  cancelRequest,
  getInvoice,
};
