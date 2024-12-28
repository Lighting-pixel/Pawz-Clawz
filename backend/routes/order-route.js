const express = require('express');
const router = express.Router();
const Order = require('../models/order');
const User = require('../models/user');
const Product = require('../models/product');

router.post('/neworder', async (req, res) => {
  try {
    const { userId, products } = req.body; // Get userId and products from the request body

    // Validate user
    const user = await User.findById(userId);
    if (!user) return res.status(404).send('User not found');

    // Validate products and calculate total price
    const totalPrice = await Promise.all(products.map(async (item) => {
      const product = await Product.findById(item.productId);
      if (!product) {
        throw new Error(`Product with ID ${item.productId} not found`);
      }
      return product.price * item.quantity;
    }));

    // Create the order
    const order = new Order({
      userId,
      products,
      totalPrice: totalPrice.reduce((a, b) => a + b, 0), // Calculate total price
      status: 'Ordered', // Set default status
    });

    await order.save(); // Save the order to the database

    // Push the order ID to the user's orders array
    user.orders.push(order._id);
    await user.save(); // Save the updated user document

    res.status(201).send(order); // Send the created order as response
  } catch (error) {
    res.status(400).send(error.message); // Send error message
  }
});


// Get all orders
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('userId', 'profile.name') // Populate user name
      .populate('products.productId', 'name price'); // Populate product name and price
    res.status(200).send(orders);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Get all orders for a specific user
router.get('/user/:userId', async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId })
      .populate({
        path: 'products.productId', // Correctly access the nested productId
        select: 'name price image' // Include 'image' in the selection
      })
      .populate('userId', 'profile.name'); // Optionally populate user name

    if (!orders || orders.length === 0) return res.status(404).json({ message: 'No orders found for this user' });

    res.status(200).json(orders);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


// Get order by ID
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('userId', 'name') // Populate user name
      .populate('products.productId', 'name price'); // Populate product name and price
    if (!order) return res.status(404).send('Order not found');
    res.status(200).send(order);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Update order by ID
router.put('/:id', async (req, res) => {
  try {
    const { userId, products, totalPrice, status } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { userId, products, totalPrice, status }, { new: true, runValidators: true });

    if (!order) return res.status(404).send('Order not found');

    // Validate user and product references
    const user = await User.findById(userId);
    if (!user) return res.status(404).send('User not found');

    for (let item of products) {
      const product = await Product.findById(item.productId);
      if (!product) return res.status(404).send(`Product with ID ${item.productId} not found`);
    }

    res.status(200).send(order);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Delete order by ID
router.delete('/:id', async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).send('Order not found');
    res.status(200).send('Order deleted successfully');
  } catch (error) {
    res.status(400).send(error);
  }
});

module.exports = router;
