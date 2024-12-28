const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const Vendor = require('../models/vendor');

// New order
router.post('/neworder', async (req, res) => {
  console.log('New order request:', req.body); // Debug log
  try {
    const { userId, products } = req.body;

    // Validate user
    const user = await User.findById(userId);
    if (!user) {
      console.error('User not found:', userId); // Log the user not found
      return res.status(404).send('User not found');
    }

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
      totalPrice: totalPrice.reduce((a, b) => a + b, 0),
      status: 'Ordered',
    });

    await order.save();

    // Push the order ID to the user's orders array
    user.orders.push(order._id);
    await user.save();

    res.status(201).send(order);
  } catch (error) {
    console.error('New order error:', error.message); // Log the error
    res.status(400).send(error.message);
  }
});


// Get all products
router.get('/', async (req, res) => {
  try {
    // Find all products and populate the vendorId field
    const products = await Product.find().populate('vendorId');
    res.status(200).send(products); // Respond with the list of products
  } catch (error) {
    res.status(400).send({ error: error.message }); // Send error message
  }
});

// Get product by ID
router.get('/:id', async (req, res) => {
  try {
    // Find product by ID and populate the vendorId field
    const product = await Product.findById(req.params.id).populate('vendorId');
    if (!product) return res.status(404).send('Product not found'); // Handle not found
    res.status(200).send(product); // Respond with the found product
  } catch (error) {
    res.status(400).send({ error: error.message }); // Send error message
  }
});

// Update product by ID
router.put('/:id', async (req, res) => {
  try {
    // Find product by ID and update it with the request body
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!product) return res.status(404).send('Product not found'); // Handle not found
    res.status(200).send(product); // Respond with the updated product
  } catch (error) {
    res.status(400).send({ error: error.message }); // Send error message
  }
});

// Delete product by ID
router.delete('/:id', async (req, res) => {
  try {
    // Find product by ID and delete it
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).send('Product not found'); // Handle not found
    res.status(200).send('Product deleted successfully'); // Respond with success message
  } catch (error) {
    res.status(400).send({ error: error.message }); // Send error message
  }
});

module.exports = router;
