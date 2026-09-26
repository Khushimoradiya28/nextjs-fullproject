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
const Blog = require('../models/Blog');
const ContactLead = require('../models/ContactLead');
const path = require('path');
const fs = require('fs');
const { createUploader, compressToWebp } = require('../middleware/imageCompressor');

const uploadBlogImage = createUploader({ maxSize: 10 * 1024 * 1024 });
const compressBlogCover = compressToWebp({ maxWidth: 1920, quality: 85, prefix: 'blog' });

// Middleware to restrict access strictly to admins
const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Access denied: Admins only' });
  }
  next();
};

// 1. Overview / Dashboard Statistics
router.get('/stats', protect, adminOnly, async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalBuyers,
      totalOwners,
      totalAdmins,
      totalProperties,
      activeProperties,
      soldProperties,
      totalBanks,
      pendingBanks,
      approvedBanks,
      totalEnquiries,
      pendingPropertyEnquiries,
      totalLeads,
      pendingLeads,
      approvedLeads,
      totalContactLeads,
      newContactLeads,
      totalBlogs,
      publishedBlogs,
      recentUsers,
      recentProperties,
      recentLeads,
      recentContactLeads,
      recentPropertyEnquiries,
      bankWiseLeads,
      pendingBanksList,
    ] = await Promise.all([
      User.countDocuments({ role: { $ne: 'bank_partner' }, isDeleted: { $ne: true } }),
      User.countDocuments({ role: 'buyer', isDeleted: { $ne: true } }),
      User.countDocuments({ role: 'owner', isDeleted: { $ne: true } }),
      User.countDocuments({ role: 'admin', isDeleted: { $ne: true } }),
      Property.countDocuments({ isDeleted: { $ne: true } }),
      Property.countDocuments({ isDeleted: { $ne: true }, status: 'active' }),
      Property.countDocuments({ isDeleted: { $ne: true }, status: 'sold' }),
      BankPartner.countDocuments({ isDeleted: { $ne: true } }),
      BankPartner.countDocuments({ status: 'pending', isDeleted: { $ne: true } }),
      BankPartner.countDocuments({ status: 'approved', isDeleted: { $ne: true } }),
      Enquiry.countDocuments(),
      Enquiry.countDocuments({ status: 'Pending' }),
      BankLead.countDocuments(),
      BankLead.countDocuments({ status: 'pending' }),
      BankLead.countDocuments({ status: { $in: ['approved', 'closed_won'] } }),
      ContactLead.countDocuments(),
      ContactLead.countDocuments({ status: 'new' }),
      Blog.countDocuments({ isDeleted: { $ne: true } }),
      Blog.countDocuments({ isDeleted: { $ne: true }, status: 'published' }),
      User.find({ role: { $ne: 'bank_partner' }, isDeleted: { $ne: true } }).sort({ createdAt: -1 }).limit(5).select('name email role createdAt'),
      Property.find({ isDeleted: { $ne: true } }).sort({ createdAt: -1 }).limit(6).select('title propertyType listingType category city locality price status photos createdAt'),
      BankLead.find().sort({ createdAt: -1 }).limit(6).select('name email phone bankName loanAmount employmentType propertyTitle status createdAt'),
      ContactLead.find().sort({ createdAt: -1 }).limit(5).select('name email phone subject message status createdAt'),
      Enquiry.find()
        .sort({ createdAt: -1 })
        .limit(6)
        .populate('property', 'title price city locality photos propertyType listingType category status')
        .populate('owner', 'name email mobile role')
        .populate('buyer', 'name email mobile role'),
      BankLead.aggregate([
        { $group: { _id: '$bankName', count: { $sum: 1 }, totalVolume: { $sum: { $toDouble: { $ifNull: ['$loanAmount', '0'] } } } } },
        { $sort: { count: -1 } }
      ]),
      BankPartner.find({ status: 'pending', isDeleted: { $ne: true } })
        .populate('userId', 'name email mobile createdAt')
        .sort({ createdAt: -1 })
        .limit(10),
    ]);

    // Calculate total loan volume
    const totalLoanVolume = bankWiseLeads.reduce((acc, curr) => acc + (curr.totalVolume || 0), 0);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalBuyers,
        totalOwners,
        totalAdmins,
        totalProperties,
        activeProperties,
        soldProperties,
        totalBanks,
        pendingBanks,
        approvedBanks,
        totalEnquiries,
        pendingPropertyEnquiries,
        totalLeads,
        pendingLeads,
        approvedLeads,
        totalContactLeads,
        newContactLeads,
        totalBlogs,
        publishedBlogs,
        draftBlogs: totalBlogs - publishedBlogs,
        totalLoanVolume,
        recentUsers,
        recentProperties,
        recentLeads,
        recentContactLeads,
        recentPropertyEnquiries,
        bankWiseLeads,
        pendingBanksList,
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

    const [totalUsers, users, totalBuyers, totalOwners, totalAdmins] = await Promise.all([
      User.countDocuments(filter),
      User.find(filter)
        .populate('roleId', 'displayName name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments({ role: 'buyer', isDeleted: { $ne: true } }),
      User.countDocuments({ role: 'owner', isDeleted: { $ne: true } }),
      User.countDocuments({ role: 'admin', isDeleted: { $ne: true } }),
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
      counts: {
        total: totalBuyers + totalOwners + totalAdmins,
        buyer: totalBuyers,
        owner: totalOwners,
        admin: totalAdmins,
      },
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
    const { status, search, bankName, page = 1, limit = 50 } = req.query;
    const filter = {};
    if (status && status !== 'all') filter.status = status;
    if (bankName && bankName !== 'all') filter.bankName = bankName;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { bankName: { $regex: search, $options: 'i' } },
      ];
    }

    const [leads, total, pendingCount, approvedCount, rejectedCount] = await Promise.all([
      BankLead.find(filter)
        .populate('bankId', 'bankName logo interestRate')
        .populate('userId', 'name email mobile')
        .sort({ createdAt: -1 })
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit)),
      BankLead.countDocuments(filter),
      BankLead.countDocuments({ ...filter, status: 'pending' }),
      BankLead.countDocuments({ ...filter, status: 'approved' }),
      BankLead.countDocuments({ ...filter, status: 'rejected' }),
    ]);

    res.status(200).json({
      success: true,
      data: leads,
      counts: {
        total,
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount,
      },
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) {
    next(err);
  }
});

