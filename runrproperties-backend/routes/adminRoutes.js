const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User');
const Role = require('../models/Role');
const Property = require('../models/Property');
const BankPartner = require('../models/BankPartner');
const BankLead = require('../models/BankLead');
const Enquiry = require('../models/Enquiry');
const Wishlist = require('../models/Wishlist');
const ContactLead = require('../models/ContactLead');

// Middleware to restrict access strictly to admins
const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Access denied: Admins only' });
  }
  next();
};

// 1. Overview Statistics
router.get('/stats', protect, adminOnly, async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalProperties,
      totalBanks,
      pendingBanks,
      totalEnquiries,
      totalLeads,
      totalContactLeads,
      newContactLeads,
      recentUsers,
      recentProperties,
    ] = await Promise.all([
      User.countDocuments({ role: { $ne: 'bank_partner' }, isDeleted: { $ne: true } }),
      Property.countDocuments({ isDeleted: { $ne: true } }),
      BankPartner.countDocuments(),
      BankPartner.countDocuments({ status: 'pending' }),
      Enquiry.countDocuments(),
      BankLead.countDocuments(),
      ContactLead.countDocuments(),
      ContactLead.countDocuments({ status: 'new' }),
      User.find({ role: { $ne: 'bank_partner' }, isDeleted: { $ne: true } }).sort({ createdAt: -1 }).limit(5).select('name email role createdAt'),
      Property.find({ isDeleted: { $ne: true } }).sort({ createdAt: -1 }).limit(5).select('title propertyType city price status createdAt'),
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalProperties,
        totalBanks,
        pendingBanks,
        totalEnquiries,
        totalLeads,
        totalContactLeads,
        newContactLeads,
        recentUsers,
        recentProperties,
      },
    });
  } catch (err) {
    next(err);
  }
});

// 2. Bank Partners Management
// List all bank partners with optional status filter
router.get('/bank-partners', protect, adminOnly, async (req, res, next) => {
  try {
    const { status, search } = req.query;
    const filter = { isDeleted: { $ne: true } };
    if (status && status !== 'all') {
      filter.status = status;
    }
    if (search) {
      filter.$or = [
        { bankName: { $regex: search, $options: 'i' } },
        { tagline: { $regex: search, $options: 'i' } },
      ];
    }

    const banks = await BankPartner.find(filter)
      .populate('userId', 'name email mobile createdAt isActive')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: banks });
  } catch (err) {
    next(err);
  }
});

// Update Bank Partner Status (Approve / Reject / Toggle Active)
router.patch('/bank-partners/:id/status', protect, adminOnly, async (req, res, next) => {
  try {
    const { status, isActive } = req.body;
    const update = {};
    if (status) {
      update.status = status;
      if (status === 'approved') update.approvedAt = new Date();
      if (status === 'rejected') update.rejectedAt = new Date();
    }
    if (isActive !== undefined) update.isActive = isActive;

    const bank = await BankPartner.findByIdAndUpdate(
      req.params.id,
      { $set: update },
      { new: true }
    ).populate('userId', 'name email mobile isActive');

    if (!bank || bank.isDeleted) {
      return res.status(404).json({ success: false, message: 'Bank Partner not found' });
    }

    // Synchronize login access: if bank partner is disabled or rejected, disable user login access too
    if (bank.userId) {
      const isUserActive = isActive !== undefined ? isActive : (status === 'approved');
      await User.findByIdAndUpdate(bank.userId._id || bank.userId, {
        isActive: isUserActive,
      });

      // Hide or unhide properties associated with this user
      if (!isUserActive) {
        await Property.updateMany(
          { owner: bank.userId._id || bank.userId, status: 'active', isDeleted: { $ne: true } },
          { $set: { status: 'inactive' } }
        );
      } else {
        await Property.updateMany(
          { owner: bank.userId._id || bank.userId, status: 'inactive', isDeleted: { $ne: true } },
          { $set: { status: 'active' } }
        );
      }
    }

    res.status(200).json({
      success: true,
      message: `Bank partner status updated to ${bank.status}`,
      data: bank,
    });
  } catch (err) {
    next(err);
  }
});

