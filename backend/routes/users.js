const express = require('express');
const { User } = require('../models');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Get current user info
router.get('/me', authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            userId: user._id,
            username: user.username,
            email: user.email,
            phone: user.phone,
            userType: user.userType,
            profileImage: user.profileImage,
            address: user.address,
            buyerProfile: user.buyerProfile,
            sellerProfile: user.sellerProfile,
            isActive: user.isActive,
            createdAt: user.createdAt
        });
    } catch (error) {
        console.error('Get user info error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update user profile
router.put('/profile', authenticate, async (req, res) => {
    try {
        const {
            username,
            profileImage,
            address,
            buyerProfile,
            sellerProfile
        } = req.body;

        const updateData = {};
        if (username) updateData.username = username;
        if (profileImage) updateData.profileImage = profileImage;
        if (address) updateData.address = address;

        if (req.user.userType === 'buyer' && buyerProfile) {
            updateData.buyerProfile = buyerProfile;
        }

        if (req.user.userType === 'seller' && sellerProfile) {
            updateData.sellerProfile = sellerProfile;
        }

        const user = await User.findByIdAndUpdate(
            req.user._id,
            updateData,
            { new: true, select: '-password' }
        );

        res.json({ message: 'Profile updated successfully', user });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
