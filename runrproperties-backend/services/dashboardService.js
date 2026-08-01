const Property = require('../models/Property');
const Enquiry = require('../models/Enquiry');
const Wishlist = require('../models/Wishlist');

/**
 * Get owner dashboard statistics
 */
const getOwnerDashboard = async (ownerId) => {
  // Run all queries in parallel for performance
  const [propertyCounts, totalViews, enquiryCounts, recentEnquiries] = await Promise.all([
    // Property counts by status (single aggregation)
    Property.aggregate([
      { $match: { owner: ownerId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]),

    // Total views across all owner properties
    Property.aggregate([
      { $match: { owner: ownerId } },
      { $group: { _id: null, total: { $sum: '$views' } } },
    ]),

    // Enquiry counts by status
    Enquiry.aggregate([
      { $match: { owner: ownerId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]),

    // Recent enquiries (last 5)
    Enquiry.find({ owner: ownerId })
      .populate('property', 'title slug images')
      .populate('buyer', 'name email mobile avatarColor profilePhoto')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
  ]);

  // Parse property counts
  let totalProperties = 0;
  let activeProperties = 0;
  let inactiveProperties = 0;
  let soldProperties = 0;

  for (const item of propertyCounts) {
    totalProperties += item.count;
    if (item._id === 'active') activeProperties = item.count;
    else if (item._id === 'inactive') inactiveProperties = item.count;
    else if (item._id === 'sold') soldProperties = item.count;
  }

  // Parse enquiry counts
  let totalEnquiries = 0;
  let pendingEnquiries = 0;
  let closedEnquiries = 0;

  for (const item of enquiryCounts) {
    totalEnquiries += item.count;
    if (item._id === 'Pending') pendingEnquiries = item.count;
    else if (item._id === 'Closed') closedEnquiries = item.count;
  }

  return {
    totalProperties,
    activeProperties,
    inactiveProperties,
    soldProperties,
    totalViews: totalViews.length > 0 ? totalViews[0].total : 0,
    totalEnquiries,
    pendingEnquiries,
    closedEnquiries,
    recentEnquiries,
  };
};

/**
 * Get buyer dashboard statistics
 */
const getBuyerDashboard = async (buyerId) => {
  const [wishlistCount, enquiryCounts, recentEnquiries] = await Promise.all([
    // Wishlist count
    Wishlist.countDocuments({ user: buyerId }),

    // Total enquiries sent
    Enquiry.countDocuments({ buyer: buyerId }),

    // Recent enquiries (last 5)
    Enquiry.find({ buyer: buyerId })
      .populate('property', 'title slug images price city')
      .populate('owner', 'name email mobile avatarColor profilePhoto')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
  ]);

  return {
    wishlistCount,
    enquiriesSent: enquiryCounts,
    recentEnquiries,
  };
};

module.exports = {
  getOwnerDashboard,
  getBuyerDashboard,
};