// Soft Delete Bank Partner (Bin action: marks isDeleted = true, revokes user login & hides profile)
router.delete('/bank-partners/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const bank = await BankPartner.findById(req.params.id);
    if (!bank || bank.isDeleted) {
      return res.status(404).json({ success: false, message: 'Bank Partner not found' });
    }

    // Soft delete bank partner
    bank.isDeleted = true;
    bank.isActive = false;
    await bank.save();

    // Soft delete / deactivate associated User account if exists
    if (bank.userId) {
      await User.findByIdAndUpdate(bank.userId, {
        isActive: false,
        isDeleted: true,
      });

      // Soft delete associated properties if any
      await Property.updateMany(
        { owner: bank.userId },
        { $set: { isDeleted: true, status: 'inactive' } }
      );
    }

    res.status(200).json({
      success: true,
      message: 'Bank Partner has been soft deleted successfully',
      data: { _id: bank._id },
    });
  } catch (err) {
    next(err);
  }
});

// Reset / Change Bank Partner Login Password
router.patch('/bank-partners/:id/password', protect, adminOnly, async (req, res, next) => {
  try {
    const { newPassword, email, name } = req.body;
    if (!newPassword || newPassword.trim().length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
    }

    const bank = await BankPartner.findById(req.params.id);
    if (!bank) {
      return res.status(404).json({ success: false, message: 'Bank Partner not found' });
    }

    let user = null;
    if (bank.userId) {
      user = await User.findById(bank.userId);
    }

    // If user not found by userId, try finding by email
    if (!user && email && email !== 'No email') {
      user = await User.findOne({ email: email.trim().toLowerCase() });
    }

    const roleDoc = await Role.findOne({ name: 'bank_partner', isActive: true });

    if (!user) {
      // Create user if missing
      const userEmail = (email && email !== 'No email') ? email.trim() : `bank_${bank._id}@example.com`;
      user = await User.create({
        name: name || bank.bankName,
        email: userEmail.toLowerCase(),
        password: newPassword.trim(),
        role: 'bank_partner',
        roleId: roleDoc ? roleDoc._id : undefined,
        isActive: true,
        isDeleted: false,
      });
      bank.userId = user._id;
    } else {
      // Update, restore & reactivate existing user
      user.password = newPassword.trim();
      user.isDeleted = false;
      user.isActive = true;
      if (roleDoc && !user.roleId) {
        user.roleId = roleDoc._id;
      }
      user.role = 'bank_partner';
      await user.save();

      if (!bank.userId || bank.userId.toString() !== user._id.toString()) {
        bank.userId = user._id;
      }
    }

    bank.plainPassword = newPassword.trim();
    bank.isDeleted = false;
    await bank.save();

    res.status(200).json({
      success: true,
      message: `Password updated successfully for ${user.email}`,
      plainPassword: bank.plainPassword,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        isActive: user.isActive,
      },
    });
  } catch (err) {
    next(err);
  }
});

// 3. Properties Management (Admin list with active/inactive/sold stats and multi-filters)
router.get('/properties', protect, adminOnly, async (req, res, next) => {
  try {
    const { search, propertyType, listingType, city, status } = req.query;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 10);
    const skip = (page - 1) * limit;

    const filter = { isDeleted: { $ne: true } };

    if (propertyType && propertyType !== 'all') filter.propertyType = propertyType;
    if (listingType && listingType !== 'all') filter.listingType = listingType;
    if (city && city !== 'all') filter.city = city;
    if (status && status !== 'all') filter.status = status;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
        { locality: { $regex: search, $options: 'i' } },
      ];
    }

    const [filteredTotal, properties, activeCount, inactiveCount, soldCount, totalCount] = await Promise.all([
      Property.countDocuments(filter),
      Property.find(filter)
        .populate('owner', 'name email mobile')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Property.countDocuments({ isDeleted: { $ne: true }, status: 'active' }),
      Property.countDocuments({ isDeleted: { $ne: true }, status: 'inactive' }),
      Property.countDocuments({ isDeleted: { $ne: true }, status: 'sold' }),
      Property.countDocuments({ isDeleted: { $ne: true } }),
    ]);

    const totalPages = Math.ceil(filteredTotal / limit) || 1;

    res.status(200).json({
      success: true,
      counts: {
        total: totalCount,
        active: activeCount,
        inactive: inactiveCount,
        sold: soldCount,
      },
      pagination: {
        total: filteredTotal,
        page,
        limit,
        totalPages,
        hasPrev: page > 1,
        hasNext: page < totalPages,
      },
      data: properties,
    });
  } catch (err) {
    next(err);
  }
});

