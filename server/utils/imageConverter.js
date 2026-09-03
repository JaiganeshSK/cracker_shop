const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

/**
 * Converts an image buffer to optimized WebP format and saves to disk
 * @param {Buffer} buffer - Image file buffer from multer
 * @param {string} originalname - Original file name for reference
 * @returns {Promise<string>} - Relative web URL path to the saved WebP image
 */
const convertToWebP = async (buffer, originalname = 'image') => {
  const uploadDir = path.join(__dirname, '../uploads/products');

  // Ensure upload directory exists
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  // Create clean unique filename
  const cleanName = originalname
    .toLowerCase()
    .replace(/\.[^/.]+$/, '')
    .replace(/[^a-z0-9]/g, '-');
  const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
  const filename = `${cleanName}-${uniqueSuffix}.webp`;
  const outputPath = path.join(uploadDir, filename);

  // Process with Sharp
  await sharp(buffer)
    .resize(1200, 1200, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({
      quality: 80,
      effort: 4,
    })
    .toFile(outputPath);

  return `/uploads/products/${filename}`;
};

/**
 * Safely removes a product image file from the disk
 * @param {string} relativePath - URL path starting with /uploads/products/
 */
const deleteImageFile = (relativePath) => {
  if (!relativePath || !relativePath.startsWith('/uploads/products/')) return;

  const filename = path.basename(relativePath);
  const filePath = path.join(__dirname, '../uploads/products', filename);

  if (fs.existsSync(filePath)) {
    fs.unlink(filePath, (err) => {
      if (err) console.error(`Error deleting image ${filePath}:`, err.message);
    });
  }
};

module.exports = {
  convertToWebP,
  deleteImageFile,
};
