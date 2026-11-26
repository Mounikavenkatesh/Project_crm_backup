import express from 'express';
import { body } from 'express-validator';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  getTeamMembers,
  getUsers,
  createUser,
  updateUser,
  deleteUser,
} from '../controllers/userController.js';

const router = express.Router();

router.use(protect);

// Any signed-in user can view active team members for assignment dropdowns
router.get('/team', getTeamMembers);

const createUserValidation = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 2, max: 60 }),
  body('email').trim().notEmpty().isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['admin', 'manager', 'user']).withMessage('Invalid role'),
];

const updateUserValidation = [
  body('name').optional().trim().isLength({ min: 2, max: 60 }),
  body('role').optional().isIn(['admin', 'manager', 'user']).withMessage('Invalid role'),
  body('isActive').optional().isBoolean().withMessage('isActive must be boolean'),
];

router.get('/', authorize('admin', 'manager'), getUsers);
router.post('/', authorize('admin'), validate(createUserValidation), createUser);
router.put('/:id', authorize('admin'), validate(updateUserValidation), updateUser);
router.delete('/:id', authorize('admin'), deleteUser);

export default router;
