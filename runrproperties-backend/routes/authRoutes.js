const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User');
const {
  signup,
  login,
  getMe,
  updateProfile,
  changePassword,
  logout,
  forgotPassword,
  resetPassword,
} = require('../controllers/authController');
const { createUploader, compressToWebp } = require('../middleware/imageCompressor');

// Setup avatar uploader & webp compressor
const avatarUpload = createUploader({ maxSize: 5 * 1024 * 1024 });
const compressAvatar = compressToWebp({ maxWidth: 600, maxHeight: 600, quality: 88, prefix: 'avatar' });

// Upload profile photo handler
const uploadProfilePhoto = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    const photoPath = '/uploads/images/' + req.file.filename;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { profilePhoto: photoPath },
      { returnDocument: 'after' }
    );
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// Public routes
router.post('/signup', signup);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

// Protected routes (require authentication)
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/profile/photo', protect, avatarUpload.single('profilePhoto'), compressAvatar, uploadProfilePhoto);
router.put('/change-password', protect, changePassword);
router.post('/logout', protect, logout);

module.exports = router;
