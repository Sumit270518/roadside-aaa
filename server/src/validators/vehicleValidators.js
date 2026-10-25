const { body } = require('express-validator');

const vehicleValidator = [
  body('registrationNumber')
    .trim()
    .notEmpty()
    .withMessage('Registration number is required')
    .isLength({ min: 4, max: 20 })
    .withMessage('Registration number must be between 4 and 20 characters'),
  body('vehicleType')
    .notEmpty()
    .withMessage('Vehicle type is required')
    .isIn(['car', 'suv', 'bike', 'truck', 'van', 'other'])
    .withMessage('Invalid vehicle type'),
  body('make').trim().notEmpty().withMessage('Vehicle make is required'),
  body('model').trim().notEmpty().withMessage('Vehicle model is required'),
  body('year')
    .notEmpty()
    .withMessage('Manufacturing year is required')
    .isInt({ min: 1980, max: new Date().getFullYear() + 1 })
    .withMessage('Year must be between 1980 and next year'),
  body('fuelType')
    .notEmpty()
    .withMessage('Fuel type is required')
    .isIn(['petrol', 'diesel', 'electric', 'hybrid', 'cng'])
    .withMessage('Invalid fuel type'),
];

module.exports = { vehicleValidator };
