const ServiceCategory = require('../models/ServiceCategory');
const ServiceRequest = require('../models/ServiceRequest');

// @desc    Get all service categories
// @route   GET /api/v1/services
// @access  Public
const getCategories = async (req, res, next) => {
  try {
    const filter = req.query.all === 'true' && req.user && req.user.role === 'admin' ? {} : { isActive: true };
    const categories = await ServiceCategory.find(filter).sort({ name: 1 });
    return res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get service category by ID
// @route   GET /api/v1/services/:id
// @access  Public
const getCategoryById = async (req, res, next) => {
  try {
    const category = await ServiceCategory.findById(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Service category not found',
      });
    }
    return res.status(200).json({
      success: true,
      data: category,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create service category
// @route   POST /api/v1/services
// @access  Admin
const createCategory = async (req, res, next) => {
  try {
    const { name, description, basePrice, perKmRate, icon } = req.body;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const existing = await ServiceCategory.findOne({ slug });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'A category with this name already exists',
      });
    }

    const category = await ServiceCategory.create({
      name,
      slug,
      description,
      basePrice: Number(basePrice) || 0,
      perKmRate: Number(perKmRate) || 0,
      icon: icon || 'Wrench',
    });

    return res.status(201).json({
      success: true,
      message: 'Service category created successfully',
      data: category,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update service category
// @route   PATCH /api/v1/services/:id
// @access  Admin
const updateCategory = async (req, res, next) => {
  try {
    const { name, description, basePrice, perKmRate, icon, isActive } = req.body;
    const category = await ServiceCategory.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Service category not found',
      });
    }

    if (name) {
      category.name = name;
      category.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }
    if (description !== undefined) category.description = description;
    if (basePrice !== undefined) category.basePrice = Number(basePrice);
    if (perKmRate !== undefined) category.perKmRate = Number(perKmRate);
    if (icon !== undefined) category.icon = icon;
    if (isActive !== undefined) category.isActive = Boolean(isActive);

    await category.save();

    return res.status(200).json({
      success: true,
      message: 'Service category updated successfully',
      data: category,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete service category (soft-disable if referenced)
// @route   DELETE /api/v1/services/:id
// @access  Admin
const deleteCategory = async (req, res, next) => {
  try {
    const category = await ServiceCategory.findById(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Service category not found',
      });
    }

    const count = await ServiceRequest.countDocuments({ serviceCategory: category._id });
    if (count > 0) {
      // Archival strategy: disable category instead of deleting
      category.isActive = false;
      await category.save();
      return res.status(200).json({
        success: true,
        message: `Category is referenced by ${count} booking(s). It has been archived and marked inactive.`,
        data: category,
      });
    }

    await ServiceCategory.findByIdAndDelete(category._id);
    return res.status(200).json({
      success: true,
      message: 'Service category deleted successfully',
      data: {},
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
