const { User, Session } = require('../models');

// Authentication Middleware
const authenticate = async (req, res, next) => {
  try {
    const token = req.cookies.session || req.headers.authorization;
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const session = await Session.findOne({ token });
    if (!session) {
      return res.status(401).json({ error: 'Invalid session' });
    }

    const user = await User.findById(session.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'User not found or inactive' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Seller only middleware
const sellerOnly = async (req, res, next) => {
  if (req.user.userType !== 'seller') {
    return res.status(403).json({ error: 'Seller account required' });
  }
  next();
};

// Buyer only middleware
const buyerOnly = async (req, res, next) => {
  if (req.user.userType !== 'buyer') {
    return res.status(403).json({ error: 'Buyer account required' });
  }
  next();
};

module.exports = {
  authenticate,
  sellerOnly,
  buyerOnly
};
