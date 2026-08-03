import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

/**
 * Generate a JWT token for the user.
 * @param {string} userId User ID to embed in the token.
 * @returns {string} Signed JWT.
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

/**
 * Register a new user.
 * @route POST /api/auth/register
 * @access Public
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return errorResponse(res, 'Email is already registered', 400);
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      password,
    });

    const token = generateToken(user._id);

    // Remove password before returning
    const userObj = user.toJSON();

    return successResponse(
      res,
      { token, user: userObj },
      'User registered successfully',
      201
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Login user and issue token.
 * @route POST /api/auth/login
 * @access Public
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user and explicitly select password
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      // 401 Unauthorized for security (never reveal whether email or password is wrong)
      return errorResponse(res, 'Invalid credentials', 401);
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return errorResponse(res, 'Invalid credentials', 401);
    }

    // Check if user is active
    if (!user.isActive) {
      return errorResponse(res, 'Account is deactivated', 403);
    }

    const token = generateToken(user._id);
    const userObj = user.toJSON();

    return successResponse(
      res,
      { token, user: userObj },
      'Login successful',
      200
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user profile.
 * @route GET /api/auth/profile
 * @access Private
 */
export const getProfile = async (req, res, next) => {
  try {
    // req.user is already set by protect middleware
    return successResponse(res, req.user, 'Profile retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Update user profile.
 * Allows updating name, and if new password is provided, verifies old password first.
 * @route PUT /api/auth/profile
 * @access Private
 */
export const updateProfile = async (req, res, next) => {
  try {
    const { name, oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    // Update name if provided
    if (name) {
      user.name = name;
    }

    // Update password if newPassword is provided
    if (newPassword) {
      if (!oldPassword) {
        return errorResponse(
          res,
          'Old password is required to change password',
          400
        );
      }

      const isMatch = await user.comparePassword(oldPassword);
      if (!isMatch) {
        return errorResponse(res, 'Incorrect old password', 400);
      }

      user.password = newPassword;
    }

    await user.save();

    // Convert to JSON to strip password
    const updatedUserObj = user.toJSON();

    return successResponse(res, updatedUserObj, 'Profile updated successfully');
  } catch (error) {
    next(error);
  }
};
