const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      index: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    mrp: {
      type: Number,
      required: [true, 'MRP is required'],
      min: 0,
    },
    price: {
      type: Number,
      required: [true, 'Selling price is required'],
      min: 0,
    },
    discountPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    piecePerBox: {
      type: String,
      default: '1 Box',
      trim: true,
    },
    imageUrl: {
      type: String,
      default: '/uploads/products/placeholder.webp',
    },
    imageFileName: {
      type: String,
      default: '',
      trim: true,
    },
    soundLevel: {
      type: String,
      enum: ['Silent / Visual', 'Mild Sound', 'Loud Sound', 'Musical / Whistling'],
      default: 'Mild Sound',
    },
    inStock: {
      type: Boolean,
      default: true,
      index: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-calculate discount percentage before saving if not provided
productSchema.pre('save', function (next) {
  if (this.mrp > 0 && this.price >= 0) {
    this.discountPercentage = Math.round(((this.mrp - this.price) / this.mrp) * 100);
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);
