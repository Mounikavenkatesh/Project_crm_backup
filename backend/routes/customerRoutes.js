import express from 'express';
import { body } from 'express-validator';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  getCustomers,
  createCustomer,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
} from '../controllers/customerController.js';

const router = express.Router();

router.use(protect);

const customerValidationRules = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Customer name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be 2-100 characters'),
  body('company').trim().notEmpty().withMessage('Company is required'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Email must be valid'),
  body('status')
    .optional()
    .isIn(['Active', 'Inactive', 'Churned', 'VIP'])
    .withMessage('Invalid customer status'),
  body('totalRevenue')
    .optional()
    .isNumeric()
    .withMessage('Total revenue must be numeric'),
];

router.route('/')
  .get(getCustomers)
  .post(validate(customerValidationRules), createCustomer);

router.route('/:id')
  .get(getCustomerById)
  .put(validate(customerValidationRules), updateCustomer)
  .delete(deleteCustomer);

export default router;
