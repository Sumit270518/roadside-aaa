const express = require('express');
const router = express.Router();
const {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/serviceCategoryController');
const { protect, restrictTo } = require('../middleware/auth');
const { ROLES } = require('../constants/roles');

router.route('/')
  .get(getCategories)
  .post(protect, restrictTo(ROLES.ADMIN), createCategory);

router.route('/:id')
  .get(getCategoryById)
  .patch(protect, restrictTo(ROLES.ADMIN), updateCategory)
  .delete(protect, restrictTo(ROLES.ADMIN), deleteCategory);

module.exports = router;
