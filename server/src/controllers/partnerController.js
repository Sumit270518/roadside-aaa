const PartnerProfile = require('../models/PartnerProfile');
const User = require('../models/User');
const ServiceRequest = require('../models/ServiceRequest');
const ServiceCategory = require('../models/ServiceCategory');
const { ROLES, VERIFICATION_STATUS, PARTNER_TYPES } = require('../constants/roles');
const { BOOKING_STATUS } = require('../constants/status');
const { calculateHaversineDistance, isValidCoordinates } = require('../utils/geo');
const { calculateEstimate } = require('../services/pricingService');
const { logAudit } = require('../utils/audit');

// @desc    Register as a service partner (Onboarding)
// @route   POST /api/v1/partners/register
// @access  Public / Private
const registerPartner = async (req, res, next) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      partnerType,
      businessName,
      description,
      experienceYears,
      serviceCategories,
      pricing,
      address,
      coordinates, // [longitude, latitude]
      serviceRadiusKm,
      operatingHours,
      documents,
    } = req.body;

    let user;

    if (req.user) {
      user = await User.findById(req.user.id);
      // Upgrade role to mechanic or towing_partner
      user.role = partnerType === PARTNER_TYPES.TOWING ? ROLES.TOWING_PARTNER : ROLES.MECHANIC;
      await user.save();
    } else {
      // Check existing email
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'An account with this email already exists. Please log in first.',
        });
      }

      user = await User.create({
        name,
        email: email.toLowerCase(),
        phone,
        password,
        role: partnerType === PARTNER_TYPES.TOWING ? ROLES.TOWING_PARTNER : ROLES.MECHANIC,
      });
    }

    const existingProfile = await PartnerProfile.findOne({ user: user._id });
    if (existingProfile) {
      return res.status(400).json({
        success: false,
        message: 'Partner profile already exists for this account.',
      });
    }

    // Default coordinates: New Delhi [77.2090, 28.6139] if not provided
    const validCoords = isValidCoordinates(coordinates) ? coordinates : [77.2090, 28.6139];

    const partnerProfile = await PartnerProfile.create({
      user: user._id,
      partnerType: partnerType || PARTNER_TYPES.MECHANIC,
      businessName: businessName || `${user.name}'s Auto Care`,
      description: description || '',
      experienceYears: Number(experienceYears) || 1,
      serviceCategories: Array.isArray(serviceCategories) ? serviceCategories : [],
      pricing: {
        baseFee: Number(pricing?.baseFee) || 500,
        perKmRate: Number(pricing?.perKmRate) || 30,
        diagnosticFee: Number(pricing?.diagnosticFee) || 300,
      },
      address: address || 'Workshop Road',
      location: {
        type: 'Point',
        coordinates: validCoords,
      },
      serviceRadiusKm: Number(serviceRadiusKm) || 25,
      operatingHours: operatingHours || { start: '00:00', end: '23:59', is24x7: true },
      verificationStatus: VERIFICATION_STATUS.PENDING,
      documents: Array.isArray(documents) ? documents : [],
    });

    await logAudit({
      actor: user._id,
      action: 'PARTNER_APPLIED',
      resourceType: 'partner',
      resourceId: partnerProfile._id,
      metadata: { businessName: partnerProfile.businessName },
      ipAddress: req.ip,
    });

    // Send Welcome Email to Partner (non-blocking)
    const { sendWelcomeEmail } = require('../services/emailService');
    sendWelcomeEmail({
      to: user.email,
      name: user.name,
      role: user.role,
      isPartner: true,
    }).catch((emailErr) => console.warn(`[Email Service] Partner registration email failed: ${emailErr.message}`));

    return res.status(201).json({
      success: true,
      message: 'Partner registration application submitted successfully. Verification pending.',
      data: {
        user,
        partnerProfile,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get current partner profile
// @route   GET /api/v1/partners/me
// @access  Private (Partner)
const getMyProfile = async (req, res, next) => {
  try {
    const profile = await PartnerProfile.findOne({ user: req.user.id })
      .populate('user', 'name email phone role status')
      .populate('serviceCategories');

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Partner profile not found for this user account.',
      });
    }

    return res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update partner profile
// @route   PATCH /api/v1/partners/me
// @access  Private (Partner)
const updateMyProfile = async (req, res, next) => {
  try {
    const profile = await PartnerProfile.findOne({ user: req.user.id });
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Partner profile not found',
      });
    }

    const {
      businessName,
      description,
      experienceYears,
      pricing,
      serviceRadiusKm,
      operatingHours,
      address,
      coordinates,
      serviceCategories,
    } = req.body;

    if (businessName) profile.businessName = businessName;
    if (description !== undefined) profile.description = description;
    if (experienceYears !== undefined) profile.experienceYears = Number(experienceYears);
    if (serviceRadiusKm !== undefined) profile.serviceRadiusKm = Number(serviceRadiusKm);
    if (operatingHours) profile.operatingHours = { ...profile.operatingHours, ...operatingHours };
    if (pricing) profile.pricing = { ...profile.pricing, ...pricing };
    if (address) profile.address = address;
    if (serviceCategories) profile.serviceCategories = serviceCategories;

    if (isValidCoordinates(coordinates)) {
      profile.location = {
        type: 'Point',
        coordinates,
      };
    }

    await profile.save();

    return res.status(200).json({
      success: true,
      message: 'Partner profile updated successfully',
      data: profile,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Toggle partner online/offline availability
// @route   PATCH /api/v1/partners/me/availability
// @access  Private (Partner)
const toggleAvailability = async (req, res, next) => {
  try {
    const profile = await PartnerProfile.findOne({ user: req.user.id });
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Partner profile not found',
      });
    }

    if (req.body.isAvailable !== undefined) {
      profile.isAvailable = Boolean(req.body.isAvailable);
    } else {
      profile.isAvailable = !profile.isAvailable;
    }

    await profile.save();

    return res.status(200).json({
      success: true,
      message: `Availability updated to ${profile.isAvailable ? 'Online' : 'Offline'}`,
      data: { isAvailable: profile.isAvailable },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Discover nearby verified & available partners
// @route   GET /api/v1/partners/nearby
// @access  Public / Private
const getNearbyPartners = async (req, res, next) => {
  try {
    const { longitude, latitude, serviceCategoryId, maxDistanceKm = 50 } = req.query;

    const lon = parseFloat(longitude);
    const lat = parseFloat(latitude);

    if (isNaN(lon) || isNaN(lat)) {
      return res.status(400).json({
        success: false,
        message: 'Valid longitude and latitude are required query parameters.',
      });
    }

    const query = {
      verificationStatus: VERIFICATION_STATUS.VERIFIED,
      isAvailable: true,
    };

    if (serviceCategoryId) {
      query.serviceCategories = serviceCategoryId;
    }

    // Retrieve partners and compute Haversine distance
    const partners = await PartnerProfile.find(query)
      .populate('user', 'name phone')
      .populate('serviceCategories');

    // Filter within partner's service radius and maxDistanceKm
    const eligiblePartners = partners
      .map((partner) => {
        const partnerCoords = partner.location?.coordinates || [0, 0];
        const distanceKm = calculateHaversineDistance([lon, lat], partnerCoords);

        // Price estimation based on partner's pricing or category defaults
        const estimate = calculateEstimate({
          basePrice: partner.pricing?.baseFee || 500,
          perKmRate: partner.pricing?.perKmRate || 30,
          distanceKm,
        });

        return {
          _id: partner._id,
          businessName: partner.businessName,
          partnerType: partner.partnerType,
          description: partner.description,
          ratingSummary: partner.ratingSummary,
          address: partner.address,
          coordinates: partnerCoords,
          distanceKm,
          serviceRadiusKm: partner.serviceRadiusKm,
          isWithinRadius: distanceKm <= partner.serviceRadiusKm,
          estimatedPrice: estimate,
          pricing: partner.pricing,
          phone: partner.user?.phone,
        };
      })
      .filter((p) => p.distanceKm <= Number(maxDistanceKm) && p.isWithinRadius)
      .sort((a, b) => a.distanceKm - b.distanceKm);

    return res.status(200).json({
      success: true,
      count: eligiblePartners.length,
      data: eligiblePartners,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get partner jobs
// @route   GET /api/v1/partners/me/jobs
// @access  Private (Partner)
const getPartnerJobs = async (req, res, next) => {
  try {
    const profile = await PartnerProfile.findOne({ user: req.user.id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Partner profile not found' });
    }

    const { status } = req.query;
    const filter = { assignedPartner: profile._id };

    if (status) {
      filter.status = status;
    }

    const jobs = await ServiceRequest.find(filter)
      .populate('customer', 'name phone email')
      .populate('vehicle')
      .populate('serviceCategory')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: jobs.length,
      data: jobs,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get partner earnings and performance summary
// @route   GET /api/v1/partners/me/earnings
// @access  Private (Partner)
const getPartnerEarnings = async (req, res, next) => {
  try {
    const profile = await PartnerProfile.findOne({ user: req.user.id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Partner profile not found' });
    }

    const completedJobs = await ServiceRequest.find({
      assignedPartner: profile._id,
      status: BOOKING_STATUS.COMPLETED,
    }).sort({ completedAt: -1 });

    const totalGrossValue = completedJobs.reduce((sum, job) => sum + (job.finalPrice?.total || 0), 0);
    // Platform fee policy: 10% platform commission, 90% partner earnings
    const platformCommissionRate = 0.10;
    const partnerEarnings = Math.round(totalGrossValue * (1 - platformCommissionRate));

    return res.status(200).json({
      success: true,
      data: {
        completedJobsCount: completedJobs.length,
        totalGrossValue,
        partnerEarnings,
        currency: 'INR',
        commissionRatePercent: 10,
        recentJobs: completedJobs.slice(0, 10).map((job) => ({
          bookingReference: job.bookingReference,
          date: job.completedAt || job.updatedAt,
          service: job.serviceCategorySnapshot?.name || 'Assistance Service',
          grossAmount: job.finalPrice?.total || 0,
          earnings: Math.round((job.finalPrice?.total || 0) * 0.9),
          paymentMethod: job.finalPrice?.paymentMethod || 'cash',
        })),
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  registerPartner,
  getMyProfile,
  updateMyProfile,
  toggleAvailability,
  getNearbyPartners,
  getPartnerJobs,
  getPartnerEarnings,
};
