const express = require('express');
const router = express.Router();
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '../uploads/properties');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPG, JPEG, PNG, and WEBP formats are allowed!'));
    }
  }
});

const {
  createProperty,
  getAllProperties,
  searchProperties,
  getFeaturedProperties,
  getPropertyById,
  getMyProperties,
  updateProperty,
  deleteProperty,
} = require('../controllers/propertyController');

// --- Static public routes (declared first to avoid /:id conflict) ---
router.get('/search', searchProperties);
router.get('/featured', getFeaturedProperties);

// --- Protected static routes (owner only) ---
router.get('/my', protect, authorize('owner'), getMyProperties);

// --- Base path routes ---
router.get('/', getAllProperties);
router.post('/', protect, authorize('owner'), upload.array('images', 10), createProperty);

// --- Parameterized routes (must be last) ---
router.get('/:id', optionalAuth, getPropertyById);
router.put('/:id', protect, authorize('owner'), upload.array('images', 10), updateProperty);
router.delete('/:id', protect, authorize('owner'), deleteProperty);

module.exports = router;
