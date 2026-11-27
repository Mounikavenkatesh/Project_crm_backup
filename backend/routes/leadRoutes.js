import express from 'express';
import { body } from 'express-validator';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  getLeads,
  createLead,
  getLeadById,
  updateLead,
  updateLeadStatus,
  deleteLead,
  getLeadStats,
  getMonthlyStats,
  searchLeads,
} from '../controllers/leadController.js';

const router = express.Router();

// Apply protect middleware to ALL routes in this file
router.use(protect);

// Lead validation schema
const leadValidationRules = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters'),
  body('company')
    .trim()
    .notEmpty()
    .withMessage('Company is required'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Email must be a valid email address'),
  body('status')
    .optional()
    .isIn(['New', 'Contacted', 'Meeting Scheduled', 'Proposal Sent', 'Won', 'Lost'])
    .withMessage('Status must be a valid enum value'),
  body('source')
    .optional()
    .isIn(['Website', 'Referral', 'LinkedIn', 'Cold Call', 'Email Campaign', 'Other'])
    .withMessage('Source must be a valid enum value'),
  body('value')
    .optional()
    .isNumeric()
    .withMessage('Value must be a numeric amount'),
  body('notes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters'),
];

// 1. Search / Autocomplete (Must be placed BEFORE /:id to avoid CastError)
router.get('/search', searchLeads);

// 2. Analytics Summary Stats (Must be placed BEFORE /:id)
router.get('/stats/summary', getLeadStats);

// 3. Analytics Monthly Counts (Must be placed BEFORE /:id)
router.get('/stats/monthly', getMonthlyStats);

// 4. Standard CRUD Endpoints
router.route('/')
  .get(getLeads)
  .post(validate(leadValidationRules), createLead);

router.route('/:id')
  .get(getLeadById)
  .put(validate(leadValidationRules), updateLead)
  .delete(deleteLead);

// 5. Update Status Only Endpoint
router.patch(
  '/:id/status',
  validate([
    body('status')
      .notEmpty()
      .withMessage('Status is required')
      .isIn(['New', 'Contacted', 'Meeting Scheduled', 'Proposal Sent', 'Won', 'Lost'])
      .withMessage('Status must be a valid enum value'),
  ]),
  updateLeadStatus
);

export default router;
