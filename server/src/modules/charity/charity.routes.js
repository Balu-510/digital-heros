import express from 'express';
import { getCharities, getFeaturedCharities, createCharity } from './charity.controller.js';
import { protect, restrictTo } from '../../middleware/auth.middleware.js';

const router = express.Router();

// Public Routes
router.get('/', getCharities);
router.get('/featured', getFeaturedCharities);

// Protected Admin Routes
router.use(protect);
router.use(restrictTo('admin'));
router.post('/', createCharity);

export default router;