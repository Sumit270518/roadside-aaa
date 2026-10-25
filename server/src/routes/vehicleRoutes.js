const express = require('express');
const router = express.Router();
const {
  getVehicles,
  createVehicle,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
} = require('../controllers/vehicleController');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { vehicleValidator } = require('../validators/vehicleValidators');

router.use(protect);

router.route('/')
  .get(getVehicles)
  .post(vehicleValidator, validate, createVehicle);

router.route('/:id')
  .get(getVehicleById)
  .patch(updateVehicle)
  .delete(deleteVehicle);

module.exports = router;
