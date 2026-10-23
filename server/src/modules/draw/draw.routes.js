import express from 'express';
import { simulateDraw, publishDraw, uploadVerificationProof, getUserWinnings } from './draw.controller.js';
import { upload } from '../../middleware/upload.middleware.js';
import { protect, restrictTo } from '../../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

// Subscriber Routes
router.get('/my-winnings', getUserWinnings);
router.post('/:id/verify', upload.single('proof'), uploadVerificationProof);

// Admin Only Routes
router.post('/simulate', restrictTo('admin'), simulateDraw);
router.put('/:id/publish', restrictTo('admin'), publishDraw);

export default router;