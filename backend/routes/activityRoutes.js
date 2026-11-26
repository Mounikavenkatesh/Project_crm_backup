import express from 'express';
import { protect } from '../middleware/auth.js';
import { getActivities } from '../controllers/activityController.js';

const router = express.Router();

router.use(protect);
router.get('/', getActivities);

export default router;
