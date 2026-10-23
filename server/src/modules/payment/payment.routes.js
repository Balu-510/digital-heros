import express from 'express';
import { createCheckoutSession } from './payment.controller.js';
import { protect } from '../../middleware/auth.middleware.js';

const router = express.Router();

// NOTE: the Stripe webhook (POST /api/payments/webhook) is registered directly in app.js
// because it needs the raw request body and must not require a login cookie.
router.post('/create-checkout-session', protect, createCheckoutSession);

export default router;
