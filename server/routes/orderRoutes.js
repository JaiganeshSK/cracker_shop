const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Setting = require('../models/Setting');
const { protect } = require('../middleware/authMiddleware');
const { sendOrderConfirmationEmail, sendAdminOrderNotification } = require('../utils/emailSender');

// Helper to generate readable WhatsApp Order Number
const generateOrderId = () => {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return `WA-${year}-${randomNum}`;
};

// @route   POST /api/orders
// @desc    Place a new customer order
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { customer, items, paymentMethod } = req.body;

    if (!customer || !customer.name || !customer.phone || !customer.address || !customer.pincode) {
      return res.status(400).json({
        success: false,
        message: 'Please provide full customer details (name, phone, address, pincode)',
      });
    }

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart items cannot be empty' });
    }

    // Fetch shop settings for minimum order calculation
    let minOrderValue = 0;
    try {
      const setting = await Setting.findOne();
      minOrderValue = setting?.minOrderValue || 0;
    } catch (_) {}

    // Validate and calculate totals
    let subtotal = 0;
    let mrpTotal = 0;
    const validatedItems = [];

    for (const item of items) {
      let product = null;
      if (item.productId && mongoose.Types.ObjectId.isValid(item.productId)) {
        try {
          product = await Product.findById(item.productId);
        } catch (_) {}
      }
      if (!product && item.name) {
        try {
          product = await Product.findOne({ name: item.name });
        } catch (_) {}
      }

      const qty = Math.max(1, parseInt(item.quantity) || 1);
      const price = product ? (Number(product.price) || 0) : (Number(item.price) || 0);
      const mrp = product ? (Number(product.mrp) || price) : (Number(item.mrp) || price);
      const itemSubtotal = price * qty;
      const itemMrpTotal = mrp * qty;

      subtotal += itemSubtotal;
      mrpTotal += itemMrpTotal;

      validatedItems.push({
        productId: product ? product._id : (item.productId && mongoose.Types.ObjectId.isValid(item.productId) ? item.productId : null),
        name: product ? product.name : (item.name || 'Festive Cracker'),
        piecePerBox: product ? product.piecePerBox : (item.piecePerBox || '1 Box'),
        price,
        mrp,
        quantity: qty,
        total: itemSubtotal,
      });
    }

    // Check minimum order restriction
    if (minOrderValue > 0 && subtotal < minOrderValue) {
      return res.status(400).json({
        success: false,
        message: `Minimum order value is ₹${minOrderValue}. Your current order total is ₹${subtotal}`,
      });
    }

    const deliveryFee = 0;
    const totalDiscount = Math.max(0, mrpTotal - subtotal);
    const totalAmount = subtotal;

    const orderId = generateOrderId();

    const newOrder = new Order({
      orderId,
      customer,
      items: validatedItems,
      subtotal,
      mrpTotal,
      totalDiscount,
      deliveryFee,
      totalAmount,
      paymentMethod: paymentMethod || 'WhatsApp Order',
      orderStatus: 'Pending',
      paymentStatus: 'Pending',
    });

    const savedOrder = await newOrder.save();

    // Fire both emails in background — does not block the API response
    Promise.all([
      sendOrderConfirmationEmail(savedOrder, setting),
      sendAdminOrderNotification(savedOrder, setting),
    ]).catch(err => console.error('[Email] Background send error:', err));

    res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      order: savedOrder,
    });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error creating order' });
  }
});

// @route   GET /api/orders/track/:query
// @desc    Track order by orderId or phone number
// @access  Public
router.get('/track/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const trimmed = query.trim();

    const orders = await Order.find({
      $or: [
        { orderId: trimmed.toUpperCase() },
        { 'customer.phone': trimmed },
        { 'customer.whatsapp': trimmed },
      ],
    }).sort({ createdAt: -1 });

    if (!orders || orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No orders found for the provided Order ID or Phone Number',
      });
    }

    res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    console.error('Order tracking error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving order status' });
  }
});

// @route   GET /api/orders/stats
// @desc    Get dashboard statistics
// @access  Private (Admin)
router.get('/stats', protect, async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ orderStatus: 'Pending' });
    const confirmedOrders = await Order.countDocuments({ orderStatus: 'Confirmed' });
    const packedOrders = await Order.countDocuments({ orderStatus: 'Packed' });
    const dispatchedOrders = await Order.countDocuments({ orderStatus: 'Dispatched' });
    const deliveredOrders = await Order.countDocuments({ orderStatus: 'Delivered' });

    // Aggregate total revenue from non-cancelled orders
    const revenueData = await Order.aggregate([
      { $match: { orderStatus: { $ne: 'Cancelled' } } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } },
    ]);
    const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;

    // Out of stock & total products
    const totalProducts = await Product.countDocuments();
    const outOfStockProducts = await Product.countDocuments({ inStock: false });

    // Recent 5 orders
    const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(5);

    res.json({
      success: true,
      stats: {
        totalRevenue,
        totalOrders,
        pendingOrders,
        confirmedOrders,
        packedOrders,
        dispatchedOrders,
        deliveredOrders,
        totalProducts,
        outOfStockProducts,
        recentOrders,
      },
    });
  } catch (error) {
    console.error('Fetch stats error:', error);
    res.status(500).json({ success: false, message: 'Error calculating dashboard stats' });
  }
});

// @route   GET /api/orders
// @desc    Get all orders with filtering
// @access  Private (Admin)
router.get('/', protect, async (req, res) => {
  try {
    const { status, search, limit = 50, page = 1, startDate, endDate } = req.query;
    const filter = {};

    if (status && status !== 'All') {
      filter.orderStatus = status;
    }

    if (search) {
      filter.$or = [
        { orderId: { $regex: search, $options: 'i' } },
        { 'customer.name': { $regex: search, $options: 'i' } },
        { 'customer.phone': { $regex: search, $options: 'i' } },
        { 'customer.city': { $regex: search, $options: 'i' } },
      ];
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999); // Set to end of the day
        filter.createdAt.$lte = end;
      }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Order.countDocuments(filter);
    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      orders,
    });
  } catch (error) {
    console.error('Fetch orders error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching orders' });
  }
});

// @route   GET /api/orders/:id
// @desc    Get single order details
// @access  Private (Admin)
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching order' });
  }
});

// @route   PATCH /api/orders/:id/status
// @desc    Update order status, tracking number, or notes
// @access  Private (Admin)
router.patch('/:id/status', protect, async (req, res) => {
  try {
    const { orderStatus, paymentStatus, trackingNumber, adminNotes } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (orderStatus) order.orderStatus = orderStatus;
    if (paymentStatus) order.paymentStatus = paymentStatus;
    if (trackingNumber !== undefined) order.trackingNumber = trackingNumber;
    if (adminNotes !== undefined) order.adminNotes = adminNotes;

    const updatedOrder = await order.save();
    res.json({
      success: true,
      message: 'Order updated successfully',
      order: updatedOrder,
    });
  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({ success: false, message: 'Server error updating order' });
  }
});

// @route   DELETE /api/orders/:id
// @desc    Delete an order
// @access  Private (Admin)
router.delete('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.json({ success: true, message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error deleting order' });
  }
});

module.exports = router;
