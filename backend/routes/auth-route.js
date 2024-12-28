const express = require('express');
const router = express.Router();
const User = require('../models/user');

// User Login
router.post('/login', async (req, res) => {
    try {
        // Log incoming data for debugging
        console.log("Login Request Body:", req.body);

        // Destructure and validate request body
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).send('Username and password are required');
        }

        // Find user by username
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).send('Invalid credentials'); // User not found
        }

        // Check if password matches
        if (password !== user.password) {
            return res.status(401).send('Invalid password'); // Password mismatch
        }

        // Omit password from response
        const { password: _, ...userData } = user.toObject();
        res.status(200).json(userData);
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).send('Internal Server Error');
    }
});

// User Registration
router.post('/register', async (req, res) => {
    try {
        // Log incoming data for debugging
        console.log("Register Request Body:", req.body);

        // Destructure and validate request body
        const { username, password, email, profile } = req.body;
        if (!username || !password || !email) {
            return res.status(400).send('Username, password, and email are required');
        }

        // Check if username or email already exists
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.status(400).send('Username or email already exists');
        }

        // Create new user
        const user = new User({
            username,
            email,
            password,
            profile: {
                ...profile,
                profilePicture: profile?.profilePicture || '', // Default if not provided
            },
        });
        await user.save();

        // Respond with newly created user (omit password)
        const { password: _, ...userData } = user.toObject();
        res.status(201).json(userData);
    } catch (error) {
        console.error("Register Error:", error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
