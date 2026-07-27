const dashboardService = require('../services/dashboardService');

/**
 * @desc    Get owner dashboard stats
 * @route   GET /api/dashboard/owner
 * @access  Private (owner only)
 */
const getOwnerDashboard = async (req, res, next) => {
  try {
    const data = await dashboardService.getOwnerDashboard(req.user._id);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get buyer dashboard stats
 * @route   GET /api/dashboard/buyer
 * @access  Private (buyer only)
 */
const getBuyerDashboard = async (req, res, next) => {
  try {
    const data = await dashboardService.getBuyerDashboard(req.user._id);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOwnerDashboard,
  getBuyerDashboard,
};
