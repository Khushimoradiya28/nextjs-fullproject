const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
  interestRate: { type: String, default: '' },
  processingFee: { type: String, default: '' },
  loanType: { type: String, default: '' },
  maxTenure: { type: String, default: '' },
  features: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now },
});

const bankPartnerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  bankName: {
    type: String,
    required: [true, 'Bank name is required'],
    trim: true,
  },
  logo: {
    type: String,
    required: false,
    default: '',
  },
  tagline: {
    type: String,
    required: false,
    default: '',
  },
  interestRate: {
    type: String,
    required: false,
    default: '',
  },
  loanType: {
    type: String,
    required: false,
    default: '',
  },
  processingFee: {
    type: String,
    required: false,
    default: '',
  },
  maxTenure: {
    type: String,
    required: false,
    default: '',
  },
  features: {
    type: [String],
    required: false,
    default: [],
  },
  description: {
    type: String,
    required: false,
    default: '',
  },
  offers: {
    type: [offerSchema],
    default: [],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
}, { timestamps: true });

module.exports = mongoose.model('BankPartner', bankPartnerSchema);
