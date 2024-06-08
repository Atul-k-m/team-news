const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const JWT_SECRET = 'qwer1234';
const router = express.Router();
require('dotenv').config();

// Helper function to validate email
const validateEmail = (email) => {
    const re = /.+\@.+\..+/;
    return re.test(String(email).toLowerCase());
};

// Register
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    // Validate email
    if (!validateEmail(email)) {
        return res.status(400).json({ message: 'Invalid email format' });
    }

    // Validate password (alphanumeric and at least 8 characters)
    if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(password)) {
        return res.status(400).json({ message: 'Password must be at least 8 characters long and contain both letters and numbers' });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Log raw password
        console.log('Raw Password:', password);

        const newUser = new User({ username, email, password });
        await newUser.save();
        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        console.error('Registration error:', error.message);
        res.status(500).json({ error: 'Server error' });
    }
});

// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    console.log(req.body)
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ token });
    } catch (error) {
        console.error('Login error:', error.message);
        res.status(500).json({ error: 'Server error' });
    }
});
// Update user settings
router.post('/update-settings', async (req, res) => {
    const { userId, defaultGenre, theme, language, country, state, city } = req.body;

    try {
        // Find the user by ID and update their settings
        const user = await User.findByIdAndUpdate(
            userId,
            { defaultGenre, theme, language, country, state, city },
            { new: true } // Return the updated document
        );

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'Settings updated successfully', user });
    } catch (error) {
        console.error('Update settings error:', error.message);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