// Update Property Status (active, inactive, sold)
router.patch('/properties/:id/status', protect, adminOnly, async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['active', 'inactive', 'sold'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status. Must be active, inactive, or sold.' });
    }

    const property = await Property.findByIdAndUpdate(
      req.params.id,
      { $set: { status } },
      { returnDocument: 'after' }
    ).populate('owner', 'name email mobile');

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    res.status(200).json({
      success: true,
      message: `Property status updated to ${status}`,
      data: property,
    });
  } catch (err) {
    next(err);
  }
});

// 4. Users Management
router.get('/users', protect, adminOnly, async (req, res, next) => {
  try {
    const { role, search, status } = req.query;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 10);
    const skip = (page - 1) * limit;

    const filter = { isDeleted: { $ne: true } };
    if (role && role !== 'all') {
      filter.role = role;
    } else {
      // Exclude bank_partner from Users tab (bank partners are managed in Bank Partners tab)
      filter.role = { $ne: 'bank_partner' };
    }
    if (status && status !== 'all') {
      filter.isActive = status === 'active';
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { mobile: { $regex: search, $options: 'i' } },
      ];
    }

    const [totalUsers, users] = await Promise.all([
      User.countDocuments(filter),
      User.find(filter)
        .populate('roleId', 'displayName name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
    ]);

    // Aggregate property counts per user
    const userIds = users.map((u) => u._id);
    const propertyCounts = await Property.aggregate([
      { $match: { owner: { $in: userIds }, isDeleted: { $ne: true } } },
      { $group: { _id: '$owner', count: { $sum: 1 }, activeCount: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } } } },
    ]);

    const propertyCountMap = {};
    propertyCounts.forEach((pc) => {
      propertyCountMap[pc._id.toString()] = { total: pc.count, active: pc.activeCount };
    });

    const enrichedUsers = users.map((u) => ({
      ...u.toObject(),
      isActive: u.isActive !== false,
      propertiesCount: propertyCountMap[u._id.toString()]?.total || 0,
      activePropertiesCount: propertyCountMap[u._id.toString()]?.active || 0,
    }));

    const totalPages = Math.ceil(totalUsers / limit) || 1;

    res.status(200).json({
      success: true,
      pagination: {
        total: totalUsers,
        page,
        limit,
        totalPages,
        hasPrev: page > 1,
        hasNext: page < totalPages,
      },
      data: enrichedUsers,
    });
  } catch (err) {
    next(err);
  }
});

// Toggle User Active Status (Deny login & hide owner properties when inactive)
router.patch('/users/:id/status', protect, adminOnly, async (req, res, next) => {
  try {
    const { isActive } = req.body;
    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ success: false, message: 'isActive boolean is required' });
    }

    const user = await User.findById(req.params.id);
    if (!user || user.isDeleted) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Admin account status cannot be deactivated' });
    }

    user.isActive = isActive;
    await user.save();

    // If user is deactivated, auto-hide their properties (set status to inactive)
    // If reactivated, restore their properties back to active (if not sold or deleted)
    if (!isActive) {
      await Property.updateMany(
        { owner: user._id, status: 'active', isDeleted: { $ne: true } },
        { $set: { status: 'inactive' } }
      );
      // If bank partner, also set bank isActive to false
      await BankPartner.updateMany(
        { userId: user._id },
        { $set: { isActive: false } }
      );
    } else {
      await Property.updateMany(
        { owner: user._id, status: 'inactive', isDeleted: { $ne: true } },
        { $set: { status: 'active' } }
      );
      await BankPartner.updateMany(
        { userId: user._id },
        { $set: { isActive: true } }
      );
    }

    res.status(200).json({
      success: true,
      message: `User has been ${isActive ? 'activated' : 'deactivated (login denied & properties hidden)'}`,
      data: { _id: user._id, isActive: user.isActive },
    });
  } catch (err) {
    next(err);
  }
});

// Soft Delete User (Preserve DB record, set isDeleted = true, hide properties & bank profile)
router.delete('/users/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.isDeleted) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Admin accounts cannot be deleted' });
    }

    // Soft delete user
    user.isDeleted = true;
    user.isActive = false;
    await user.save();

    // Soft delete associated properties & bank partner profiles
    await Property.updateMany(
      { owner: user._id },
      { $set: { isDeleted: true, status: 'inactive' } }
    );
    await BankPartner.updateMany(
      { userId: user._id },
      { $set: { isActive: false } }
    );

    res.status(200).json({
      success: true,
      message: 'User has been soft-deleted successfully (Record retained in database)',
    });
  } catch (err) {
    next(err);
  }
});

