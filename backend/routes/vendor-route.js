const express = require('express');
const router = express.Router();
const Vendor = require('../models/vendor');

// Create a new vendor (register)
router.post('/register', async (req, res) => {
  try {
    const vendor = new Vendor(req.body);
    await vendor.save();
    res.status(201).send(vendor);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

// Vendor login
router.post('/login', async (req, res) => {
  try {
    const { email, phone } = req.body;

    // Find vendor by email and phone
    const vendor = await Vendor.findOne({ email, phone });
    if (!vendor) {
      return res.status(401).send({ error: 'Invalid email or phone number' });
    }

    res.status(200).send(vendor);
  } catch (error) {
    res.status(500).send({ error: 'Internal Server Error' });
  }
});

// Get all vendors
router.get('/', async (req, res) => {
  try {
    const vendors = await Vendor.find().populate('products'); // Adjust the population field as necessary
    res.status(200).send(vendors);
  } catch (error) {
    res.status(500).send({ error: 'Internal Server Error' });
  }
});

// Get vendor by ID with populated products
router.get('/:id', async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id).populate('products');
    if (!vendor) return res.status(404).send({ error: 'Vendor not found' });
    res.status(200).send(vendor);
  } catch (error) {
    res.status(500).send({ error: 'Internal Server Error' });
  }
});

// Update vendor by ID
router.put('/:id', async (req, res) => {
  try {
    const vendor = await Vendor.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!vendor) return res.status(404).send({ error: 'Vendor not found' });
    res.status(200).send(vendor);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

// Delete vendor by ID
router.delete('/:id', async (req, res) => {
  try {
    const vendor = await Vendor.findByIdAndDelete(req.params.id);
    if (!vendor) return res.status(404).send({ error: 'Vendor not found' });
    res.status(200).send({ message: 'Vendor deleted successfully' });
  } catch (error) {
    res.status(500).send({ error: 'Internal Server Error' });
  }
});

module.exports = router;
