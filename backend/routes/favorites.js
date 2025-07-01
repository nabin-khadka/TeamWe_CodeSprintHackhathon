const express = require('express');
const { User } = require('../models');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Get user's favorites
router.get('/', authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('favorites');

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Populate favorites with user details
        const populatedUser = await User.findById(req.user._id)
            .populate({
                path: 'favorites',
                select: 'name phone userType sellerProfile.businessName sellerProfile.contactInfo'
            });

        res.json(populatedUser.favorites || []);
    } catch (error) {
        console.error('Get favorites error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Add to favorites
router.post('/:userId', authenticate, async (req, res) => {
    try {
        const { userId } = req.params;

        // Check if the user to be favorited exists
        const targetUser = await User.findById(userId);
        if (!targetUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Prevent users from favoriting themselves
        if (userId === req.user._id.toString()) {
            return res.status(400).json({ error: 'Cannot favorite yourself' });
        }

        // Add to current user's favorites
        const user = await User.findById(req.user._id);
        if (!user.favorites) {
            user.favorites = [];
        }

        // Check if already in favorites
        if (user.favorites.includes(userId)) {
            return res.status(400).json({ error: 'User already in favorites' });
        }

        user.favorites.push(userId);
        await user.save();

        res.json({ message: 'Added to favorites successfully' });
    } catch (error) {
        console.error('Add favorite error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Remove from favorites
router.delete('/:userId', authenticate, async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(req.user._id);
        if (!user.favorites) {
            return res.status(404).json({ error: 'No favorites found' });
        }

        // Remove from favorites
        user.favorites = user.favorites.filter(id => id.toString() !== userId);
        await user.save();

        res.json({ message: 'Removed from favorites successfully' });
    } catch (error) {
        console.error('Remove favorite error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
