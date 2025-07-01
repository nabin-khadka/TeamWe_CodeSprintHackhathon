const express = require('express');
const { Posting, User } = require('../models');
const { authenticate, sellerOnly } = require('../middleware/auth');

const router = express.Router();

// Create posting
router.post('/', authenticate, sellerOnly, async (req, res) => {
    try {
        const { title, description, price, category, images } = req.body;

        if (!title || !description || !price || !category) {
            return res.status(400).json({ error: 'Please provide all required fields' });
        }

        // Create posting
        const posting = new Posting({
            sellerId: req.user._id,
            title,
            description,
            price,
            category,
            images: images || []
        });

        await posting.save();

        res.status(201).json({ message: 'Posting created successfully', postingId: posting._id });
    } catch (error) {
        console.error('Create posting error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// List postings
router.get('/', async (req, res) => {
    try {
        const { category, sellerId, search } = req.query;
        let query = { active: true };

        if (category) {
            query.category = category;
        }

        if (sellerId) {
            query.sellerId = sellerId;
        }

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const postings = await Posting.find(query)
            .populate({
                path: 'sellerId',
                select: 'username sellerProfile.businessName sellerProfile.rating'
            })
            .sort({ createdAt: -1 });

        res.json(postings);
    } catch (error) {
        console.error('List postings error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get single posting
router.get('/:postingId', async (req, res) => {
    try {
        const { postingId } = req.params;

        const posting = await Posting.findById(postingId)
            .populate({
                path: 'sellerId',
                select: 'username sellerProfile.businessName sellerProfile.rating sellerProfile.contactInfo'
            });

        if (!posting || !posting.active) {
            return res.status(404).json({ error: 'Posting not found' });
        }

        res.json(posting);
    } catch (error) {
        console.error('Get posting error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
