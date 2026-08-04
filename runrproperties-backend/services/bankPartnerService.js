const BankPartner = require('../models/BankPartner');
const BankLead = require('../models/BankLead');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Register bank partner
const registerBankPartner = async (data) => {
  const { name, bankName, email, mobile, password } = data;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const error = new Error('Email already registered');
    error.statusCode = 400;
    throw error;
  }

  const user = await User.create({
    name,
    email,
    password,
    role: 'bank_partner',
    mobile: mobile || '',
  });

  const bankPartner = await BankPartner.create({
    userId: user._id,
    bankName: bankName || name,
    status: 'pending',
  });

  return { user, bankPartner };
};

// Get bank partner profile by userId
const getBankPartnerProfile = async (userId) => {
  const profile = await BankPartner.findOne({ userId });
  if (!profile) {
    const error = new Error('Bank partner profile not found');
    error.statusCode = 404;
    throw error;
  }
  return profile;
};

// Update bank partner profile
const updateBankPartnerProfile = async (userId, data) => {
  const profile = await BankPartner.findOneAndUpdate(
    { userId },
    {
      bankName: data.bankName,
      tagline: data.tagline,
      interestRate: data.interestRate,
      loanType: data.loanType,
      processingFee: data.processingFee,
      maxTenure: data.maxTenure,
      description: data.description,
      isActive: data.isActive,
    },
    { new: true }
  );
  if (!profile) {
    const error = new Error('Bank partner profile not found');
    error.statusCode = 404;
    throw error;
  }
  return profile;
};

// Upload logo
const updateBankLogo = async (userId, logoPath) => {
  const profile = await BankPartner.findOneAndUpdate(
    { userId },
    { logo: logoPath },
    { new: true }
  );
  return profile;
};

// Get all leads for this bank partner
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

// Update lead status + notes
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

// Submit lead (user side)
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

// Get all approved bank partners (public)
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
  getBankLeads,
  updateLeadStatus,
  submitLead,
  getApprovedBanks,
};
