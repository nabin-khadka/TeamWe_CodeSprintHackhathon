const express = require('express');
const { User, Session } = require('../models');
const { authenticate } = require('../middleware/auth');
const { generateToken, validateEmail, validatePhone, formatErrorResponse } = require('../utils/helpers');

const router = express.Router();

// Register user
router.post('/register', async (req, res) => {
    try {
        const {
            name,
            phone,
            password,
            confirmPassword,
            address,
            profileImage,
            userType = 'buyer' // Default to buyer
        } = req.body;

        // Basic validation
        if (!name || !phone || !password) {
            return res.status(400).json({
                error: 'Please provide all required fields (name, phone, password)'
            });
        }

        // Password confirmation check
        if (password !== confirmPassword) {
            return res.status(400).json({ error: 'Passwords do not match' });
        }

        // Validate phone format
        if (!validatePhone(phone)) {
            return res.status(400).json({ error: 'Phone number must be in +977XXXXXXXXXX format' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ phone });
        if (existingUser) {
            return res.status(400).json({ error: 'Phone number already registered' });
        }

        // Prepare user data
        const userData = {
            name,
            phone,
            password, // TODO: Hash password for security
            userType,
            profileImage: profileImage || '',
            address: address || ''
        };

        // Add user type specific data
        if (userType === 'buyer') {
            userData.buyerProfile = {
                preferredCategories: [],
                deliveryAddress: address || ''
            };
        } else if (userType === 'seller') {
            userData.sellerProfile = {
                businessName: '',
                businessType: '',
                businessDescription: '',
                businessImage: '',
                businessLicense: '',
                bankAccount: '',
                contactInfo: phone,
                rating: 0
            };
        }

        // Create new user
        const user = new User(userData);
        await user.save();

        // Generate session token for immediate login
        const token = generateToken();
        const session = new Session({
            userId: user._id,
            token
        });
        await session.save();

        // Prepare response data
        const responseData = {
            message: 'User registered successfully',
            userId: user._id,
            userType: user.userType,
            token,
            user: {
                name: user.name,
                phone: user.phone,
                userType: user.userType,
                profileImage: user.profileImage,
                address: user.address
            }
        };

        res.status(201).json(responseData);

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: formatErrorResponse(error) });
    }
});

// Login user
router.post('/login', async (req, res) => {
    try {
        const { phone, password } = req.body;

        if (!phone || !password) {
            return res.status(400).json({ error: 'Phone and password are required' });
        }

        // Find user
        const user = await User.findOne({ phone, isActive: true });
        if (!user || user.password !== password) { // TODO: Implement password hashing
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate session token
        const token = generateToken();

        // Store session
        const session = new Session({
            userId: user._id,
            token
        });

        await session.save();

        // Prepare response
        const responseData = {
            message: 'Login successful',
            userId: user._id,
            userType: user.userType,
            token,
            user: {
                name: user.name,
                phone: user.phone,
                userType: user.userType,
                profileImage: user.profileImage,
                address: user.address
            }
        };

        // Add type-specific data
        if (user.userType === 'buyer') {
            responseData.user.buyerProfile = user.buyerProfile;
        } else if (user.userType === 'seller') {
            responseData.user.sellerProfile = user.sellerProfile;
        }

        res.json(responseData);
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error during login' });
    }
});

// Logout user
router.post('/logout', authenticate, async (req, res) => {
    try {
        const token = req.cookies.session || req.headers.authorization;
        await Session.deleteOne({ token });
        res.clearCookie('session');
        res.json({ message: 'Logout successful' });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
