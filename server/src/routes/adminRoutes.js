const express = require('express');
const router = express.Router();
const {
  getAdminStats,
  getUsers,
  updateUserStatus,
  getPartners,
  verifyPartner,
  getLiveBookings,
  updateComplaint,
  getReports,
  getAuditLogs,
} = require('../controllers/adminController');
const { protect, restrictTo } = require('../middleware/auth');
const { ROLES } = require('../constants/roles');

router.use(protect);
router.use(restrictTo(ROLES.ADMIN));

router.get('/stats', getAdminStats);
router.get('/users', getUsers);
router.patch('/users/:id/status', updateUserStatus);
router.get('/partners', getPartners);
router.patch('/partners/:id/verify', verifyPartner);
router.get('/bookings', getLiveBookings);
router.patch('/complaints/:id', updateComplaint);
router.get('/reports', getReports);
router.get('/audit-logs', getAuditLogs);

module.exports = router;
