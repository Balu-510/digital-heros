import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import { connectDB } from './config/db.js';
import { isProd } from './config/env.js';
import userRoutes from './modules/user/user.routes.js';
import scoreRoutes from './modules/score/score.routes.js';
import paymentRoutes from './modules/payment/payment.routes.js';
import { handleStripeWebhook } from './modules/payment/payment.controller.js';
import charityRoutes from './modules/charity/charity.routes.js';
import drawRoutes from './modules/draw/draw.routes.js';
import adminRoutes from './modules/admin/admin.routes.js';

const app = express();

// Vercel (and most hosts) sit behind a proxy; needed for rate limiting and secure cookies.
app.set('trust proxy', 1);

app.use(helmet());

// Allowed browser origins: CLIENT_URL (one or several, comma separated) + the production frontend.
// Localhost origins are only allowed outside production.
const PRODUCTION_CLIENTS = ['https://client-henna-six-51.vercel.app'];
const clean = (o) => o.trim().replace(/\/$/, '');
const allowedOrigins = [
  ...new Set(
    [
      ...(process.env.CLIENT_URL || '').split(','),
      ...PRODUCTION_CLIENTS,
      ...(isProd ? [] : ['http://localhost:5173', 'http://127.0.0.1:5173']),
    ]
      .map(clean)
      .filter(Boolean)
  ),
];

app.use(
  cors({
    origin: (origin, cb) => {
      // allow non-browser tools (no Origin header) and whitelisted origins
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

if (!isProd) {
  app.use(morgan('dev'));
}

// Health checks (no database needed)
app.get('/', (req, res) => {
  res.status(200).json({ status: 'success', message: 'Digital Heroes API is running.' });
});
app.get(['/health', '/api/health'], async (req, res) => {
  let db = 'connected';
  try {
    await connectDB();
  } catch (error) {
    db = `unavailable (${error.name})`;
  }
  res.status(db === 'connected' ? 200 : 503).json({
    status: db === 'connected' ? 'success' : 'degraded',
    message: 'Digital Heroes API is running.',
    db,
    cookies: isProd ? 'cross-site (SameSite=None; Secure)' : 'local (SameSite=Lax)',
    corsOrigins: allowedOrigins,
    stripePricesConfigured: Boolean(process.env.STRIPE_PRICE_MONTHLY && process.env.STRIPE_PRICE_YEARLY),
  });
});

// Make sure the database is connected before any route that needs it.
// Stripe's webhook is registered after this so it also has a connection.
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error('Database connection failed:', error.message);
    res.status(503).json({ message: 'Database unavailable. Please try again shortly.' });
  }
});

// Stripe webhook: needs the RAW body, so it is registered BEFORE express.json()
// and BEFORE the rate limiter.
app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);

app.use(express.json());
app.use(cookieParser());

// Express 5 makes req.query read-only; express-mongo-sanitize needs it writable.
app.use((req, res, next) => {
  if (req.query) {
    Object.defineProperty(req, 'query', {
      value: { ...req.query },
      writable: true,
      configurable: true,
      enumerable: true,
    });
  }
  next();
});
app.use(mongoSanitize());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests from this IP, please try again later.' },
});
app.use('/api', limiter);

app.use('/api/users', userRoutes);
app.use('/api/scores', scoreRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/charities', charityRoutes);
app.use('/api/draws', drawRoutes);
app.use('/api/admin', adminRoutes);

// 404 + error handlers
app.use((req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ message: err.message });
  }
  console.error(err);
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: 'File too large (max 5MB)' });
  }
  res.status(err.status || 500).json({ message: err.message || 'Server error' });
});

export default app;
