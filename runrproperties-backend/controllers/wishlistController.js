const wishlistService = require('../services/wishlistService');

/**
 * @desc    Add property to wishlist
 * @route   POST /api/wishlist/add
 * @access  Private
 */
const addToWishlist = async (req, res, next) => {
  try {
    const { propertyId } = req.body;

    if (!propertyId || !propertyId.trim()) {
      return res.status(400).json({
        success: false,
        message: 'propertyId is required',
      });
    }

    const item = await wishlistService.addToWishlist(req.user._id, propertyId.trim());

    res.status(201).json({
      success: true,
      message: 'Property added to wishlist',
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user's wishlist
 * @route   GET /api/wishlist
 * @access  Private
 */
const getWishlist = async (req, res, next) => {
  try {
    const items = await wishlistService.getWishlist(req.user._id);

    res.status(200).json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Remove property from wishlist
 * @route   DELETE /api/wishlist/:propertyId
 * @access  Private
 */
const removeFromWishlist = async (req, res, next) => {
  try {
    const { propertyId } = req.params;

    await wishlistService.removeFromWishlist(req.user._id, propertyId);

    res.status(200).json({
      success: true,
      message: 'Property removed from wishlist',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
};
