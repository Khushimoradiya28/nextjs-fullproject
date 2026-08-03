const mongoose = require('mongoose');

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
    default: '',
  },
  tagline: {
    type: String,
    default: '',
  },
  interestRate: {
    type: String,
    required: [true, 'Interest rate is required'],
    // e.g. "8.40%"
  },
  description: {
    type: String,
    default: '',
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
