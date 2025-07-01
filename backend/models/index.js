const mongoose = require('mongoose');

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
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
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

// Export models
const User = mongoose.model('User', UserSchema);
const Seller = mongoose.model('Seller', SellerSchema);
const Session = mongoose.model('Session', SessionSchema);
const Posting = mongoose.model('Posting', PostingSchema);
const Order = mongoose.model('Order', OrderSchema);
const Feedback = mongoose.model('Feedback', FeedbackSchema);

module.exports = {
  User,
  Seller,
  Session,
  Posting,
  Order,
  Feedback
};
