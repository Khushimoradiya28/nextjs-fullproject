const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const ctrl = require('../controllers/bankPartnerController');
const { protect } = require('../middleware/auth');

// Ensure uploads/banks directory exists
const bankUploadDir = path.join(__dirname, '../uploads/banks');
if (!fs.existsSync(bankUploadDir)) {
  fs.mkdirSync(bankUploadDir, { recursive: true });
}

// Multer for bank logo
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, bankUploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + Math.round(Math.random() * 1e9) + path.extname(file.originalname)),
});
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only images allowed'));
  },
});

// Middleware to check bank_partner role
const bankPartnerOnly = (req, res, next) => {
  if (req.user.role !== 'bank_partner') {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }
  next();
};

// Public routes
router.post('/register', ctrl.register);
router.get('/public', ctrl.getApprovedBanks);

// Logged-in user submits a lead
router.post('/leads', protect, ctrl.submitLead);

// Bank partner protected routes
router.get('/profile', protect, bankPartnerOnly, ctrl.getProfile);
router.put('/profile', protect, bankPartnerOnly, ctrl.updateProfile);
router.post('/profile/logo', protect, bankPartnerOnly, upload.single('logo'), ctrl.uploadLogo);
router.get('/leads', protect, bankPartnerOnly, ctrl.getLeads);
router.patch('/leads/:leadId', protect, bankPartnerOnly, ctrl.updateLead);

// Offers CRUD
router.post('/offers', protect, bankPartnerOnly, ctrl.addOffer);
router.put('/offers/:offerId', protect, bankPartnerOnly, ctrl.updateOffer);
router.delete('/offers/:offerId', protect, bankPartnerOnly, ctrl.deleteOffer);

module.exports = router;
