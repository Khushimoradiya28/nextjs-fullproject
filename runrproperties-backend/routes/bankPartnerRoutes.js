const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/bankPartnerController');
const { protect } = require('../middleware/auth');
const { createUploader, compressToWebp } = require('../middleware/imageCompressor');

// Multer and compression for bank logo
const uploadBankLogo = createUploader({ maxSize: 5 * 1024 * 1024 });
const compressBankLogo = compressToWebp({ maxWidth: 800, quality: 90, prefix: 'bank' });

// Middleware to check bank_partner or admin role
const bankPartnerOnly = (req, res, next) => {
  if (req.user.role !== 'bank_partner' && req.user.role !== 'admin') {
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
router.post('/profile/logo', protect, bankPartnerOnly, uploadBankLogo.single('logo'), compressBankLogo, ctrl.uploadLogo);
router.get('/leads', protect, bankPartnerOnly, ctrl.getLeads);
router.patch('/leads/:leadId', protect, bankPartnerOnly, ctrl.updateLead);

// Offers CRUD
router.post('/offers', protect, bankPartnerOnly, ctrl.addOffer);
router.put('/offers/:offerId', protect, bankPartnerOnly, ctrl.updateOffer);
router.delete('/offers/:offerId', protect, bankPartnerOnly, ctrl.deleteOffer);

module.exports = router;
