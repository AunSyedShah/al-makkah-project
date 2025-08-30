import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User } from '../models/index.js';
import { authenticate } from '../middleware/auth.js';
import { sendResponse, sendError, validateRequiredFields } from '../utils/helpers.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here';

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, role, phoneNumber } = req.body;
    
    validateRequiredFields(req.body, ['email', 'password', 'firstName', 'lastName']);
    
    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return sendError(res, new Error('User already exists'), 400);
    }
    
    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Create user
    const user = new User({
      email: email.toLowerCase(),
      password: hashedPassword,
      firstName,
      lastName,
      role: role || 'attendee',
      phoneNumber
    });
    
    await user.save();
    
    // Generate token
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
    
    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;
    
    sendResponse(res, { user: userResponse, token }, 'User registered successfully', 201);
  } catch (error) {
    sendError(res, error, 400);
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    validateRequiredFields(req.body, ['email', 'password']);
    
    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !user.isActive) {
      return sendError(res, new Error('Invalid credentials'), 401);
    }
    
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return sendError(res, new Error('Invalid credentials'), 401);
    }
    
    // Generate token
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
    
    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;
    
    sendResponse(res, { user: userResponse, token }, 'Login successful');
  } catch (error) {
    sendError(res, error);
  }
});

// Get current user
router.get('/me', authenticate, async (req, res) => {
  try {
    sendResponse(res, req.user, 'User profile retrieved');
  } catch (error) {
    sendError(res, error);
  }
});

// Update profile
router.put('/profile', authenticate, async (req, res) => {
  try {
    const allowedUpdates = ['firstName', 'lastName', 'phoneNumber', 'profileImage'];
    const updates = Object.keys(req.body)
      .filter(key => allowedUpdates.includes(key))
      .reduce((obj, key) => {
        obj[key] = req.body[key];
        return obj;
      }, {});
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');
    
    sendResponse(res, user, 'Profile updated successfully');
  } catch (error) {
    sendError(res, error, 400);
  }
});

// Change password
router.put('/change-password', authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    validateRequiredFields(req.body, ['currentPassword', 'newPassword']);
    
    const user = await User.findById(req.user._id);
    
    // Check current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return sendError(res, new Error('Current password is incorrect'), 400);
    }
    
    // Hash new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    
    // Update password
    user.password = hashedPassword;
    await user.save();
    
    sendResponse(res, null, 'Password changed successfully');
  } catch (error) {
    sendError(res, error, 400);
  }
});

// Forgot password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    validateRequiredFields(req.body, ['email']);
    
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return sendResponse(res, null, 'If the email exists, a reset link will be sent');
    }
    
    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour
    
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpiry;
    await user.save();
    
    // In a real app, send email here
    console.log(`Reset token for ${email}: ${resetToken}`);
    
    sendResponse(res, null, 'If the email exists, a reset link will be sent');
  } catch (error) {
    sendError(res, error);
  }
});

// Reset password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    validateRequiredFields(req.body, ['token', 'newPassword']);
    
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() }
    });
    
    if (!user) {
      return sendError(res, new Error('Invalid or expired reset token'), 400);
    }
    
    // Hash new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    
    // Update password and clear reset token
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    
    sendResponse(res, null, 'Password reset successfully');
  } catch (error) {
    sendError(res, error, 400);
  }
});

// Logout (client-side token removal, but we can blacklist tokens if needed)
router.post('/logout', authenticate, async (req, res) => {
  try {
    sendResponse(res, null, 'Logged out successfully');
  } catch (error) {
    sendError(res, error);
  }
});

export default router;
