const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const crypto = require('crypto');
const path = require('path');
const axios = require('axios');
require('dotenv').config();

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

const mongoUser = process.env.MONGO_USER;
const mongoPass = process.env.MONGO_PASS;
const mongoHost = process.env.MONGO_HOST || 'agrilink.tech';
const mongoPort = process.env.MONGO_PORT || '27017';
const mongoDb = process.env.MONGO_DB || 'marketplace';

let mongoUrl;
if (mongoUser && mongoPass) {
  mongoUrl = `mongodb://${mongoUser}:${mongoPass}@${mongoHost}:${mongoPort}/${mongoDb}?authSource=admin`;
} else {
  mongoUrl = `mongodb://${mongoHost}:${mongoPort}/${mongoDb}?authSource=admin`;
}

mongoose.connect(mongoUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  // useCreateIndex: true,
  // useFindAndModify: false
}).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Updated User Schema to include buyer/seller specific fields
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  phone: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  userType: { type: String, enum: ['buyer', 'seller'], required: true },
  
  // Common fields
  profileImage: { type: String }, // URL to profile image
  address: { type: String },
  
  // Buyer specific fields
  buyerProfile: {
    preferredCategories: [{ type: String }],
    deliveryAddress: { type: String }
  },
  
  // Seller specific fields
  sellerProfile: {
    businessName: { type: String },
    businessType: { type: String },
    businessDescription: { type: String },
    businessImage: { type: String }, // URL to business image
    businessLicense: { type: String },
    bankAccount: { type: String },
    contactInfo: { type: String },
    rating: { type: Number, default: 0 }
  },
  
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});
// Seller Can;t be User For now (TODO)
const SellerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  businessName: { type: String, required: true },
  description: { type: String },
  contactInfo: { type: String, required: true },
  rating: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

const SessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  token: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: '7d' }
});

