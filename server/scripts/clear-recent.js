const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '../.env') });
mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const Product = require('../models/Product');
  const res = await Product.updateMany({ imageUrl: '/uploads/products/placeholder.webp' }, { $set: { imageUrl: '', imageFileName: '' } });
  console.log('Cleared ' + res.modifiedCount + ' products.');
  process.exit(0);
});
