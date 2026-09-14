const User = require('../models/User');
const Role = require('../models/Role');
const PasswordAudit = require('../models/PasswordAudit');
const BankPartner = require('../models/BankPartner');
const generateToken = require('../utils/generateToken');
const { sendResetPasswordEmail } = require('../utils/sendEmail');
const { getRandomAvatarColor } = require('../utils/avatarColors');
const crypto = require('crypto');

/**
 * Register a new user
 */
const registerUser = async ({ name, email, password, mobile, role }) => {
  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const error = new Error('User already exists with this email');
    error.statusCode = 400;
    throw error;
  }

  // Validate and fetch Role from Role table
  const requestedRoleName = role || 'buyer';
  let roleDoc = await Role.findOne({ name: requestedRoleName, isActive: true });
  if (!roleDoc) {
    // Fallback if role doc is not yet seeded
    roleDoc = await Role.findOne({ name: 'buyer', isActive: true });
  }

  // Create user with verified role and roleId link
  const user = await User.create({
    name,
    email,
    password,
    mobile,
    role: roleDoc ? roleDoc.name : requestedRoleName,
    roleId: roleDoc ? roleDoc._id : undefined,
  });

  // Generate token
  const token = generateToken(user._id);

  return {
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      role: user.role,
      avatarColor: user.avatarColor,
      profilePhoto: user.profilePhoto,
      createdAt: user.createdAt,
    },
    token,
  };
};

/**
 * Authenticate user and return token
 */
const loginUser = async ({ email, password }) => {
  // Find user and include password field
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  // Check password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  // Check if user is soft-deleted
  if (user.isDeleted) {
    const error = new Error('This account has been deleted or disabled. Please contact support.');
    error.statusCode = 403;
    throw error;
  }

  // Check if user is inactive / disabled by admin
  if (user.isActive === false) {
    const error = new Error('Your account has been deactivated by administrator. Access denied.');
    error.statusCode = 403;
    throw error;
  }

  // Verify Role is active in Role table
  const roleDoc = await Role.findOne({ name: user.role });
  if (roleDoc && !roleDoc.isActive) {
    const error = new Error('This user role is currently deactivated.');
    error.statusCode = 403;
    throw error;
  }

  // Ensure user has roleId linked
  if (!user.roleId && roleDoc) {
    user.roleId = roleDoc._id;
    await User.findByIdAndUpdate(user._id, { roleId: roleDoc._id });
  }

  // Bank partner approval status check (Must be approved by admin to login)
  if (user.role === 'bank_partner') {
    const bankProfile = await BankPartner.findOne({ userId: user._id });
    if (!bankProfile || bankProfile.status === 'pending') {
      const error = new Error('Your account is under review. Please wait for admin approval.');
      error.statusCode = 403;
      throw error;
    }
    if (bankProfile.status === 'rejected') {
      const error = new Error('Your account has been rejected. Contact support.');
      error.statusCode = 403;
      throw error;
    }
    if (bankProfile.status !== 'approved') {
      const error = new Error('Your account is not active. Contact admin.');
      error.statusCode = 403;
      throw error;
    }
  }

  // Backfill avatarColor for existing users who don't have one
  if (!user.avatarColor) {
    user.avatarColor = getRandomAvatarColor();
    await User.findByIdAndUpdate(user._id, { avatarColor: user.avatarColor });
  }

  // Generate token
  const token = generateToken(user._id);

  return {
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      role: user.role,
      avatarColor: user.avatarColor,
      profilePhoto: user.profilePhoto,
      createdAt: user.createdAt,
    },
    token,
  };
};

/**
 * Get current user profile
 */
const getCurrentUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  // Backfill avatarColor for existing users who don't have one
  if (!user.avatarColor) {
    user.avatarColor = getRandomAvatarColor();
    await User.findByIdAndUpdate(user._id, { avatarColor: user.avatarColor });
  }

  return user;
};

/**
 * Update user profile
 */
const updateProfile = async (userId, updateData) => {
  // Only allow specific fields to be updated
  const allowedFields = ['name', 'mobile'];
  const filteredData = {};

  Object.keys(updateData).forEach((key) => {
    if (allowedFields.includes(key)) {
      filteredData[key] = updateData[key];
    }
  });

  const user = await User.findByIdAndUpdate(userId, filteredData, {
    returnDocument: 'after',
    runValidators: true,
  });

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  return user;
};

/**
 * Change user password
 */
const changePassword = async (userId, { currentPassword, newPassword }) => {
  const user = await User.findById(userId).select('+password');
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  // Verify current password
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    const error = new Error('Current password is incorrect');
    error.statusCode = 400;
    throw error;
  }

  // Update password
  user.password = newPassword;
  await user.save();

  // Generate new token
  const token = generateToken(user._id);

  return { token };
};

/**
 * Forgot password
 * In production, this would send a reset email with a token
 */
const forgotPassword = async (email) => {
  const startTime = Date.now();
  console.log(`[FORGOT-PASSWORD] Start for: ${email}`);

  const user = await User.findOne({ email });
  if (!user) {
    const error = new Error('No user found with this email');
    error.statusCode = 404;
    throw error;
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  // Hash token and set to resetPasswordToken field
  user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  
  // Set expire to 10 minutes
  user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
  
  await user.save({ validateBeforeSave: false });
  console.log(`[FORGOT-PASSWORD] Token saved in ${Date.now() - startTime}ms`);
  
  // Construct reset URL pointing to frontend
  const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;
  
  // Send password reset email
  try {
    console.log(`[FORGOT-PASSWORD] Sending email...`);
    await sendResetPasswordEmail({
      email: user.email,
      name: user.name,
      resetUrl,
    });
    console.log(`[FORGOT-PASSWORD] Email sent in ${Date.now() - startTime}ms`);
  } catch (emailError) {
    console.error(`[FORGOT-PASSWORD] Email failed after ${Date.now() - startTime}ms:`, emailError.message);
    const error = new Error('Unable to send reset email. Please try again later.');
    error.statusCode = 500;
    throw error;
  }

  return { message: 'Password reset link sent to email' };
};

/**
 * Reset password
 */
const resetPassword = async (resetToken, newPassword, meta = {}) => {
  // Hash token to compare with database
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });
  
  if (!user) {
    const error = new Error('Invalid or expired reset token');
    error.statusCode = 400;
    throw error;
  }
  
  // Update password
  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  // Log password audit entry
  await PasswordAudit.create({
    userId: user._id,
    changedBy: 'self',
    method: 'reset-password',
    ipAddress: meta.ipAddress || '',
    userAgent: meta.userAgent || '',
  });

  console.log(`[AUDIT] Password reset successful for user: ${user.email}`);

  return { message: 'Password has been reset successfully' };
};

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
};
