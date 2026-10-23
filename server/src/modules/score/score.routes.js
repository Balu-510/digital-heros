import express from 'express';
import { addScore, getScores, updateScore } from './score.controller.js';
import { protect } from '../../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);
router.post('/', addScore);
router.get('/', getScores)
router.put('/:id', updateScore);

export default router;