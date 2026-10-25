const Review = require('../models/Review');
const ServiceRequest = require('../models/ServiceRequest');
const PartnerProfile = require('../models/PartnerProfile');
const { BOOKING_STATUS } = require('../constants/status');

// @desc    Create review for completed booking
// @route   POST /api/v1/requests/:id/review
// @access  Private (Customer)
const createReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const booking = await ServiceRequest.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.customer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Only the customer who booked this service can submit a review.',
      });
    }

    if (booking.status !== BOOKING_STATUS.COMPLETED) {
      return res.status(400).json({
        success: false,
        message: 'You can only review services that have been successfully completed.',
      });
    }

    const existingReview = await Review.findOne({ bookingId: booking._id });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a review for this service.',
      });
    }

    const review = await Review.create({
      bookingId: booking._id,
      customer: req.user.id,
      partner: booking.assignedPartner,
      rating: Number(rating),
      comment: comment ? comment.trim() : '',
    });

    booking.hasReview = true;
    await booking.save();

    // Recompute partner rating summary
    if (booking.assignedPartner) {
      const allPartnerReviews = await Review.find({ partner: booking.assignedPartner });
      const totalReviews = allPartnerReviews.length;
      const sumRatings = allPartnerReviews.reduce((sum, r) => sum + r.rating, 0);
      const averageRating = totalReviews > 0 ? Math.round((sumRatings / totalReviews) * 10) / 10 : 5.0;

      await PartnerProfile.findByIdAndUpdate(booking.assignedPartner, {
        'ratingSummary.averageRating': averageRating,
        'ratingSummary.totalReviews': totalReviews,
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Thank you for your feedback! Review submitted successfully.',
      data: review,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get reviews for a partner
// @route   GET /api/v1/partners/:id/reviews
// @access  Public
const getPartnerReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ partner: req.params.id })
      .populate('customer', 'name')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createReview,
  getPartnerReviews,
};
