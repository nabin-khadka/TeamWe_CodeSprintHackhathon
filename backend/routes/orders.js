const express = require('express');
const { Order, Posting, User } = require('../models');
const { authenticate, sellerOnly, buyerOnly } = require('../middleware/auth');

const router = express.Router();

// Create order
router.post('/', authenticate, buyerOnly, async (req, res) => {
    try {
        const { postingId, quantity } = req.body;

        // Find posting
        const posting = await Posting.findById(postingId);
        if (!posting || !posting.active) {
            return res.status(404).json({ error: 'Posting not found or inactive' });
        }

        // Calculate total price
        const totalPrice = posting.price * (quantity || 1);

        // Create order
        const order = new Order({
            buyerId: req.user._id,
            postingId,
            quantity: quantity || 1,
            totalPrice
        });

        await order.save();

        res.status(201).json({ message: 'Order created successfully', orderId: order._id });
    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// List buyer orders
router.get('/buyer', authenticate, buyerOnly, async (req, res) => {
    try {
        const orders = await Order.find({ buyerId: req.user._id })
            .populate({ path: 'postingId', select: 'title price images' })
            .sort({ createdAt: -1 });

        res.json(orders);
    } catch (error) {
        console.error('List buyer orders error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// List seller orders
router.get('/seller', authenticate, sellerOnly, async (req, res) => {
    try {
        const orders = await Order.find({})
            .populate({
                path: 'postingId',
                match: { sellerId: req.user._id },
                select: 'title price'
            })
            .populate({ path: 'buyerId', select: 'username email phone' })
            .sort({ createdAt: -1 });

        // Filter out orders where postingId is null (not seller's postings)
        const filteredOrders = orders.filter(order => order.postingId);

        res.json(filteredOrders);
    } catch (error) {
        console.error('List seller orders error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update order status
router.put('/:orderId/status', authenticate, sellerOnly, async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;

        const validStatuses = ['pending', 'ready_for_delivery', 'completed', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const order = await Order.findById(orderId)
            .populate('postingId');

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Check if seller owns the posting
        if (!order.postingId.sellerId.equals(req.user._id)) {
            return res.status(403).json({ error: 'Not authorized to update this order' });
        }

        order.status = status;
        await order.save();

        res.json({ message: `Order status updated to ${status}`, order });
    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
