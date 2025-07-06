const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
require('dotenv').config();
const Razorpay = require('razorpay');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// ✅ MongoDB Connection
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch((err) => console.log('❌ MongoDB Error:', err));

// ✅ Product Schema
const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  image: String,
});
const Product = mongoose.model('Product', productSchema);

// ✅ Add Product
app.post('/add-product', async (req, res) => {
  const { name, price, image } = req.body;
  const newProduct = new Product({ name, price, image });
  await newProduct.save();
  res.json({ message: '✅ Product Added' });
});

// ✅ Get Products
app.get('/products', async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

// ✅ Razorpay Config
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ✅ Create Razorpay Order
app.post('/create-order', async (req, res) => {
  const { amount } = req.body;
  const options = {
    amount: amount * 100,
    currency: 'INR',
    receipt: 'cloth-aura-order_' + Date.now(),
  };
  try {
    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: '❌ Failed to create order' });
  }
});

// ✅ Root route for Render test
app.get('/', (req, res) => {
  res.send('🧵 Cloth Aura Backend is Live!');
});

// ✅ Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