// Update Loan Lead Status & Optional Note
router.patch('/leads/:id/status', protect, adminOnly, async (req, res, next) => {
  try {
    const { status, notes } = req.body;
    const updateData = {};
    if (status) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;

    const lead = await BankLead.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { returnDocument: 'after' }
    )
      .populate('bankId', 'bankName logo interestRate')
      .populate('userId', 'name email mobile');

    if (!lead) {
      return res.status(404).json({ success: false, message: 'Loan lead not found' });
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

// Delete Loan Lead
router.delete('/leads/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const lead = await BankLead.findByIdAndDelete(req.params.id);
    if (!lead) {
      return res.status(404).json({ success: false, message: 'Loan lead not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Loan lead deleted successfully',
    });
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

// ═══════════════════════════════════════════════════════════════
// 6.5. Property Leads & Enquiries Management (Admin)
// ═══════════════════════════════════════════════════════════════
router.get('/property-enquiries', protect, adminOnly, async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, parseInt(limit) || 10);
    const skip = (pageNum - 1) * limitNum;

    const filter = {};

    if (status && status !== 'all') {
      filter.status = new RegExp(`^${status}$`, 'i');
    }

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      // Find matching properties first
      const matchingProps = await Property.find({
        $or: [{ title: regex }, { city: regex }, { locality: regex }],
      }).select('_id');
      const matchingPropIds = matchingProps.map((p) => p._id);

      filter.$or = [
        { name: regex },
        { email: regex },
        { mobile: regex },
        { message: regex },
        { property: { $in: matchingPropIds } },
      ];
    }

    const [
      enquiries,
      total,
      totalCount,
      pendingCount,
      contactedCount,
      closedCount,
    ] = await Promise.all([
      Enquiry.find(filter)
        .populate('property', 'title price city locality images photos propertyType listingType category status')
        .populate('owner', 'name email mobile avatar role')
        .populate('buyer', 'name email mobile avatar role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Enquiry.countDocuments(filter),
      Enquiry.countDocuments(),
      Enquiry.countDocuments({ status: { $regex: /^pending$/i } }),
      Enquiry.countDocuments({ status: { $regex: /^contacted$/i } }),
      Enquiry.countDocuments({ status: { $regex: /^closed$/i } }),
    ]);

    const totalPages = Math.ceil(total / limitNum) || 1;

    res.status(200).json({
      success: true,
      data: enquiries,
      counts: {
        total: totalCount,
        pending: pendingCount,
        contacted: contactedCount,
        closed: closedCount,
      },
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
        hasPrev: pageNum > 1,
        hasNext: pageNum < totalPages,
      },
    });
  } catch (err) {
    next(err);
  }
});

// Update Property Enquiry Status
router.patch('/property-enquiries/:id/status', protect, adminOnly, async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Pending', 'Contacted', 'Closed'];
    const matchedStatus = validStatuses.find(s => s.toLowerCase() === (status || '').toLowerCase());
    if (!matchedStatus) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Allowed: Pending, Contacted, Closed',
      });
    }

    const enquiry = await Enquiry.findByIdAndUpdate(
      req.params.id,
      { status: matchedStatus },
      { new: true, runValidators: true }
    )
      .populate('property', 'title price city locality images photos propertyType listingType category status')
      .populate('owner', 'name email mobile')
      .populate('buyer', 'name email mobile');

    if (!enquiry) {
      return res.status(404).json({ success: false, message: 'Property enquiry not found' });
    }

    res.status(200).json({
      success: true,
      message: `Enquiry status updated to ${enquiry.status}`,
      data: enquiry,
    });
  } catch (err) {
    next(err);
  }
});

