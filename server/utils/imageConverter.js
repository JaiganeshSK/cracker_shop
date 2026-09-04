const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const { put, del } = require('@vercel/blob');

/**
 * Generate a clean filename based solely on current date and time.
 * Format: YYYY-MM-DD_HH-mm-ss-SSS.webp
 * Note: Never uses the original filename as requested.
 * @param {string} extension - file extension (default: 'webp')
 * @returns {string} - formatted filename
 */
const generateDateTimeFilename = (extension = 'webp') => {
  const now = new Date();
  const pad = (num, digits = 2) => String(num).padStart(digits, '0');

  const year = now.getFullYear();
  const month = pad(now.getMonth() + 1);
  const day = pad(now.getDate());
  const hours = pad(now.getHours());
  const minutes = pad(now.getMinutes());
  const seconds = pad(now.getSeconds());
  const millis = pad(now.getMilliseconds(), 3);

  const cleanExt = extension.replace(/^\.+/, '');
  return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}-${millis}.${cleanExt}`;
};

/**
 * Converts an image buffer to optimized WebP format and uploads to Vercel Blob
 * (or falls back to local disk if no token is configured)
 * @param {Buffer} buffer - Image file buffer from multer
 * @param {string} [folder='products'] - Target folder in blob storage
 * @returns {Promise<{ url: string, filename: string, pathname: string, size: number, mimeType: string, storage: string, uploadedAt: Date }>}
 */
const uploadImageToBlob = async (buffer, folder = 'products') => {
  const filename = generateDateTimeFilename('webp');
  const blobPath = folder ? `${folder}/${filename}` : filename;

  // Process and optimize with Sharp
  const webpBuffer = await sharp(buffer)
    .resize(1200, 1200, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({
      quality: 80,
      effort: 4,
    })
    .toBuffer();

  const token = process.env.BLOB_READ_WRITE_TOKEN;

  if (token) {
    // Upload to Vercel Blob
    const blob = await put(blobPath, webpBuffer, {
      access: 'public',
      token,
      contentType: 'image/webp',
    });

    return {
      url: blob.url,
      filename: filename,
      pathname: blob.pathname,
      size: webpBuffer.length,
      mimeType: 'image/webp',
      storage: 'vercel-blob',
      uploadedAt: new Date(),
    };
  }

  // Fallback to local disk if BLOB_READ_WRITE_TOKEN is not configured
  const uploadDir = path.join(__dirname, '../uploads/products');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const outputPath = path.join(uploadDir, filename);
  await fs.promises.writeFile(outputPath, webpBuffer);

  return {
    url: `/uploads/products/${filename}`,
    filename: filename,
    pathname: `/uploads/products/${filename}`,
    size: webpBuffer.length,
    mimeType: 'image/webp',
    storage: 'local',
    uploadedAt: new Date(),
  };
};

/**
 * Backward-compatible wrapper that returns the image URL
 * @param {Buffer} buffer 
 * @returns {Promise<string>}
 */
const convertToWebP = async (buffer) => {
  const result = await uploadImageToBlob(buffer);
  return result.url;
};

/**
 * Safely removes an image file from Vercel Blob or local disk
 * @param {string} fileUrl - Public Vercel Blob URL or local /uploads/ path
 */
const deleteImageFile = async (fileUrl) => {
  if (!fileUrl) return;

  const token = process.env.BLOB_READ_WRITE_TOKEN;

  // If Vercel Blob URL
  if (fileUrl.includes('vercel-storage.com') || fileUrl.includes('blob.vercel-storage.com')) {
    try {
      if (token) {
        await del(fileUrl, { token });
        console.log(`[Vercel Blob] Deleted image: ${fileUrl}`);
      }
    } catch (err) {
      console.error(`[Vercel Blob] Error deleting blob ${fileUrl}:`, err.message);
    }
    return;
  }

  // If local file
  if (fileUrl.startsWith('/uploads/products/')) {
    const filename = path.basename(fileUrl);
    const filePath = path.join(__dirname, '../uploads/products', filename);

    if (fs.existsSync(filePath)) {
      fs.unlink(filePath, (err) => {
        if (err) console.error(`Error deleting local image ${filePath}:`, err.message);
      });
    }
  }
};

module.exports = {
  uploadImageToBlob,
  convertToWebP,
  deleteImageFile,
  generateDateTimeFilename,
};
