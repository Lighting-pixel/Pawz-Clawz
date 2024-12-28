const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  profile: {
    name: {
      type: String,
      required: true
    },
    address: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    profilePicture: {
      type: String, // This can store the URL of the profile picture
      required: false // Make it optional if users may not upload it
    }
  },
  orders: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  }]
}, { timestamps: true }); // Keep track of createdAt and updatedAt

// Check if the model is already defined
const User = mongoose.models.User || mongoose.model('User', userSchema);

module.exports = User;
