const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getOwnerDashboard,
  getBuyerDashboard,
} = require('../controllers/dashboardController');

// Owner dashboard - requires owner role
router.get('/owner', protect, authorize('owner'), getOwnerDashboard);

// Buyer dashboard - requires buyer role
router.get('/buyer', protect, authorize('buyer'), getBuyerDashboard);

module.exports = router;
