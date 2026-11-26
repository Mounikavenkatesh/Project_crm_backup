import express from 'express';
import { protect } from '../middleware/auth.js';
import { getAnalyticsOverview } from '../controllers/analyticsController.js';

const router = express.Router();

router.use(protect);
router.get('/overview', getAnalyticsOverview);

export default router;
