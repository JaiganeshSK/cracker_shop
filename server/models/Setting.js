const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema(
  {
    shopName: {
      type: String,
      default: 'Festive Spark Fireworks',
    },
    logoUrl: {
      type: String,
      default: '',
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
    instagram: {
      type: String,
      default: '',
    },
    showChatWidget: {
      type: Boolean,
      default: true,
    },
    chatWidgetGreeting: {
      type: String,
      default: 'Hi there! Have questions about crackers, pricing, or your order? Connect with us directly on WhatsApp or Instagram!',
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
      default: 0,
    },
    defaultDeliveryFee: {
      type: Number,
      default: 0,
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
    priceListUrl: {
      type: String,
      default: '',
    },
    priceListFileName: {
      type: String,
      default: '',
    },
    priceListUploadedAt: {
      type: Date,
    },
    showPriceListNotice: {
      type: Boolean,
      default: true,
    },
    priceListNoticeText: {
      type: String,
      default: '💥 Diwali 2026 Wholesale Rate Card Available - View & Download PDF',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Setting', settingSchema);
