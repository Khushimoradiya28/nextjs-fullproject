const express = require('express');
const router = express.Router();
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const { createUploader, compressToWebp } = require('../middleware/imageCompressor');

const uploadPropertyImages = createUploader({ maxSize: 15 * 1024 * 1024, maxFiles: 10 });
const compressPropertyImages = compressToWebp({ maxWidth: 1920, quality: 84, prefix: 'prop' });

const {
  createProperty,
  getAllProperties,
  searchProperties,
  getFeaturedProperties,
  getPropertyById,
  getMyProperties,
  updateProperty,
  deleteProperty,
  getPropertyStats,
} = require('../controllers/propertyController');

// --- Static public routes (declared first to avoid /:id conflict) ---
router.get('/stats', getPropertyStats);
router.get('/search', searchProperties);
router.get('/featured', getFeaturedProperties);

// --- Protected static routes (owner only) ---
router.get('/my', protect, authorize('owner'), getMyProperties);

// --- Base path routes ---
router.get('/', getAllProperties);
router.post('/', protect, authorize('owner'), uploadPropertyImages.array('images', 10), compressPropertyImages, createProperty);

// --- Parameterized routes (must be last) ---
router.get('/:id', optionalAuth, getPropertyById);
router.put('/:id', protect, authorize('owner'), uploadPropertyImages.array('images', 10), compressPropertyImages, updateProperty);
router.delete('/:id', protect, authorize('owner'), deleteProperty);

module.exports = router;
