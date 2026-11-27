import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/database.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import { formatUser } from '../utils/crmEnums.js';
import { logActivity } from '../utils/activityLogger.js';

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
    const name = String(req.body.name || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const { password } = req.body;

    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) {
      return errorResponse(res, 'Email is already registered', 400);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'USER',
        settings: {
          create: {},
        },
      },
    });

    const token = generateToken(user.id);
    const userObj = formatUser(user);

    await logActivity({
      userId: user.id,
      type: 'LOGIN',
      title: `${user.name} registered and signed in`,
    });

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
    const email = String(req.body.email || '').trim().toLowerCase();
    const { password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return errorResponse(res, 'Invalid credentials', 401);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return errorResponse(res, 'Invalid credentials', 401);
    }

    if (!user.isActive) {
      return errorResponse(res, 'Account is deactivated', 403);
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const token = generateToken(updatedUser.id);
    const userObj = formatUser(updatedUser);

    await logActivity({
      userId: updatedUser.id,
      type: 'LOGIN',
      title: `${updatedUser.name} signed in`,
    });

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
    return successResponse(res, req.user, 'Profile retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Update user profile.
 * Allows updating name (and optional phone/jobTitle/avatarUrl), and if new password is provided,
 * verifies old password first.
 * @route PUT /api/auth/profile
 * @access Private
 */
export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, jobTitle, avatarUrl, oldPassword, newPassword } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });

    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    const updateData = {};

    if (name !== undefined && String(name).trim()) {
      updateData.name = String(name).trim();
    }
    if (phone !== undefined) {
      updateData.phone = String(phone).trim();
    }
    if (jobTitle !== undefined) {
      updateData.jobTitle = String(jobTitle).trim();
    }
    if (avatarUrl !== undefined) {
      updateData.avatarUrl = String(avatarUrl).trim();
    }

    if (newPassword) {
      if (!oldPassword) {
        return errorResponse(
          res,
          'Old password is required to change password',
          400
        );
      }

      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        return errorResponse(res, 'Incorrect old password', 400);
      }

      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(newPassword, salt);
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
    });

    return successResponse(
      res,
      formatUser(updatedUser),
      'Profile updated successfully'
    );
  } catch (error) {
    next(error);
  }
};