// Delete Property Enquiry
router.delete('/property-enquiries/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const enquiry = await Enquiry.findByIdAndDelete(req.params.id);
    if (!enquiry) {
      return res.status(404).json({ success: false, message: 'Property enquiry not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Property enquiry deleted successfully',
    });
  } catch (err) {
    next(err);
  }
});

// 7. Blogs Management (Admin)
// List blogs with search, category, status filters & pagination
router.get('/blogs', protect, adminOnly, async (req, res, next) => {
  try {
    const { search, category, status, page = 1, limit = 10 } = req.query;
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, parseInt(limit) || 10);
    const skip = (pageNum - 1) * limitNum;

    const filter = { isDeleted: { $ne: true } };

    if (category && category !== 'all') {
      filter.category = category;
    }

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }

    const [filteredTotal, blogs, totalAll, publishedCount, draftCount] = await Promise.all([
      Blog.countDocuments(filter),
      Blog.find(filter)
        .select('-content') // Optimize payload size for super-fast list response
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Blog.countDocuments({ isDeleted: { $ne: true } }),
      Blog.countDocuments({ isDeleted: { $ne: true }, status: 'published' }),
      Blog.countDocuments({ isDeleted: { $ne: true }, status: 'draft' }),
    ]);

    const totalPages = Math.ceil(filteredTotal / limitNum) || 1;

    res.status(200).json({
      success: true,
      counts: {
        total: totalAll,
        published: publishedCount,
        draft: draftCount,
      },
      pagination: {
        total: filteredTotal,
        page: pageNum,
        limit: limitNum,
        totalPages,
        hasPrev: pageNum > 1,
        hasNext: pageNum < totalPages,
      },
      data: blogs,
    });
  } catch (err) {
    next(err);
  }
});

