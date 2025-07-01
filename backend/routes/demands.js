const express = require('express');
const { Demand, User } = require('../models');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Create demand
router.post('/', authenticate, async (req, res) => {
    try {
        const { productType, productName, quantity, deliveryDate, deliveryLocation, coordinates } = req.body;

        // Validate required fields
        if (!productType || !productName || !quantity || !deliveryDate || !deliveryLocation || !coordinates) {
            return res.status(400).json({ error: 'Please provide all required fields' });
        }

        // Validate coordinates
        if (!coordinates.latitude || !coordinates.longitude) {
            return res.status(400).json({ error: 'Please provide valid coordinates' });
        }

        // Create demand
        const demand = new Demand({
            buyerId: req.user._id,
            productType,
            productName,
            quantity,
            deliveryDate,
            deliveryLocation,
            coordinates: {
                latitude: parseFloat(coordinates.latitude),
                longitude: parseFloat(coordinates.longitude)
            }
        });

        await demand.save();

        res.status(201).json({
            message: 'Demand posted successfully',
            demandId: demand._id,
            demand: demand
        });
    } catch (error) {
        console.error('Create demand error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// List demands (for sellers to see)
router.get('/', authenticate, async (req, res) => {
    try {
        const { productType, status, location } = req.query;
        let query = { status: status || 'active' };

        if (productType) {
            query.productType = productType;
        }

        const demands = await Demand.find(query)
            .populate({
                path: 'buyerId',
                select: 'name phone email'
            })
            .sort({ createdAt: -1 });

        res.json(demands);
    } catch (error) {
        console.error('List demands error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get buyer's own demands
router.get('/my-demands', authenticate, async (req, res) => {
    try {
        const demands = await Demand.find({ buyerId: req.user._id })
            .populate({
                path: 'responses.sellerId',
                select: 'name phone email sellerProfile.businessName sellerProfile.contactInfo'
            })
            .sort({ createdAt: -1 });

        res.json(demands);
    } catch (error) {
        console.error('Get my demands error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get single demand
router.get('/:demandId', authenticate, async (req, res) => {
    try {
        const { demandId } = req.params;

        const demand = await Demand.findById(demandId)
            .populate({
                path: 'buyerId',
                select: 'name phone email'
            })
            .populate({
                path: 'responses.sellerId',
                select: 'name phone email sellerProfile.businessName sellerProfile.contactInfo sellerProfile.rating'
            });

        if (!demand) {
            return res.status(404).json({ error: 'Demand not found' });
        }

        res.json(demand);
    } catch (error) {
        console.error('Get demand error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Respond to a demand (for sellers)
router.post('/:demandId/respond', authenticate, async (req, res) => {
    try {
        const { demandId } = req.params;
        const { message, price, contactInfo } = req.body;

        // Check if user is a seller
        if (req.user.userType !== 'seller') {
            return res.status(403).json({ error: 'Only sellers can respond to demands' });
        }

        const demand = await Demand.findById(demandId);
        if (!demand || demand.status !== 'active') {
            return res.status(404).json({ error: 'Demand not found or not active' });
        }

        // Check if seller already responded
        const existingResponse = demand.responses.find(
            response => response.sellerId.toString() === req.user._id.toString()
        );

        if (existingResponse) {
            return res.status(400).json({ error: 'You have already responded to this demand' });
        }

        // Add response
        demand.responses.push({
            sellerId: req.user._id,
            message,
            price: price ? parseFloat(price) : undefined,
            contactInfo: contactInfo || req.user.sellerProfile?.contactInfo
        });

        await demand.save();

        res.json({ message: 'Response added successfully' });
    } catch (error) {
        console.error('Respond to demand error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update demand status
router.patch('/:demandId', authenticate, async (req, res) => {
    try {
        const { demandId } = req.params;
        const { status } = req.body;

        const demand = await Demand.findById(demandId);
        if (!demand) {
            return res.status(404).json({ error: 'Demand not found' });
        }

        // Check if user owns the demand
        if (demand.buyerId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Not authorized to update this demand' });
        }

        if (status && ['active', 'fulfilled', 'cancelled'].includes(status)) {
            demand.status = status;
            await demand.save();
        }

        res.json({ message: 'Demand updated successfully', demand });
    } catch (error) {
        console.error('Update demand error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
