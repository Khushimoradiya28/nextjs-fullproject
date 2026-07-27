const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createEnquiry,
  getBuyerEnquiries,
  getOwnerEnquiries,
  updateEnquiryStatus,
  deleteEnquiry,
} = require('../controllers/enquiryController');

router.post('/', protect, createEnquiry);
router.get('/my', protect, getBuyerEnquiries);
router.get('/received', protect, getOwnerEnquiries);
router.put('/:id/status', protect, updateEnquiryStatus);
router.delete('/:id', protect, deleteEnquiry);

module.exports = router;
