const express = require('express');
const router = express.Router();
const Cart = require('../models/cart');

// Middleware to check if userId is provided
const checkUserId = (req, res, next) => {
  if (!req.body.userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }
  next();
};

// Add to cart
router.post('/add-to-cart', checkUserId, async (req, res) => {
  const { userId, productId, quantity } = req.body;
  console.log('Add to cart request:', { userId, productId, quantity }); // Debug log

  try {
    let cart = await Cart.findOne({ userId });

    if (cart) {
      // If cart exists for the user, update the cart
      const productIndex = cart.products.findIndex(p => p.productId.toString() === productId);
      if (productIndex > -1) {
        cart.products[productIndex].quantity += quantity;
        console.log('Updated product quantity:', cart.products[productIndex]); // Debug log
      } else {
        cart.products.push({ productId, quantity });
        console.log('Added new product to cart:', { productId, quantity }); // Debug log
      }
    } else {
      // If no cart exists, create a new one
      cart = new Cart({ userId, products: [{ productId, quantity }] });
      console.log('Created new cart:', cart); // Debug log
    }

    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    console.error('Add to cart error:', error.message); // Log the error
    res.status(500).json({ error: error.message });
  }
});


// View cart
router.get('/:userId', async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.params.userId }).populate('products.productId', 'name price image');
    if (!cart) return res.status(404).json({ message: 'No cart found for this user' });
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update cart (e.g., update quantity)
router.put('/update-cart', async (req, res) => {
  const { userId, productId, quantity } = req.body;

  try {
    const cart = await Cart.findOne({ userId });

    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    const productIndex = cart.products.findIndex(p => p.productId.toString() === productId);
    if (productIndex > -1) {
      cart.products[productIndex].quantity = quantity;
      await cart.save();
      return res.status(200).json(cart);
    } else {
      return res.status(404).json({ message: 'Product not found in cart' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Remove product from cart
router.delete('/remove-from-cart', async (req, res) => {
  const { userId, productId } = req.body;

  try {
    const cart = await Cart.findOne({ userId });

    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    cart.products = cart.products.filter(p => p.productId.toString() !== productId);
    await cart.save();

    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Clear cart
router.delete('/clear-cart/:userId', async (req, res) => {
  try {
    await Cart.findOneAndDelete({ userId: req.params.userId });
    res.status(200).json({ message: 'Cart cleared successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
