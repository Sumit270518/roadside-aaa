const ROLES = {
  USER: 'user',
  MECHANIC: 'mechanic',
  TOWING_PARTNER: 'towing_partner',
  ADMIN: 'admin',
};

const PARTNER_TYPES = {
  MECHANIC: 'mechanic',
  TOWING: 'towing_partner',
};

const VERIFICATION_STATUS = {
  PENDING: 'pending',
  VERIFIED: 'verified',
  REJECTED: 'rejected',
  SUSPENDED: 'suspended',
};

module.exports = {
  ROLES,
  PARTNER_TYPES,
  VERIFICATION_STATUS,
};
