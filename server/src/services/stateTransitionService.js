const { BOOKING_STATUS, VALID_TRANSITIONS } = require('../constants/status');
const { ROLES } = require('../constants/roles');

/**
 * Validates state transitions and caller authorization
 */
const canTransition = (currentStatus, newStatus, userRole) => {
  const allowedNextStates = VALID_TRANSITIONS[currentStatus] || [];
  if (!allowedNextStates.includes(newStatus)) {
    return {
      allowed: false,
      reason: `Invalid state transition from '${currentStatus}' to '${newStatus}'.`,
    };
  }

  // Role permissions on transitions
  if (newStatus === BOOKING_STATUS.EN_ROUTE || newStatus === BOOKING_STATUS.ARRIVED || newStatus === BOOKING_STATUS.IN_PROGRESS) {
    if (userRole !== ROLES.MECHANIC && userRole !== ROLES.TOWING_PARTNER && userRole !== ROLES.ADMIN) {
      return {
        allowed: false,
        reason: 'Only the assigned partner or an admin can update active progress.',
      };
    }
  }

  if (newStatus === BOOKING_STATUS.COMPLETED) {
    if (userRole !== ROLES.MECHANIC && userRole !== ROLES.TOWING_PARTNER && userRole !== ROLES.ADMIN) {
      return {
        allowed: false,
        reason: 'Only the assigned partner or an admin can mark the service completed.',
      };
    }
  }

  return { allowed: true };
};

module.exports = {
  canTransition,
};
