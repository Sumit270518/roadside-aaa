const Vehicle = require('../models/Vehicle');
const ServiceRequest = require('../models/ServiceRequest');
const { BOOKING_STATUS } = require('../constants/status');

// @desc    Get all vehicles for current user
// @route   GET /api/v1/vehicles
// @access  Private
const getVehicles = async (req, res, next) => {
  try {
    const vehicles = await Vehicle.find({ owner: req.user.id }).sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      count: vehicles.length,
      data: vehicles,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create a new vehicle
// @route   POST /api/v1/vehicles
// @access  Private
const createVehicle = async (req, res, next) => {
  try {
    const { registrationNumber, vehicleType, make, model, year, fuelType, color, notes } = req.body;

    const existing = await Vehicle.findOne({
      owner: req.user.id,
      registrationNumber: registrationNumber.toUpperCase().trim(),
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'You already registered a vehicle with this registration number.',
      });
    }

    const vehicle = await Vehicle.create({
      owner: req.user.id,
      registrationNumber: registrationNumber.toUpperCase().trim(),
      vehicleType,
      make: make.trim(),
      model: model.trim(),
      year: Number(year),
      fuelType,
      color: color ? color.trim() : '',
      notes: notes ? notes.trim() : '',
    });

    return res.status(201).json({
      success: true,
      message: 'Vehicle added successfully',
      data: vehicle,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single vehicle by ID
// @route   GET /api/v1/vehicles/:id
// @access  Private
const getVehicleById = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found',
      });
    }

    // Ownership check (or admin)
    if (vehicle.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. You do not own this vehicle.',
      });
    }

    return res.status(200).json({
      success: true,
      data: vehicle,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update vehicle
// @route   PATCH /api/v1/vehicles/:id
// @access  Private
const updateVehicle = async (req, res, next) => {
  try {
    let vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found',
      });
    }

    if (vehicle.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. You do not have permission to edit this vehicle.',
      });
    }

    const allowedFields = ['vehicleType', 'make', 'model', 'year', 'fuelType', 'color', 'notes'];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        vehicle[field] = req.body[field];
      }
    });

    if (req.body.registrationNumber) {
      vehicle.registrationNumber = req.body.registrationNumber.toUpperCase().trim();
    }

    await vehicle.save();

    return res.status(200).json({
      success: true,
      message: 'Vehicle updated successfully',
      data: vehicle,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete vehicle
// @route   DELETE /api/v1/vehicles/:id
// @access  Private
const deleteVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found',
      });
    }

    if (vehicle.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. You do not have permission to delete this vehicle.',
      });
    }

    // Check if vehicle has active bookings
    const activeBooking = await ServiceRequest.findOne({
      vehicle: vehicle._id,
      status: {
        $in: [
          BOOKING_STATUS.REQUESTED,
          BOOKING_STATUS.SEARCHING,
          BOOKING_STATUS.ACCEPTED,
          BOOKING_STATUS.EN_ROUTE,
          BOOKING_STATUS.ARRIVED,
          BOOKING_STATUS.IN_PROGRESS,
        ],
      },
    });

    if (activeBooking) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete vehicle with active service requests in progress.',
      });
    }

    await Vehicle.findByIdAndDelete(vehicle._id);

    return res.status(200).json({
      success: true,
      message: 'Vehicle deleted successfully',
      data: {},
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getVehicles,
  createVehicle,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
};
