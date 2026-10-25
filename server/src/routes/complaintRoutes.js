const express = require('express');
const router = express.Router();
const {
  createComplaint,
  getComplaints,
  getComplaintById,
} = require('../controllers/complaintController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .post(createComplaint)
  .get(getComplaints);

router.get('/:id', getComplaintById);

module.exports = router;
