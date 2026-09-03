const express = require('express');
const router = express.Router();
const Setting = require('../models/Setting');
const { protect } = require('../middleware/authMiddleware');

// @route   GET /api/settings
// @desc    Get current store settings
// @access  Public
router.get('/', async (req, res) => {
  try {
    let setting = await Setting.findOne();
    if (!setting) {
      setting = await Setting.create({});
    }
    res.json({ success: true, setting });
  } catch (error) {
    console.error('Fetch settings error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching store settings' });
  }
});

// @route   PUT /api/settings
// @desc    Update store settings
// @access  Private (Admin)
router.put('/', protect, async (req, res) => {
  try {
    let setting = await Setting.findOne();
    if (!setting) {
      setting = new Setting(req.body);
    } else {
      Object.assign(setting, req.body);
    }

    const savedSetting = await setting.save();
    res.json({
      success: true,
      message: 'Store settings updated successfully',
      setting: savedSetting,
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ success: false, message: 'Server error updating store settings' });
  }
});

module.exports = router;
