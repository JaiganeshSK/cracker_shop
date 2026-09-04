const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { protect } = require('../middleware/authMiddleware');
const { uploadImageToBlob } = require('../utils/imageConverter');
const Upload = require('../models/Upload');

// @route   POST /api/upload
// @desc    Upload product image to Vercel Blob and store record in DB
// @access  Private (Admin)
router.post('/', protect, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an image file' });
    }

    // Convert memory buffer to WebP and upload to Vercel Blob
    // Filename is generated strictly with current date and time (not original name)
    const uploadResult = await uploadImageToBlob(req.file.buffer, 'products');

    // Store the filename and metadata in database with current date and time
    const uploadRecord = await Upload.create({
      filename: uploadResult.filename,
      url: uploadResult.url,
      originalName: req.file.originalname,
      mimeType: uploadResult.mimeType || 'image/webp',
      size: uploadResult.size,
      storage: uploadResult.storage,
      uploadedAt: uploadResult.uploadedAt || new Date(),
    });

    console.log(`[Upload] File saved to ${uploadResult.storage}: ${uploadRecord.filename} at ${uploadRecord.uploadedAt.toISOString()}`);

    res.status(200).json({
      success: true,
      message: 'Image uploaded to Vercel Blob and recorded in database successfully',
      imageUrl: uploadRecord.url,
      filename: uploadRecord.filename,
      uploadedAt: uploadRecord.uploadedAt,
      format: 'webp',
      id: uploadRecord._id,
    });
  } catch (error) {
    console.error('Image upload/conversion error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Image upload failed',
    });
  }
});

// @route   GET /api/upload
// @desc    Get recently uploaded files recorded in database
// @access  Private (Admin)
router.get('/', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 30;
    const skip = (page - 1) * limit;

    const [uploads, total] = await Promise.all([
      Upload.find().sort({ uploadedAt: -1 }).skip(skip).limit(limit),
      Upload.countDocuments(),
    ]);

    res.json({
      success: true,
      total,
      page,
      pages: Math.ceil(total / limit),
      uploads,
    });
  } catch (error) {
    console.error('Error fetching uploads:', error);
    res.status(500).json({ success: false, message: 'Error fetching upload records' });
  }
});

module.exports = router;
