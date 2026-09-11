const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const { protect } = require('../middleware/authMiddleware');
const rateLimit = require('express-rate-limit');

// Strict rate limiter for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 login requests per window
  message: { success: false, message: 'Too many login attempts from this IP, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Helper to sign JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'cracker_festive_secret_key_2026_super_secure', {
    expiresIn: '30d',
  });
};

// @route   POST /api/auth/login
// @desc    Admin authentication & token issuance
// @access  Public
router.post('/login', authLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Please provide username and password' });
    }

    const admin = await Admin.findOne({ username: username.toLowerCase().trim() });
    if (!admin) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await admin.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken(admin._id);

    res.json({
      success: true,
      message: 'Logged in successfully',
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        name: admin.name,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during authentication' });
  }
});

// @route   GET /api/auth/me
// @desc    Get current authenticated admin
// @access  Private (Admin)
router.get('/me', protect, async (req, res) => {
  res.json({
    success: true,
    admin: {
      id: req.admin._id,
      username: req.admin.username,
      name: req.admin.name,
      role: req.admin.role,
    },
  });
});

// @route   PUT /api/auth/password
// @desc    Update admin password
// @access  Private (Admin)
router.put('/password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide current and new passwords' });
    }

    const admin = await Admin.findById(req.admin._id);
    const isMatch = await admin.matchPassword(currentPassword);

    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password does not match' });
    }

    admin.password = newPassword;
    await admin.save();

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('Password update error:', error);
    res.status(500).json({ success: false, message: 'Server error updating password' });
  }
});

// @route   POST /api/auth/forgot-password
// @desc    Send OTP to email for password reset
// @access  Public
router.post('/forgot-password', async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) {
      return res.status(400).json({ success: false, message: 'Please provide your email ID' });
    }

    const admin = await Admin.findOne({ username: username.toLowerCase().trim() });
    if (!admin) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set expiry to 10 minutes
    admin.resetOtp = otp;
    admin.resetOtpExpire = Date.now() + 10 * 60 * 1000;
    await admin.save();

    // Send email using Resend
    const { Resend } = require('resend');
    const resend = new Resend(process.env.RESEND_API_KEY || 're_McZsmFqe_8KWUXM7puWGaXPmTLPeekMiP');

    const emailHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f7f6; color: #333333; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f4f7f6; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); max-width: 600px; width: 100%;">
                <!-- Header Image/Color -->
                <tr>
                  <td align="center" style="background: linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%); padding: 40px 20px;">
                    <img src="https://cdn-icons-png.flaticon.com/512/6146/6146586.png" alt="Security Lock" width="72" height="72" style="display: block; margin: 0 auto; filter: brightness(0) invert(1);" />
                    <h1 style="color: #ffffff; margin: 20px 0 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">Security Verification</h1>
                  </td>
                </tr>
                <!-- Body Content -->
                <tr>
                  <td style="padding: 40px 40px 30px;">
                    <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #4b5563;">
                      Hi there,
                    </p>
                    <p style="margin: 0 0 30px; font-size: 16px; line-height: 1.6; color: #4b5563;">
                      We received a request to reset the password for your admin account. Please use the verification code below to securely change your password.
                    </p>
                    <!-- OTP Box -->
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 30px;">
                      <tr>
                        <td align="center">
                          <div style="background-color: #fff1f2; border: 2px dashed #fda4af; border-radius: 12px; padding: 24px; display: inline-block;">
                            <span style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 900; color: #e11d48; letter-spacing: 8px;">${otp}</span>
                          </div>
                        </td>
                      </tr>
                    </table>
                    <p style="margin: 0 0 20px; font-size: 14px; line-height: 1.6; color: #6b7280;">
                      <strong style="color: #374151;">Note:</strong> This verification code is valid for the next <strong>10 minutes</strong>. Please do not share this code with anyone.
                    </p>
                    <p style="margin: 0 0 10px; font-size: 14px; line-height: 1.6; color: #6b7280;">
                      If you did not request a password reset, please ignore this email or contact support if you have concerns.
                    </p>
                  </td>
                </tr>
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f9fafb; border-top: 1px solid #f3f4f6; padding: 24px 40px; text-align: center;">
                    <p style="margin: 0; font-size: 13px; color: #9ca3af;">
                      &copy; ${new Date().getFullYear()} Cracker Shop Admin Portal. All rights reserved.
                    </p>
                    <p style="margin: 8px 0 0; font-size: 12px; color: #d1d5db;">
                      This is an automated message, please do not reply.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const { data, error } = await resend.emails.send({
      from: 'Admin Portal <onboarding@resend.dev>', // Resend testing domain or change to verified domain
      to: admin.username, // Assuming username is email
      subject: 'Your Password Reset OTP',
      html: emailHtml,
    });

    if (error) {
      console.error('Resend error:', error);
      return res.status(500).json({ success: false, message: 'Error sending email' });
    }

    res.json({ success: true, message: 'OTP sent to your email' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ success: false, message: 'Server error processing request' });
  }
});

// @route   POST /api/auth/reset-password
// @desc    Verify OTP and reset password
// @access  Public
router.post('/reset-password', async (req, res) => {
  try {
    const { username, otp, newPassword } = req.body;
    
    if (!username || !otp || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide email, OTP, and new password' });
    }

    const admin = await Admin.findOne({ 
      username: username.toLowerCase().trim(),
      resetOtp: otp,
      resetOtpExpire: { $gt: Date.now() }
    });

    if (!admin) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    // Reset password
    admin.password = newPassword;
    admin.resetOtp = null;
    admin.resetOtpExpire = null;
    await admin.save();

    res.json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, message: 'Server error resetting password' });
  }
});

module.exports = router;
