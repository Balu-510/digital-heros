import express from 'express';
import { getPlatformAnalytics, getPendingVerifications, processVerification } from './admin.controller.js';
import { protect, restrictTo } from '../../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);
router.use(restrictTo('admin'));

router.get('/analytics', getPlatformAnalytics);
router.get('/verifications', getPendingVerifications);
router.put('/verifications/:drawId', processVerification);

export default router;