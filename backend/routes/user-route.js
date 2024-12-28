const express = require('express');
const router = express.Router();
const User = require('../models/user');

// Get all users
router.get('/', async (req, res) => {
  try {
    const users = await User.find().select('-password'); // Exclude password from response
    res.status(200).send(users);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password'); // Exclude password from response
    if (!user) return res.status(404).send('User not found');
    res.status(200).send(user);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Update user by ID (Partial Update)
router.put('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).send('User not found');

    // Only update fields that are provided in the request body
    if (req.body.profile) {
      user.profile.name = req.body.profile.name || user.profile.name;
      user.profile.address = req.body.profile.address || user.profile.address;
      user.profile.phone = req.body.profile.phone || user.profile.phone;
      user.profile.image = req.body.profile.image || user.profile.image; // Retain existing image if not provided
    }
    if (req.body.email) user.email = req.body.email; // Update email if provided
    if (req.body.username) user.username = req.body.username; // Update username if provided

    const updatedUser = await user.save(); // Save the updated user document
    res.status(200).send(updatedUser);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Delete user by ID
router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).send('User not found');
    res.status(200).send('User deleted successfully');
  } catch (error) {
    res.status(400).send(error);
  }
});

module.exports = router;
