const mongoose = require('mongoose');
const Admin = require('./models/Admin');
const dotenv = require('dotenv');
dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  let admin = await Admin.findOne({ username: 'admin' });
  if (admin) {
    admin.username = 'pradhikacrackers@gmail.com';
    await admin.save();
    console.log('Successfully updated username from admin to pradhikacrackers@gmail.com');
  } else {
    admin = await Admin.findOne({ username: 'pradhikacrackers@gmail.com' });
    if(admin) {
        console.log('pradhikacrackers@gmail.com already exists.');
    } else {
        admin = new Admin({
            username: 'pradhikacrackers@gmail.com',
            password: 'Pradhika@123',
            name: 'Store Administrator',
            role: 'admin',
        });
        await admin.save();
        console.log('Created new admin pradhikacrackers@gmail.com');
    }
  }
  process.exit(0);
}
run();
