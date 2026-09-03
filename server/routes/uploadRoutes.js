const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { protect } = require('../middleware/authMiddleware');
const { convertToWebP } = require('../utils/imageConverter');

// @route   POST /api/upload
// @desc    Upload product image and convert to WebP
// @access  Private (Admin)
router.post('/', protect, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an image file' });
    }

    // Convert memory buffer to WebP and save
    const webpUrl = await convertToWebP(req.file.buffer, req.file.originalname);

    res.status(200).json({
      success: true,
      message: 'Image uploaded and converted to WebP successfully',
      imageUrl: webpUrl,
      originalName: req.file.originalname,
      format: 'webp',
    });
  } catch (error) {
    console.error('Image upload/conversion error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Image upload failed',
    });
  }
});

module.exports = router;