// Get User Full Profile & All Associated Properties / Enquiries / Leads Details
router.get('/users/:id/details', protect, adminOnly, async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('roleId', 'displayName name')
      .select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const [userProperties, bankProfile, loanLeads, buyerEnquiries, buyerWishlist] = await Promise.all([
      Property.find({ owner: user._id, isDeleted: { $ne: true } }).sort({ createdAt: -1 }),
      BankPartner.findOne({ userId: user._id }),
      BankLead.find({ userId: user._id }).populate('bankId', 'bankName interestRate'),
      Enquiry.find({ buyer: user._id })
        .populate('property', 'title price city locality photos propertyType listingType category status')
        .populate('owner', 'name email mobile')
        .sort({ createdAt: -1 }),
      Wishlist.find({ user: user._id })
        .populate('propertyId', 'title price city locality photos propertyType listingType category status')
        .sort({ createdAt: -1 }),
    ]);

    const counts = {
      total: userProperties.length,
      active: userProperties.filter((p) => p.status === 'active').length,
      inactive: userProperties.filter((p) => p.status === 'inactive').length,
      sold: userProperties.filter((p) => p.status === 'sold').length,
      enquiriesCount: buyerEnquiries.length,
      wishlistCount: buyerWishlist.length,
      loanLeadsCount: loanLeads.length,
    };

    res.status(200).json({
      success: true,
      data: {
        user,
        counts,
        properties: userProperties,
        bankProfile,
        loanLeads,
        enquiries: buyerEnquiries,
        wishlist: buyerWishlist,
      },
    });
  } catch (err) {
    next(err);
  }
});

// 5. Loan Leads Management
router.get('/leads', protect, adminOnly, async (req, res, next) => {
  try {
    const { status, search } = req.query;
    const filter = {};
    if (status && status !== 'all') filter.status = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { bankName: { $regex: search, $options: 'i' } },
      ];
    }

    const leads = await BankLead.find(filter)
      .populate('bankId', 'bankName logo interestRate')
      .populate('userId', 'name email mobile')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: leads });
  } catch (err) {
    next(err);
  }
});

// 6. Contact Us Leads Management
router.get('/contact-leads', protect, adminOnly, async (req, res, next) => {
  try {
    const { status, search } = req.query;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 10);
    const skip = (page - 1) * limit;

    const filter = {};
    if (status && status !== 'all') filter.status = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } },
      ];
    }

    const [filteredTotal, leads, totalAll, newCount, contactedCount, resolvedCount, closedCount] = await Promise.all([
      ContactLead.countDocuments(filter),
      ContactLead.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      ContactLead.countDocuments(),
      ContactLead.countDocuments({ status: 'new' }),
      ContactLead.countDocuments({ status: 'contacted' }),
      ContactLead.countDocuments({ status: 'resolved' }),
      ContactLead.countDocuments({ status: 'closed' }),
    ]);

    const totalPages = Math.ceil(filteredTotal / limit) || 1;

    res.status(200).json({
      success: true,
      counts: {
        total: totalAll,
        new: newCount,
        contacted: contactedCount,
        resolved: resolvedCount,
        closed: closedCount,
      },
      pagination: {
        total: filteredTotal,
        page,
        limit,
        totalPages,
        hasPrev: page > 1,
        hasNext: page < totalPages,
      },
      data: leads,
    });
  } catch (err) {
    next(err);
  }
});

// Update Contact Lead Status & Optional Note
router.patch('/contact-leads/:id/status', protect, adminOnly, async (req, res, next) => {
  try {
    const { status, notes } = req.body;
    if (status && !['new', 'contacted', 'resolved', 'closed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be new, contacted, resolved, or closed.',
      });
    }

    const updateData = {};
    if (status) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;

    const lead = await ContactLead.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { returnDocument: 'after' }
    );

    if (!lead) {
      return res.status(404).json({ success: false, message: 'Contact Lead not found' });
    }

    res.status(200).json({
      success: true,
      message: `Lead status updated to ${lead.status}`,
      data: lead,
    });
  } catch (err) {
    next(err);
  }
});

// Delete Contact Lead
router.delete('/contact-leads/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const lead = await ContactLead.findByIdAndDelete(req.params.id);
    if (!lead) {
      return res.status(404).json({ success: false, message: 'Contact Lead not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Contact Lead deleted successfully',
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
