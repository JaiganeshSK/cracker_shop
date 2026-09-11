const mongoose = require('mongoose');
const Admin = require('./models/Admin');
const dotenv = require('dotenv');
dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const admins = await Admin.find({});
  console.log('Admins in DB:', admins.map(a => a.username));
  process.exit(0);
}
run();
