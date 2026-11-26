import express from 'express';
import { body } from 'express-validator';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { getSettings, updateSettings } from '../controllers/settingsController.js';

const router = express.Router();

router.use(protect);

const settingsValidation = [
  body('companyName').optional().trim().isLength({ min: 1, max: 100 }),
  body('currency').optional().trim().isIn(['INR', 'USD', 'EUR', 'GBP']),
  body('theme').optional().trim().isIn(['light', 'dark', 'system']),
  body('emailNotifications').optional().isBoolean(),
  body('taskReminders').optional().isBoolean(),
  body('leadAlerts').optional().isBoolean(),
  body('weeklyDigest').optional().isBoolean(),
];

router.get('/', getSettings);
router.put('/', validate(settingsValidation), updateSettings);

export default router;
