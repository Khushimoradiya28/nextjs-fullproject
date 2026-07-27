const Wishlist = require('../models/Wishlist');

/**
 * Add a property to the user's wishlist
 */
const addToWishlist = async (userId, propertyId) => {
  // Check if already exists
  const existing = await Wishlist.findOne({ user: userId, propertyId });
  if (existing) {
    const error = new Error('Property already in wishlist');
    error.statusCode = 400;
    throw error;
  }

  const item = await Wishlist.create({ user: userId, propertyId });
  return item;
};

/**
 * Get all wishlist items for a user
 */
const getWishlist = async (userId) => {
  const items = await Wishlist.find({ user: userId })
    .populate('propertyId')
    .sort({ createdAt: -1 });

  const validItems = [];
  for (const item of items) {
    if (!item.propertyId) {
      // Remove orphan
      await Wishlist.findByIdAndDelete(item._id);
    } else {
      const doc = item.toObject();
      doc.property = doc.propertyId;
      delete doc.propertyId;
      validItems.push(doc);
    }
  }

  return validItems;
};

/**
 * Remove a property from the user's wishlist
 */
const removeFromWishlist = async (userId, propertyId) => {
  const item = await Wishlist.findOneAndDelete({ user: userId, propertyId });
  if (!item) {
    const error = new Error('Property not found in wishlist');
    error.statusCode = 404;
    throw error;
  }
  return item;
};

module.exports = {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
};
