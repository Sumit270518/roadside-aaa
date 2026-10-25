const mongoose = require('mongoose');
const { PARTNER_TYPES, VERIFICATION_STATUS } = require('../constants/roles');

const partnerProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    partnerType: {
      type: String,
      enum: Object.values(PARTNER_TYPES),
      required: true,
      index: true,
    },
    businessName: {
      type: String,
      required: [true, 'Business name is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    experienceYears: {
      type: Number,
      default: 1,
      min: 0,
    },
    verificationStatus: {
      type: String,
      enum: Object.values(VERIFICATION_STATUS),
      default: VERIFICATION_STATUS.PENDING,
      index: true,
    },
    verificationDecisionHistory: [
      {
        status: {
          type: String,
          enum: Object.values(VERIFICATION_STATUS),
          required: true,
        },
        reason: {
          type: String,
          default: '',
        },
        decidedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    serviceCategories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ServiceCategory',
      },
    ],
    pricing: {
      baseFee: {
        type: Number,
        default: 500,
        min: 0,
      },
      perKmRate: {
        type: Number,
        default: 30,
        min: 0,
      },
      diagnosticFee: {
        type: Number,
        default: 300,
        min: 0,
      },
    },
    address: {
      type: String,
      required: [true, 'Base workshop / address is required'],
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
        default: [77.2090, 28.6139], // Default New Delhi coordinates [lng, lat]
      },
    },
    serviceRadiusKm: {
      type: Number,
      default: 20,
      min: 1,
      max: 100,
    },
    operatingHours: {
      start: { type: String, default: '00:00' },
      end: { type: String, default: '23:59' },
      is24x7: { type: Boolean, default: true },
    },
    isAvailable: {
      type: Boolean,
      default: true,
      index: true,
    },
    ratingSummary: {
      averageRating: {
        type: Number,
        default: 5.0,
        min: 0,
        max: 5,
      },
      totalReviews: {
        type: Number,
        default: 0,
      },
    },
    documents: [
      {
        docType: {
          type: String,
          enum: ['id_proof', 'business_license', 'mechanic_certification', 'vehicle_insurance'],
          default: 'id_proof',
        },
        docName: String,
        fileUrl: String,
        verified: {
          type: Boolean,
          default: false,
        },
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// 2dsphere index for geospatial partner discovery
partnerProfileSchema.index({ location: '2dsphere' });
partnerProfileSchema.index({ verificationStatus: 1, isAvailable: 1 });

module.exports = mongoose.model('PartnerProfile', partnerProfileSchema);
