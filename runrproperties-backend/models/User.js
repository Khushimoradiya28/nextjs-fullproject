const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { getRandomAvatarColor } = require('../utils/avatarColors');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    mobile: {
      type: String,
      trim: true,
      default: '',
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: ['buyer', 'owner', 'bank_partner', 'admin'],
      default: 'buyer',
    },
    roleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Role',
    },
    avatarColor: {
      type: String,
      default: function () {
        return getRandomAvatarColor();
      },
    },
    profilePhoto: {
      type: String,
      default: '',
    },
    resetPasswordToken: {
      type: String,
      select: false,
    },
    resetPasswordExpire: {
      type: Date,
      select: false,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Assign avatar color on first save (creation) if not already set
userSchema.pre('save', function () {
  if (this.isNew && !this.avatarColor) {
    this.avatarColor = getRandomAvatarColor();
  }
});

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare entered password with hashed password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

/**
 * Post-query hooks to auto-backfill avatarColor for existing users.
 * This ensures that any user fetched (including via populate) gets a
 * permanent avatarColor assigned and saved if missing.
 */
async function backfillAvatarColor(doc) {
  if (doc && !doc.avatarColor) {
    doc.avatarColor = getRandomAvatarColor();
    await mongoose.model('User').updateOne(
      { _id: doc._id, avatarColor: null },
      { $set: { avatarColor: doc.avatarColor } }
    );
  }
}

userSchema.post('findOne', async function (doc) {
  await backfillAvatarColor(doc);
});

userSchema.post('find', async function (docs) {
  if (!docs || docs.length === 0) return;
  const updates = [];
  for (const doc of docs) {
    if (doc && !doc.avatarColor) {
      doc.avatarColor = getRandomAvatarColor();
      updates.push({
        updateOne: {
          filter: { _id: doc._id, avatarColor: null },
          update: { $set: { avatarColor: doc.avatarColor } },
        },
      });
    }
  }
  if (updates.length > 0) {
    await mongoose.model('User').bulkWrite(updates);
  }
});

module.exports = mongoose.model('User', userSchema);
