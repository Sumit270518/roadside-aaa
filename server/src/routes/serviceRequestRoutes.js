const express = require('express');
const router = express.Router();
const {
  createRequest,
  getRequests,
  getRequestById,
  acceptRequest,
  updateStatus,
  updateLocation,
  completeRequest,
  cancelRequest,
  getInvoice,
} = require('../controllers/serviceRequestController');
const { createReview } = require('../controllers/reviewController');
const { getMessages, sendMessage } = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .post(createRequest)
  .get(getRequests);

router.route('/:id')
  .get(getRequestById);

router.post('/:id/accept', acceptRequest);
router.post('/:id/status', updateStatus);
router.post('/:id/location', updateLocation);
router.post('/:id/complete', completeRequest);
router.post('/:id/cancel', cancelRequest);
router.get('/:id/invoice', getInvoice);

// Booking reviews
router.post('/:id/review', createReview);

// Booking chat
router.route('/:id/messages')
  .get(getMessages)
  .post(sendMessage);

module.exports = router;