const PostingSchema = new mongoose.Schema({
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  images: [{ type: String }],
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const OrderSchema = new mongoose.Schema({
  buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  postingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Posting', required: true },
  status: {
    type: String,
    enum: ['pending', 'ready_for_delivery', 'completed', 'cancelled'],
    default: 'pending'
  },
  quantity: { type: Number, default: 1 },
  totalPrice: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

const FeedbackSchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// Schema ANusar ko Models 
const User = mongoose.model('User', UserSchema);
const Seller = mongoose.model('Seller', SellerSchema);
const Session = mongoose.model('Session', SessionSchema);
const Posting = mongoose.model('Posting', PostingSchema);
const Order = mongoose.model('Order', OrderSchema);
const Feedback = mongoose.model('Feedback', FeedbackSchema);

// Authentication Middleware Jalse Sabbai Requests Handle Garcha
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
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const sellerOnly = async (req, res, next) => {
  if (!req.user.isSeller) {
    return res.status(403).json({ error: 'Seller account required' });
  }
  next();
};

// Helper extra functions
const generateToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// USER ROUTES (API Endpoiunts jun Front End le Trigger Garca)
// Create Account
app.post('/api/users/register', async (req, res) => {
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

    // Validate phone format (basic validation for +977 format)
    if (!phone.startsWith('+977') || phone.length !== 13) {
      return res.status(400).json({ error: 'Phone number must be in +977XXXXXXXXXX format' });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
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
    if (error.code === 11000) {
      // Duplicate key error
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ error: `${field} already exists` });
    }
    res.status(500).json({ error: 'Internal server error during registration' });
  }
});

// Login
app.post('/api/users/login', async (req, res) => {
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

// Logout
app.post('/api/users/logout', authenticate, async (req, res) => {
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

// SELLER ROUTES
// Register as seller
app.post('/api/sellers/register', authenticate, async (req, res) => {
  try {
    const { businessName, description, contactInfo } = req.body;

    // Check if already a seller
    if (req.user.isSeller) {
      return res.status(400).json({ error: 'User is already registered as a seller' });
    }

    // Create seller profile
    const seller = new Seller({
      userId: req.user._id,
      businessName,
      description,
      contactInfo
    });

    await seller.save();

    // Update user to be a seller // But Seller Can't be User For now (TODO)
    await User.findByIdAndUpdate(req.user._id, { isSeller: true });

    res.status(201).json({ message: 'Seller registered successfully', sellerId: seller._id });
  } catch (error) {
    console.error('Seller registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POSTING ROUTES
// Add posting
app.post('/api/postings', authenticate, sellerOnly, async (req, res) => {
  try {
    const { title, description, price, category, images } = req.body;

    // Chek for Seller
    const seller = await Seller.findOne({ userId: req.user._id });
    if (!seller) {
      return res.status(404).json({ error: 'Seller profile not found' });
    }

    // Create posting
    const posting = new Posting({
      sellerId: seller._id,
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
app.get('/api/postings', async (req, res) => {
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
      .populate({ path: 'sellerId', select: 'businessName rating' })
      .sort({ createdAt: -1 });

    res.json(postings);
  } catch (error) {
    console.error('List postings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ORDER ROUTES
// Create order
app.post('/api/orders', authenticate, async (req, res) => {
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
app.get('/api/orders/buyer', authenticate, async (req, res) => {
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

// 'Authenticate ' makes sure user is logged and ani SellerOnly makes sure User seller ho
app.get('/api/orders/seller', authenticate, sellerOnly, async (req, res) => {
  try {
    const seller = await Seller.findOne({ userId: req.user._id });
    if (!seller) {
      return res.status(404).json({ error: 'Seller profile not found' });
    }

    const sellerPostings = await Posting.find({ sellerId: seller._id });
    const postingIds = sellerPostings.map(posting => posting._id);

    const orders = await Order.find({ postingId: { $in: postingIds } })
      .populate({ path: 'postingId', select: 'title price' })
      .populate({ path: 'buyerId', select: 'username email' })
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error('List seller orders error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mark order ready for delivery
app.put('/api/orders/:orderId/ready', authenticate, sellerOnly, async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId)
      .populate('postingId');

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Ownership checking
    const seller = await Seller.findOne({ userId: req.user._id });
    if (!seller || !order.postingId.sellerId.equals(seller._id)) {
      return res.status(403).json({ error: 'Not authorized to update this order' });
    }

    order.status = 'ready_for_delivery';
    await order.save();

    res.json({ message: 'Order marked as ready for delivery', order });
  } catch (error) {
    console.error('Mark order ready error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Complete order
app.put('/api/orders/:orderId/complete', authenticate, sellerOnly, async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId)
      .populate('postingId');

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Owenership checking
    const seller = await Seller.findOne({ userId: req.user._id });
    if (!seller || !order.postingId.sellerId.equals(seller._id)) {
      return res.status(403).json({ error: 'Not authorized to update this order' });
    }

    if (order.status !== 'ready_for_delivery') {
      return res.status(400).json({ error: 'Order must be ready for delivery before completion' });
    }

    order.status = 'completed';
    await order.save();

    res.json({ message: 'Order completed successfully', order });
  } catch (error) {
    console.error('Complete order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get order status
app.get('/api/orders/:orderId', authenticate, async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId)
      .populate({ path: 'postingId', select: 'title price images' })
      .populate({ path: 'buyerId', select: 'username' });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check if user is authorized to view this order
    const seller = await Seller.findOne({ userId: req.user._id });
    const isSeller = seller && order.postingId.sellerId.equals(seller._id);
    const isBuyer = order.buyerId.equals(req.user._id);

    if (!isSeller && !isBuyer) {
      return res.status(403).json({ error: 'Not authorized to view this order' });
    }

    res.json(order);
  } catch (error) {
    console.error('Get order status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// FEEDBACK ROUTES
// Leave feedback
app.post('/api/feedback', authenticate, async (req, res) => {
  try {
    const { orderId, rating, comment } = req.body;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    // Find order
    const order = await Order.findById(orderId)
      .populate('postingId');

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Verify buyer owns the order
    if (!order.buyerId.equals(req.user._id)) {
      return res.status(403).json({ error: 'Not authorized to leave feedback on this order' });
    }

    // Verify order is completed
    if (order.status !== 'completed') {
      return res.status(400).json({ error: 'Can only leave feedback on completed orders' });
    }

    // Check if feedback already exists
    const existingFeedback = await Feedback.findOne({ orderId });
    if (existingFeedback) {
      return res.status(400).json({ error: 'Feedback already submitted for this order' });
    }

    // Create feedback
    const feedback = new Feedback({
      orderId,
      rating,
      comment
    });

    await feedback.save();

    // Update seller rating
    const seller = await Seller.findById(order.postingId.sellerId);
    const allFeedback = await Feedback.find({
      orderId: {
        $in: await Order.find({
          'postingId.sellerId': seller._id,
          status: 'completed'
        }).distinct('_id')
      }
    });

    const averageRating = allFeedback.reduce((sum, fb) => sum + fb.rating, 0) / allFeedback.length;
    seller.rating = averageRating;
    await seller.save();

    res.status(201).json({ message: 'Feedback submitted successfully' });
  } catch (error) {
    console.error('Leave feedback error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// USER/SELLER INFO ROUTES
// Get user info
app.get('/api/users/me', authenticate, async (req, res) => {
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

// Get seller info
app.get('/api/sellers/:sellerId', async (req, res) => {
  try {
    const { sellerId } = req.params;

    const seller = await Seller.findById(sellerId)
      .populate({ path: 'userId', select: 'username email' });

    if (!seller) {
      return res.status(404).json({ error: 'Seller not found' });
    }

    res.json(seller);
  } catch (error) {
    console.error('Get seller info error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Image checking Inetgration of AI (TODO)
// Evaluate image
app.post('/api/ai/evaluate-image', authenticate, async (req, res) => {
  try {
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ error: 'Image URL is required' });
    }
    //  TODO AI
    const aiResponse = await axios.post('http://api.agrilink.tech/evaluate', {
      imageUrl
    });

    res.json(aiResponse.data);
  } catch (error) {
    console.error('AI image evaluation error:', error);
    res.status(500).json({ error: 'Error evaluating image' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// For hot-reloading in development
if (process.env.NODE_ENV === 'development') {
  const nodemon = require('nodemon');
  nodemon({
    script: 'server.js',
    ext: 'js',
    ignore: ['node_modules/']
  });

  nodemon.on('start', () => {
    console.log('Server restarted!');
  });

  nodemon.on('crash', () => {
    console.error('Server crashed!');
  });
}

module.exports = app;
