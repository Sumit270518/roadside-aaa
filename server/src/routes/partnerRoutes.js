const express = require('express');
const router = express.Router();
const {
  registerPartner,
  getMyProfile,
  updateMyProfile,
  toggleAvailability,
  getNearbyPartners,
  getPartnerJobs,
  getPartnerEarnings,
} = require('../controllers/partnerController');
const { getPartnerReviews } = require('../controllers/reviewController');
const { protect, restrictTo } = require('../middleware/auth');
const { ROLES } = require('../constants/roles');

// Public partner discovery
router.get('/nearby', getNearbyPartners);
router.get('/:id/reviews', getPartnerReviews);

// Partner onboarding (Can be called by guest or logged in user)
router.post('/register', (req, res, next) => {
  // If authorization header exists, run protect, otherwise proceed
  if (req.headers.authorization || (req.cookies && req.cookies.token)) {
    return protect(req, res, next);
  }
  next();
}, registerPartner);

// Partner protected endpoints
router.use(protect);
router.use(restrictTo(ROLES.MECHANIC, ROLES.TOWING_PARTNER, ROLES.ADMIN));

router.get('/me', getMyProfile);
router.patch('/me', updateMyProfile);
router.patch('/me/availability', toggleAvailability);
router.get('/me/jobs', getPartnerJobs);
router.get('/me/earnings', getPartnerEarnings);

module.exports = router;
