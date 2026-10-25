const mongoose = require('mongoose');
const { BOOKING_STATUS, PAYMENT_STATUS, PAYMENT_METHODS } = require('../constants/status');

const serviceRequestSchema = new mongoose.Schema(
  {
    bookingReference: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: true,
    },
    // Vehicle snapshot in case vehicle record changes
    vehicleSnapshot: {
      registrationNumber: String,
      make: String,
      model: String,
      vehicleType: String,
      fuelType: String,
    },
    serviceCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ServiceCategory',
      required: true,
      index: true,
    },
    serviceCategorySnapshot: {
      name: String,
      slug: String,
    },
    breakdownDescription: {
      type: String,
      required: [true, 'Breakdown description is required'],
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    address: {
      type: String,
      required: [true, 'Address / location description is required'],
    },
    landmark: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: Object.values(BOOKING_STATUS),
      default: BOOKING_STATUS.REQUESTED,
      index: true,
    },
    assignedPartner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PartnerProfile',
      default: null,
      index: true,
    },
    assignedPartnerUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    estimatedPrice: {
      base: { type: Number, default: 0 },
      distanceRate: { type: Number, default: 0 },
      estimatedDistanceKm: { type: Number, default: 0 },
      estimatedTotal: { type: Number, required: true },
      currency: { type: String, default: 'INR' },
    },
    finalPrice: {
      base: { type: Number, default: 0 },
      distanceRate: { type: Number, default: 0 },
      additionalCharges: [
        {
          description: String,
          amount: Number,
        },
      ],
      taxes: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
      currency: { type: String, default: 'INR' },
      paymentStatus: {
        type: String,
        enum: Object.values(PAYMENT_STATUS),
        default: PAYMENT_STATUS.NOT_REQUIRED_YET,
      },
      paymentMethod: {
        type: String,
        enum: Object.values(PAYMENT_METHODS),
        default: PAYMENT_METHODS.CASH,
      },
    },
    tracking: {
      currentLocation: {
        type: {
          type: String,
          enum: ['Point'],
          default: 'Point',
        },
        coordinates: {
          type: [Number], // [longitude, latitude]
          default: [77.2090, 28.6139],
        },
      },
      lastUpdatedAt: {
        type: Date,
        default: Date.now,
      },
      heading: {
        type: Number,
        default: 0,
      },
    },
    statusHistory: [
      {
        status: {
          type: String,
          enum: Object.values(BOOKING_STATUS),
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
        note: {
          type: String,
          default: '',
        },
        updatedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      },
    ],
    cancellation: {
      reason: String,
      cancelledBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      timestamp: Date,
    },
    hasReview: {
      type: Boolean,
      default: false,
    },
    acceptedAt: Date,
    arrivedAt: Date,
    completedAt: Date,
  },
  {
    timestamps: true,
  }
);

// Indexes
serviceRequestSchema.index({ location: '2dsphere' });
serviceRequestSchema.index({ customer: 1, createdAt: -1 });
serviceRequestSchema.index({ assignedPartner: 1, status: 1 });
serviceRequestSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('ServiceRequest', serviceRequestSchema);
