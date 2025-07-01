const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

// Import modules
const connectDB = require('./config/database');
const { authenticate } = require('./middleware/auth');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// Connect to database
connectDB();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Import route modules
const authRoutes = require('./routes/auth');
const postingRoutes = require('./routes/postings');
const orderRoutes = require('./routes/orders');
const userRoutes = require('./routes/users');

// Use routes
app.use('/api/users', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/postings', postingRoutes);
app.use('/api/orders', orderRoutes);

// AI Image evaluation endpoint (kept in main server for now)
app.post('/api/ai/evaluate-image', authenticate, async (req, res) => {
  try {
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ error: 'Image URL is required' });
    }
    
    // TODO: Implement AI integration
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

module.exports = app;
