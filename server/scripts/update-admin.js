const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../.env') });

const connectDB = require('../config/db');
const Admin = require('../models/Admin');

async function updateAdminCredentials() {
  try {
    console.log('[Script] Connecting to MongoDB...');
    await connectDB();

    const username = (process.env.ADMIN_USERNAME || 'pradhikacrackers@gmail.com').toLowerCase().trim();
    const newPassword = process.env.ADMIN_PASSWORD || 'Pradhika@123';

    let admin = await Admin.findOne({ username });

    if (!admin) {
      console.log(`[Script] No existing admin found with username "${username}". Creating new admin...`);
      admin = new Admin({
        username,
        password: newPassword,
        name: 'Store Administrator',
        role: 'admin',
      });
    } else {
      console.log(`[Script] Found existing admin account for "${username}". Updating password...`);
      admin.password = newPassword;
    }

    await admin.save();
    console.log(`[Script] Admin account successfully updated.`);

    // Verification check
    const isMatch = await admin.matchPassword(newPassword);
    if (!isMatch) {
      throw new Error('Password verification check failed after save.');
    }
    console.log(`[Script] Password verification check: PASS (bcrypt hash verified).`);

    const isOldMatch = await admin.matchPassword('admin123');
    console.log(`[Script] Old password rejection check: ${!isOldMatch ? 'PASS (rejected)' : 'FAIL (still accepted)'}`);

    process.exit(0);
  } catch (err) {
    console.error('[Script] Error updating admin credentials:', err);
    process.exit(1);
  }
}

updateAdminCredentials();
