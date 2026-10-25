const User = require('../models/User');
const PartnerProfile = require('../models/PartnerProfile');
const { sendTokenResponse } = require('../utils/token');
const { ROLES } = require('../constants/roles');
const { logAudit } = require('../utils/audit');
const { sendWelcomeEmail, sendSignInAlertEmail } = require('../services/emailService');

// @desc    Register a vehicle owner (customer) or base account
// @route   POST /api/v1/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, phone, password, role } = req.body;

    // Security: users cannot register themselves as admin
    const assignedRole = role === ROLES.ADMIN ? ROLES.USER : (role || ROLES.USER);

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      phone,
      password,
      role: assignedRole,
    });

    await logAudit({
      actor: user._id,
      action: 'USER_REGISTERED',
      resourceType: 'user',
      resourceId: user._id,
      metadata: { email: user.email, role: user.role },
      ipAddress: req.ip,
    });

    // Send Welcome Email to user's valid email address (non-blocking)
    sendWelcomeEmail({
      to: user.email,
      name: user.name,
      role: user.role,
    }).catch((emailErr) => console.warn(`[Email Service] Registration email failed: ${emailErr.message}`));

    return sendTokenResponse(user, 201, res, 'Registration successful');
  } catch (err) {
    next(err);
  }
};

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials.',
      });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended by administration.',
      });
    }

    user.lastLogin = new Date();
    await user.save();

    await logAudit({
      actor: user._id,
      action: 'USER_LOGIN',
      resourceType: 'user',
      resourceId: user._id,
      metadata: { email: user.email },
      ipAddress: req.ip,
    });

    // Send Security Sign-In Alert Email to user's registered email address (non-blocking)
    sendSignInAlertEmail({
      to: user.email,
      name: user.name,
      ip: req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      userAgent: req.headers['user-agent'] || 'Web Browser',
    }).catch((emailErr) => console.warn(`[Email Service] Sign-in alert failed: ${emailErr.message}`));

    return sendTokenResponse(user, 200, res, 'Login successful');
  } catch (err) {
    next(err);
  }
};

// @desc    Logout user / clear cookie
// @route   POST /api/v1/auth/logout
// @access  Private
const logout = async (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 5 * 1000),
    httpOnly: true,
  });

  return res.status(200).json({
    success: true,
    message: 'User logged out successfully',
    data: {},
  });
};

// @desc    Get current logged in user & partner info if applicable
// @route   GET /api/v1/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    let partnerProfile = null;

    if (user.role === ROLES.MECHANIC || user.role === ROLES.TOWING_PARTNER) {
      partnerProfile = await PartnerProfile.findOne({ user: user._id }).populate('serviceCategories');
    }

    return res.status(200).json({
      success: true,
      data: {
        user,
        partnerProfile,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update user profile
// @route   PATCH /api/v1/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone } = req.body;
    const user = await User.findById(req.user.id);

    if (name) user.name = name.trim();
    if (phone) user.phone = phone.trim();

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: { user },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Refresh session token
// @route   POST /api/v1/auth/refresh
// @access  Private
const refresh = async (req, res) => {
  return sendTokenResponse(req.user, 200, res, 'Token refreshed');
};

module.exports = {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  refresh,
};
