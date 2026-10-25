const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    registrationNumber: {
      type: String,
      required: [true, 'Vehicle registration number is required'],
      uppercase: true,
      trim: true,
      maxlength: [20, 'Registration number too long'],
    },
    vehicleType: {
      type: String,
      enum: ['car', 'suv', 'bike', 'truck', 'van', 'other'],
      default: 'car',
      required: true,
    },
    make: {
      type: String,
      required: [true, 'Vehicle make is required'],
      trim: true,
    },
    model: {
      type: String,
      required: [true, 'Vehicle model is required'],
      trim: true,
    },
    year: {
      type: Number,
      required: [true, 'Manufacturing year is required'],
      min: [1980, 'Year must be 1980 or later'],
      max: [new Date().getFullYear() + 1, 'Year cannot be in the far future'],
    },
    fuelType: {
      type: String,
      enum: ['petrol', 'diesel', 'electric', 'hybrid', 'cng'],
      default: 'petrol',
      required: true,
    },
    color: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
  },
  {
    timestamps: true,
  }
);

vehicleSchema.index({ owner: 1, registrationNumber: 1 });

module.exports = mongoose.model('Vehicle', vehicleSchema);
