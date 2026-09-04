const mongoose = require('mongoose');

const uploadSchema = new mongoose.Schema(
  {
    filename: {
      type: String,
      required: [true, 'Filename is required'],
      trim: true,
      index: true,
    },
    url: {
      type: String,
      required: [true, 'File URL is required'],
      trim: true,
    },
    originalName: {
      type: String,
      trim: true,
    },
    mimeType: {
      type: String,
      default: 'image/webp',
    },
    size: {
      type: Number,
      default: 0,
    },
    storage: {
      type: String,
      default: 'vercel-blob',
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Upload', uploadSchema);
