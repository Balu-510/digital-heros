import express from 'express';
import { registerUser, loginUser, logoutUser, getUserProfile } from './user.controller.js';
import { updateCharityPreference } from '../charity/charity.controller.js';
import { protect } from '../../middleware/auth.middleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);

router.use(protect);
router.get('/me', getUserProfile);
router.put('/charity-preference', updateCharityPreference);

export default router;