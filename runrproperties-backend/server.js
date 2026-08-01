const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const { verifyEmailConnection } = require('./utils/sendEmail');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB().then(() => {
  // Backfill avatarColor for all existing users missing it (runs once on startup)
  const User = require('./models/User');
  const { getRandomAvatarColor } = require('./utils/avatarColors');

  User.find({ $or: [{ avatarColor: null }, { avatarColor: { $exists: false } }] })
    .select('_id')
    .then(async (users) => {
      if (users.length > 0) {
        const bulkOps = users.map((u) => ({
          updateOne: {
            filter: { _id: u._id },
            update: { $set: { avatarColor: getRandomAvatarColor() } },
          },
        }));
        await User.bulkWrite(bulkOps);
        console.log(`[AVATAR-COLOR] Backfilled ${users.length} users with avatar colors`);
      }
    })
    .catch((err) => {
      console.error('[AVATAR-COLOR] Backfill error:', err.message);
    });
});

// Verify SMTP connection once at startup
verifyEmailConnection();

const app = express();

// Security headers
app.use(helmet());

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS
app.use(
  cors({
    origin: process.env.CLIENT_URL || '*',
    credentials: true,
  })
);

// Rate limiters
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { success: false, message: 'Too many attempts. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: { success: false, message: 'Too many reset requests. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Serve static uploads
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'RunR Properties API is running',
  });
});

// Apply rate limiters to specific auth routes
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/forgot-password', forgotPasswordLimiter);

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/wishlist', require('./routes/wishlistRoutes'));
app.use('/api/properties', require('./routes/propertyRoutes'));
app.use('/api/enquiries', require('./routes/enquiryRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
  });
});

// Centralized error handler
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

module.exports = app;
