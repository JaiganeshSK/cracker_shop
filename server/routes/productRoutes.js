const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect } = require('../middleware/authMiddleware');
const { deleteImageFile } = require('../utils/imageConverter');

// @route   GET /api/products
// @desc    Get all products with optional filters
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category, search, inStock, featured, sort } = req.query;
    const filter = {};

    if (category && category !== 'All') {
      filter.category = category;
    }

    if (inStock !== undefined) {
      filter.inStock = inStock === 'true';
    }

    if (featured !== undefined) {
      filter.featured = featured === 'true';
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }

    let query = Product.find(filter);

    // Sorting
    if (sort === 'price-asc') {
      query = query.sort({ price: 1 });
    } else if (sort === 'price-desc') {
      query = query.sort({ price: -1 });
    } else if (sort === 'discount') {
      query = query.sort({ discountPercentage: -1 });
    } else {
      query = query.sort({ sortOrder: 1, createdAt: -1 });
    }

    const products = await query.exec();
    res.json({ success: true, count: products.length, products });
  } catch (error) {
    console.error('Fetch products error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching products' });
  }
});

// @route   GET /api/products/categories
// @desc    Get all distinct categories with item counts
// @access  Public
router.get('/categories', async (req, res) => {
  try {
    const categoriesWithCount = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          inStockCount: {
            $sum: { $cond: [{ $eq: ['$inStock', true] }, 1, 0] },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const formatted = categoriesWithCount.map((item) => ({
      name: item._id,
      count: item.count,
      inStockCount: item.inStockCount,
    }));

    res.json({ success: true, categories: formatted });
  } catch (error) {
    console.error('Fetch categories error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching categories' });
  }
});

// @route   GET /api/products/:id
// @desc    Get single product by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching product' });
  }
});

// @route   POST /api/products
// @desc    Create new product
// @access  Private (Admin)
router.post('/', protect, async (req, res) => {
  try {
    const {
      name,
      category,
      description,
      mrp,
      price,
      piecePerBox,
      imageUrl,
      soundLevel,
      inStock,
      featured,
      sortOrder,
    } = req.body;

    if (!name || !category || mrp === undefined || price === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, category, mrp, and price',
      });
    }

    const discountPercentage = mrp > 0 ? Math.round(((mrp - price) / mrp) * 100) : 0;

    const product = new Product({
      name,
      category,
      description,
      mrp,
      price,
      discountPercentage,
      piecePerBox: piecePerBox || '1 Box',
      imageUrl: imageUrl || '/uploads/products/placeholder.webp',
      soundLevel: soundLevel || 'Mild Sound',
      inStock: inStock !== undefined ? inStock : true,
      featured: featured || false,
      sortOrder: sortOrder || 0,
    });

    const savedProduct = await product.save();
    res.status(201).json({ success: true, product: savedProduct });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ success: false, message: error.message || 'Error creating product' });
  }
});

// @route   PUT /api/products/:id
// @desc    Update an existing product
// @access  Private (Admin)
router.put('/:id', protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const {
      name,
      category,
      description,
      mrp,
      price,
      piecePerBox,
      imageUrl,
      soundLevel,
      inStock,
      featured,
      sortOrder,
    } = req.body;

    // If image URL changed and old image was local, delete old image file
    if (imageUrl && imageUrl !== product.imageUrl) {
      deleteImageFile(product.imageUrl);
      product.imageUrl = imageUrl;
    }

    if (name) product.name = name;
    if (category) product.category = category;
    if (description !== undefined) product.description = description;
    if (piecePerBox !== undefined) product.piecePerBox = piecePerBox;
    if (soundLevel !== undefined) product.soundLevel = soundLevel;
    if (inStock !== undefined) product.inStock = inStock;
    if (featured !== undefined) product.featured = featured;
    if (sortOrder !== undefined) product.sortOrder = sortOrder;

    if (mrp !== undefined) product.mrp = mrp;
    if (price !== undefined) product.price = price;
    if (product.mrp > 0 && product.price >= 0) {
      product.discountPercentage = Math.round(((product.mrp - product.price) / product.mrp) * 100);
    }

    const updatedProduct = await product.save();
    res.json({ success: true, product: updatedProduct });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ success: false, message: error.message || 'Error updating product' });
  }
});

// @route   PATCH /api/products/:id/stock
// @desc    Quick toggle stock status
// @access  Private (Admin)
router.patch('/:id/stock', protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    product.inStock = req.body.inStock !== undefined ? req.body.inStock : !product.inStock;
    await product.save();

    res.json({
      success: true,
      message: `Product ${product.inStock ? 'marked In Stock' : 'marked Out of Stock'}`,
      product,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error toggling product stock' });
  }
});

// @route   DELETE /api/products/:id
// @desc    Delete a product
// @access  Private (Admin)
router.delete('/:id', protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Clean up WebP image file if stored locally
    deleteImageFile(product.imageUrl);

    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting product' });
  }
});

module.exports = router;
