const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const Product = require('../models/Product');
const { protect } = require('../middleware/authMiddleware');

// @route   GET /api/categories
// @desc    Get active categories with product counts (sorted by sortOrder)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ sortOrder: 1, name: 1 }).lean();

    // Count products per category
    const productCounts = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);

    const countMap = {};
    productCounts.forEach((pc) => {
      countMap[pc._id] = pc.count;
    });

    const formatted = categories.map((cat) => ({
      _id: cat._id,
      name: cat.name,
      description: cat.description,
      sortOrder: cat.sortOrder,
      isActive: cat.isActive,
      productCount: countMap[cat.name] || 0,
    }));

    // Enable Edge CDN caching for 60s with stale-while-revalidate
    res.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    res.json({ success: true, count: formatted.length, categories: formatted });
  } catch (error) {
    console.error('Fetch categories error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching categories' });
  }
});

// @route   GET /api/categories/admin
// @desc    Get all categories for Admin (including inactive)
// @access  Private (Admin)
router.get('/admin', protect, async (req, res) => {
  try {
    const categories = await Category.find().sort({ sortOrder: 1, name: 1 });

    const productCounts = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);

    const countMap = {};
    productCounts.forEach((pc) => {
      countMap[pc._id] = pc.count;
    });

    const formatted = categories.map((cat) => ({
      _id: cat._id,
      name: cat.name,
      description: cat.description,
      sortOrder: cat.sortOrder,
      isActive: cat.isActive,
      productCount: countMap[cat.name] || 0,
      createdAt: cat.createdAt,
    }));

    res.json({ success: true, count: formatted.length, categories: formatted });
  } catch (error) {
    console.error('Admin fetch categories error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching admin categories' });
  }
});

// @route   POST /api/categories
// @desc    Create a new category
// @access  Private (Admin)
router.post('/', protect, async (req, res) => {
  try {
    const { name, description, sortOrder, isActive } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Category name is required' });
    }

    const existing = await Category.findOne({ name: name.trim() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Category with this name already exists' });
    }

    const category = new Category({
      name: name.trim(),
      description: description || '',
      sortOrder: parseInt(sortOrder) || 0,
      isActive: isActive !== undefined ? isActive : true,
    });

    const saved = await category.save();
    res.status(201).json({ success: true, message: 'Category created successfully', category: saved });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ success: false, message: error.message || 'Error creating category' });
  }
});

// @route   PUT /api/categories/:id
// @desc    Update an existing category (and sync products if renamed)
// @access  Private (Admin)
router.put('/:id', protect, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    const { name, description, sortOrder, isActive } = req.body;
    const oldName = category.name;

    if (name && name.trim() !== oldName) {
      const existing = await Category.findOne({ name: name.trim(), _id: { $ne: category._id } });
      if (existing) {
        return res.status(400).json({ success: false, message: 'Another category already has this name' });
      }

      // Rename across all products in this category
      await Product.updateMany({ category: oldName }, { $set: { category: name.trim() } });
      category.name = name.trim();
    }

    if (description !== undefined) category.description = description;
    if (sortOrder !== undefined) category.sortOrder = parseInt(sortOrder) || 0;
    if (isActive !== undefined) category.isActive = isActive;

    const updated = await category.save();

    res.json({ success: true, message: 'Category updated successfully', category: updated });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ success: false, message: error.message || 'Error updating category' });
  }
});

// @route   DELETE /api/categories/:id
// @desc    Delete a category
// @access  Private (Admin)
router.delete('/:id', protect, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    // Check if any products exist under this category
    const productCount = await Product.countDocuments({ category: category.name });
    if (productCount > 0 && !req.query.force) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete: ${productCount} cracker product(s) belong to this category. Please reassign or delete them first.`,
      });
    }

    await Category.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ success: false, message: 'Server error deleting category' });
  }
});

module.exports = router;
