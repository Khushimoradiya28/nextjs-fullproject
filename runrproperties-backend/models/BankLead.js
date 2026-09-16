const mongoose = require('mongoose');

const bankLeadSchema = new mongoose.Schema({
  bankId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BankPartner',
    required: true,
  },
  bankName: {
    type: String,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
  },
  phone: {
    type: String,
    required: [true, 'Phone is required'],
    trim: true,
  },
  loanAmount: {
    type: String,
    required: [true, 'Loan amount is required'],
  },
  employmentType: {
    type: String,
    enum: ['Salaried', 'Self-Employed', 'Business', 'Other', ''],
    default: 'Salaried',
  },
  monthlyIncome: {
    type: String,
    default: '',
  },
  propertyTitle: {
    type: String,
    default: '',
  },
  propertyId: {
    type: String,
    default: '',
  },
  message: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['pending', 'contacted', 'in_progress', 'approved', 'rejected', 'closed_won', 'closed_lost'],
    default: 'pending',
  },
  notes: {
    type: String,
    default: '',
  },
}, { timestamps: true });

module.exports = mongoose.model('BankLead', bankLeadSchema);
