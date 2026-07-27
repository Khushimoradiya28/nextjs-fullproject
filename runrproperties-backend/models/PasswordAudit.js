const mongoose = require('mongoose');

const passwordAuditSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    changedAt: {
      type: Date,
      default: Date.now,
    },
    changedBy: {
      type: String,
      enum: ['self', 'admin'],
      default: 'self',
    },
    method: {
      type: String,
      enum: ['reset-password', 'change-password'],
      required: true,
    },
    ipAddress: {
      type: String,
      default: '',
    },
    userAgent: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: false,
  }
);

passwordAuditSchema.index({ userId: 1, changedAt: -1 });

module.exports = mongoose.model('PasswordAudit', passwordAuditSchema);
