const BankPartner = require('../models/BankPartner');
const BankLead = require('../models/BankLead');
const User = require('../models/User');
const Role = require('../models/Role');
const bcrypt = require('bcryptjs');

// 1. Register bank partner
const registerBankPartner = async (data) => {
  const { name, bankName, email, mobile, password } = data;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const error = new Error('Email already registered');
    error.statusCode = 400;
    throw error;
  }

  // Fetch bank_partner role from Role table
  const roleDoc = await Role.findOne({ name: 'bank_partner', isActive: true });

  const user = await User.create({
    name,
    email,
    password,
    role: 'bank_partner',
    roleId: roleDoc ? roleDoc._id : undefined,
    mobile: mobile || '',
  });

  const bankPartner = await BankPartner.create({
    userId: user._id,
    bankName: bankName || name,
    status: 'pending',
  });

  return { user, bankPartner };
};

// 2. Get bank partner profile by userId
const getBankPartnerProfile = async (userId) => {
  const profile = await BankPartner.findOne({ userId });
  if (!profile) {
    const error = new Error('Bank partner profile not found');
    error.statusCode = 404;
    throw error;
  }
  return profile;
};

// 3. Update bank partner profile
const updateBankPartnerProfile = async (userId, data) => {
  const {
    bankName,
    tagline,
    description,
    interestRate,
    loanType,
    processingFee,
    maxTenure,
    features,
    isActive,
  } = data;

  const updateFields = {};
  if (bankName !== undefined) updateFields.bankName = bankName;
  if (tagline !== undefined) updateFields.tagline = tagline;
  if (description !== undefined) updateFields.description = description;
  if (interestRate !== undefined) updateFields.interestRate = interestRate;
  if (loanType !== undefined) updateFields.loanType = loanType;
  if (processingFee !== undefined) updateFields.processingFee = processingFee;
  if (maxTenure !== undefined) updateFields.maxTenure = maxTenure;
  if (features !== undefined) updateFields.features = features;
  if (isActive !== undefined) updateFields.isActive = isActive;

  const profile = await BankPartner.findOneAndUpdate(
    { userId },
    updateFields,
    { new: true }
  );
  if (!profile) {
    const error = new Error('Bank partner profile not found');
    error.statusCode = 404;
    throw error;
  }
  return profile;
};

// 4. Upload logo
const updateBankLogo = async (userId, logoPath) => {
  const profile = await BankPartner.findOneAndUpdate(
    { userId },
    { logo: logoPath },
    { new: true }
  );
  return profile;
};

// 5. Add offer
const addOffer = async (userId, data) => {
  const profile = await BankPartner.findOne({ userId });
  if (!profile) {
    const e = new Error('Bank partner not found');
    e.statusCode = 404; throw e;
  }
  profile.offers.push({
    interestRate: data.interestRate || '',
    processingFee: data.processingFee || '',
    loanType: data.loanType || '',
    maxTenure: data.maxTenure || '',
    features: data.features || [],
  });
  await profile.save();
  return profile;
};

// 6. Delete offer
const deleteOffer = async (userId, offerId) => {
  const profile = await BankPartner.findOne({ userId });
  if (!profile) {
    const e = new Error('Bank partner not found');
    e.statusCode = 404; throw e;
  }
  profile.offers = profile.offers.filter(
    o => o._id.toString() !== offerId
  );
  await profile.save();
  return profile;
};

// 7. Update offer
const updateOffer = async (userId, offerId, data) => {
  const profile = await BankPartner.findOne({ userId });
  if (!profile) {
    const e = new Error('Bank partner not found');
    e.statusCode = 404; throw e;
  }
  const offer = profile.offers.id(offerId);
  if (!offer) {
    const e = new Error('Offer not found');
    e.statusCode = 404; throw e;
  }
  if (data.interestRate !== undefined) offer.interestRate = data.interestRate;
  if (data.processingFee !== undefined) offer.processingFee = data.processingFee;
  if (data.loanType !== undefined) offer.loanType = data.loanType;
  if (data.maxTenure !== undefined) offer.maxTenure = data.maxTenure;
  if (data.features !== undefined) offer.features = data.features;
  // Sync top-level fields for public display
  profile.interestRate = offer.interestRate;
  profile.loanType = offer.loanType;
  profile.processingFee = offer.processingFee;
  profile.maxTenure = offer.maxTenure;
  profile.features = offer.features;
  await profile.save();
  return profile;
};

// 8. Get all leads for this bank partner
const getBankLeads = async (userId, query = {}) => {
  const profile = await BankPartner.findOne({ userId });
  if (!profile) {
    const error = new Error('Bank partner not found');
    error.statusCode = 404;
    throw error;
  }

  const { page = 1, limit = 20, status } = query;
  const filter = { bankId: profile._id };
  if (status) filter.status = status;

  const skip = (Number(page) - 1) * Number(limit);
  const [leads, total] = await Promise.all([
    BankLead.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    BankLead.countDocuments(filter),
  ]);

  return {
    leads,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    },
  };
};

// 9. Update lead status + notes
const updateLeadStatus = async (userId, leadId, data) => {
  const profile = await BankPartner.findOne({ userId });
  if (!profile) {
    const error = new Error('Bank partner not found');
    error.statusCode = 404;
    throw error;
  }

  const lead = await BankLead.findOneAndUpdate(
    { _id: leadId, bankId: profile._id },
    {
      status: data.status,
      notes: data.notes,
    },
    { new: true }
  );
  if (!lead) {
    const error = new Error('Lead not found');
    error.statusCode = 404;
    throw error;
  }
  return lead;
};

// 10. Submit lead (user side)
const submitLead = async (data, userId = null) => {
  const bank = await BankPartner.findById(data.bankId);
  if (!bank || bank.status !== 'approved') {
    const error = new Error('Bank partner not found or not approved');
    error.statusCode = 404;
    throw error;
  }

  const lead = await BankLead.create({
    bankId: bank._id,
    bankName: bank.bankName,
    userId: userId,
    name: data.name,
    email: data.email,
    phone: data.phone,
    loanAmount: data.loanAmount,
    message: data.message || '',
    status: 'pending',
  });

  return lead;
};

// 11. Get all approved bank partners (public)
const getApprovedBanks = async () => {
  const banks = await BankPartner.find({
    status: 'approved',
    isActive: true,
  }).sort({ createdAt: -1 });
  return banks;
};

module.exports = {
  registerBankPartner,
  getBankPartnerProfile,
  updateBankPartnerProfile,
  updateBankLogo,
  addOffer,
  deleteOffer,
  updateOffer,
  getBankLeads,
  updateLeadStatus,
  submitLead,
  getApprovedBanks,
};
