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

    const products = await query.lean().exec();
    // Enable Edge CDN caching for 60s with stale-while-revalidate
    res.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
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

/**
 * Helper to validate and normalize a batch of products for bulk insertion
 */
const prepareProductsForBulkInsert = (items) => {
  if (!Array.isArray(items) || items.length === 0) {
    const err = new Error('Please provide a non-empty array of products');
    err.status = 400;
    throw err;
  }

  if (items.length > 200) {
    const err = new Error('Maximum 200 products can be inserted in a single batch');
    err.status = 400;
    throw err;
  }

  const validated = [];
  const errors = [];

  items.forEach((item, index) => {
    const rowNum = index + 1;
    const name = item && item.name ? String(item.name).trim() : '';
    const category = item && item.category ? String(item.category).trim() : '';
    const mrp = item ? Number(item.mrp) : NaN;
    const price = item ? Number(item.price) : NaN;

    if (!name) {
      errors.push(`Product #${rowNum}: Name is required`);
    }
    if (!category) {
      errors.push(`Product #${rowNum}: Category is required`);
    }
    if (isNaN(mrp) || mrp < 0) {
      errors.push(`Product #${rowNum}: Valid MRP is required`);
    }
    if (isNaN(price) || price < 0) {
      errors.push(`Product #${rowNum}: Valid Selling Price is required`);
    }

    if (errors.length === 0) {
      const discountPercentage =
        mrp > 0 ? Math.round(((mrp - price) / mrp) * 100) : 0;

      validated.push({
        name,
        category,
        description: item.description ? String(item.description).trim() : '',
        mrp,
        price,
        discountPercentage:
          item.discountPercentage !== undefined && !isNaN(Number(item.discountPercentage))
            ? Number(item.discountPercentage)
            : discountPercentage,
        piecePerBox: item.piecePerBox ? String(item.piecePerBox).trim() : '1 Box',
        imageUrl: item.imageUrl ? String(item.imageUrl).trim() : '',
        imageFileName: item.imageFileName ? String(item.imageFileName).trim() : '',
        soundLevel: item.soundLevel || 'Mild Sound',
        inStock: item.inStock !== undefined ? Boolean(item.inStock) : true,
        featured: item.featured !== undefined ? Boolean(item.featured) : false,
        sortOrder: item.sortOrder !== undefined && !isNaN(Number(item.sortOrder)) ? Number(item.sortOrder) : 0,
      });
    }
  });

  if (errors.length > 0) {
    const err = new Error(errors.slice(0, 5).join('; ') + (errors.length > 5 ? ` and ${errors.length - 5} more errors` : ''));
    err.details = errors;
    err.status = 400;
    throw err;
  }

  return validated;
};

// @route   POST /api/products/bulk
// @desc    Create multiple products at once
// @access  Private (Admin)
router.post('/bulk', protect, async (req, res) => {
  try {
    const rawProducts = Array.isArray(req.body) ? req.body : req.body && req.body.products;
    const validatedProducts = prepareProductsForBulkInsert(rawProducts);

    const insertedProducts = await Product.insertMany(validatedProducts, { ordered: true });

    res.status(201).json({
      success: true,
      message: `Successfully inserted ${insertedProducts.length} products`,
      count: insertedProducts.length,
      products: insertedProducts,
    });
  } catch (error) {
    console.error('Bulk product insert error:', error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Error inserting products in bulk',
      errors: error.details || undefined,
    });
  }
});

// @route   POST /api/products
// @desc    Create new product (or batch if array provided)
// @access  Private (Admin)
router.post('/', protect, async (req, res) => {
  try {
    // If request body is array or contains products array, delegate to bulk handler
    if (Array.isArray(req.body) || (req.body && Array.isArray(req.body.products))) {
      const rawProducts = Array.isArray(req.body) ? req.body : req.body.products;
      const validatedProducts = prepareProductsForBulkInsert(rawProducts);
      const insertedProducts = await Product.insertMany(validatedProducts, { ordered: true });

      return res.status(201).json({
        success: true,
        message: `Successfully inserted ${insertedProducts.length} products`,
        count: insertedProducts.length,
        products: insertedProducts,
      });
    }

    const {
      name,
      category,
      description,
      mrp,
      price,
      piecePerBox,
      imageUrl,
      imageFileName,
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
      imageUrl: imageUrl || '',
      imageFileName: imageFileName || '',
      soundLevel: soundLevel || 'Mild Sound',
      inStock: inStock !== undefined ? inStock : true,
      featured: featured || false,
      sortOrder: sortOrder || 0,
    });

    const savedProduct = await product.save();
    res.status(201).json({ success: true, product: savedProduct });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Error creating product',
      errors: error.details || undefined,
    });
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
      imageFileName,
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
    if (imageFileName !== undefined) {
      product.imageFileName = imageFileName;
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
