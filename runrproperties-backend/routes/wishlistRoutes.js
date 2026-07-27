const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
} = require('../controllers/wishlistController');

// All wishlist routes are protected
router.post('/add', protect, addToWishlist);
router.get('/', protect, getWishlist);
router.delete('/:propertyId', protect, removeFromWishlist);

module.exports = router;
