import express from 'express';
import { body } from 'express-validator';
import {
  register,
  login,
  getProfile,
  updateProfile,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { successResponse } from '../utils/apiResponse.js';

const router = express.Router();

// Validation schema for register
const registerValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Email must be a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
];

// Validation schema for login
const loginValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Email must be a valid email address'),
  body('password').notEmpty().withMessage('Password is required'),
];

// Public Auth routes
router.post('/register', validate(registerValidation), register);
router.post('/login', validate(loginValidation), login);

// Protected Auth routes
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

/**
 * Logout route.
 * Server is stateless (JWT), so we just instruct the client to delete the token.
 */
router.post('/logout', protect, (req, res) => {
  return successResponse(res, null, 'Logged out successfully');
});

export default router;