// Create New Blog
router.post('/blogs', protect, adminOnly, uploadBlogImage.single('coverImage'), compressBlogCover, async (req, res, next) => {
  try {
    const { title, excerpt, content, category, author, readTime, status, isFeatured } = req.body;

    if (!title || !excerpt || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title, excerpt, and content are required fields',
      });
    }

    let coverImage = '/img/blog/1.jpg';
    if (req.file) {
      coverImage = `/uploads/images/${req.file.filename}`;
    } else if (req.body.coverImage && typeof req.body.coverImage === 'string' && req.body.coverImage.trim()) {
      coverImage = req.body.coverImage.trim();
    }

    const newBlog = await Blog.create({
      title: title.trim(),
      excerpt: excerpt.trim(),
      content: content.trim(),
      category: category || 'Market Trends',
      author: (author || req.user.name || 'runr team').trim(),
      readTime: (readTime || '5 min').trim(),
      status: status === 'draft' ? 'draft' : 'published',
      isFeatured: isFeatured === 'true' || isFeatured === true,
      coverImage,
    });

    res.status(201).json({
      success: true,
      message: 'Blog post created successfully',
      data: newBlog,
    });
  } catch (err) {
    next(err);
  }
});

// Get Single Blog Detail (Includes full content for editing)
router.get('/blogs/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog || blog.isDeleted) {
      return res.status(404).json({ success: false, message: 'Blog post not found' });
    }
    res.status(200).json({ success: true, data: blog });
  } catch (err) {
    next(err);
  }
});

// Update Existing Blog
router.put('/blogs/:id', protect, adminOnly, uploadBlogImage.single('coverImage'), compressBlogCover, async (req, res, next) => {
  try {
    const { title, excerpt, content, category, author, readTime, status, isFeatured } = req.body;

    const blog = await Blog.findById(req.params.id);
    if (!blog || blog.isDeleted) {
      return res.status(404).json({ success: false, message: 'Blog post not found' });
    }

    if (title) blog.title = title.trim();
    if (excerpt) blog.excerpt = excerpt.trim();
    if (content) blog.content = content.trim();
    if (category) blog.category = category;
    if (author) blog.author = author.trim();
    if (readTime) blog.readTime = readTime.trim();
    if (status) blog.status = status;
    if (isFeatured !== undefined) blog.isFeatured = isFeatured === 'true' || isFeatured === true;

    if (req.file) {
      blog.coverImage = `/uploads/images/${req.file.filename}`;
    } else if (req.body.coverImage && typeof req.body.coverImage === 'string' && req.body.coverImage.trim()) {
      blog.coverImage = req.body.coverImage.trim();
    }

    await blog.save();

    res.status(200).json({
      success: true,
      message: 'Blog post updated successfully',
      data: blog,
    });
  } catch (err) {
    next(err);
  }
});

// Quick Toggle Blog Status (published / draft)
router.patch('/blogs/:id/status', protect, adminOnly, async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['published', 'draft'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status. Must be "published" or "draft"' });
    }

    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      { $set: { status } },
      { new: true }
    );

    if (!blog || blog.isDeleted) {
      return res.status(404).json({ success: false, message: 'Blog post not found' });
    }

    res.status(200).json({
      success: true,
      message: `Blog status updated to ${status}`,
      data: blog,
    });
  } catch (err) {
    next(err);
  }
});

// Soft Delete Blog
router.delete('/blogs/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog || blog.isDeleted) {
      return res.status(404).json({ success: false, message: 'Blog post not found' });
    }

    blog.isDeleted = true;
    await blog.save();

    res.status(200).json({
      success: true,
      message: 'Blog post deleted successfully',
      data: { _id: blog._id },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

