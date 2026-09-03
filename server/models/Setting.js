const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema(
  {
    shopName: {
      type: String,
      default: 'Festive Spark Fireworks',
    },
    tagline: {
      type: String,
      default: 'Direct from Sivakasi Factory • Premium Green Crackers',
    },
    phone: {
      type: String,
      default: '+91 98765 43210',
    },
    whatsapp: {
      type: String,
      default: '+91 98765 43210',
    },
    email: {
      type: String,
      default: 'orders@festivespark.com',
    },
    address: {
      type: String,
      default: '124, Sivakasi Main Road, Sivakasi, Tamil Nadu - 626123',
    },
    minOrderValue: {
      type: Number,
      default: 3000,
    },
    freeDeliveryAbove: {
      type: Number,
      default: 10000,
    },
    defaultDeliveryFee: {
      type: Number,
      default: 250,
    },
    announcementText: {
      type: String,
      default: '💥 Diwali Mega Booking Open! Flat 80% Discount on all Sivakasi Crackers • Safe Nationwide Transport',
    },
    isAnnouncementActive: {
      type: Boolean,
      default: true,
    },
    upiId: {
      type: String,
      default: 'festivespark@upi',
    },
    upiQrUrl: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Setting', settingSchema);
