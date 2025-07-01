const express = require('express');
const { User, Session } = require('../models');
const { authenticate } = require('../middleware/auth');
const { generateToken, validateEmail, validatePhone, formatErrorResponse } = require('../utils/helpers');

const router = express.Router();

// Register user
router.post('/register', async (req, res) => {
    try {
        const {
            username,
            email,
            phone,
            password,
            userType,
            profileImage,
            address,
            // Buyer specific
            preferredCategories,
            deliveryAddress,
            // Seller specific
            businessName,
            businessType,
            businessDescription,
            businessImage,
            businessLicense,
            bankAccount,
            contactInfo
        } = req.body;

        // Basic validation
        if (!username || !email || !phone || !password || !userType) {
            return res.status(400).json({
                error: 'Please provide all required fields (username, email, phone, password, userType)'
            });
        }

        // Validate user type
        if (!['buyer', 'seller'].includes(userType)) {
            return res.status(400).json({ error: 'User type must be either "buyer" or "seller"' });
        }

        // Validate phone format
        if (!validatePhone(phone)) {
            return res.status(400).json({ error: 'Phone number must be in +977XXXXXXXXXX format' });
        }

        // Email validation
        if (!validateEmail(email)) {
            return res.status(400).json({ error: 'Please provide a valid email address' });
        }

        // Seller specific validation
        if (userType === 'seller') {
            if (!businessName || !businessType || !contactInfo) {
                return res.status(400).json({
                    error: 'Sellers must provide business name, business type, and contact info'
                });
            }
        }

        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [{ username }, { email }, { phone }]
        });
        if (existingUser) {
            return res.status(400).json({ error: 'Username, email, or phone already in use' });
        }

        // Prepare user data
        const userData = {
            username,
            email,
            phone,
            password, // TODO: Hash password for security
            userType,
            profileImage: profileImage || '',
            address: address || ''
        };

        // Add user type specific data
        if (userType === 'buyer') {
            userData.buyerProfile = {
                preferredCategories: preferredCategories || [],
                deliveryAddress: deliveryAddress || address || ''
            };
        } else if (userType === 'seller') {
            userData.sellerProfile = {
                businessName,
                businessType,
                businessDescription: businessDescription || '',
                businessImage: businessImage || '',
                businessLicense: businessLicense || '',
                bankAccount: bankAccount || '',
                contactInfo,
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

        // Set cookie
        res.cookie('session', token, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        // Prepare response data
        const responseData = {
            message: 'User registered successfully',
            userId: user._id,
            userType: user.userType,
            user: {
                username: user.username,
                email: user.email,
                phone: user.phone,
                userType: user.userType,
                profileImage: user.profileImage,
                address: user.address
            }
        };

        // Add type-specific data to response
        if (userType === 'buyer') {
            responseData.user.buyerProfile = user.buyerProfile;
        } else if (userType === 'seller') {
            responseData.user.sellerProfile = user.sellerProfile;
        }

        res.status(201).json(responseData);

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: formatErrorResponse(error) });
    }
});

// Login user
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Find user
        const user = await User.findOne({ email, isActive: true });
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

        // Set cookie
        res.cookie('session', token, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        // Prepare response
        const responseData = {
            message: 'Login successful',
            userId: user._id,
            userType: user.userType,
            user: {
                username: user.username,
                email: user.email,
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
