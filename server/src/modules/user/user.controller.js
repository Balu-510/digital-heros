import User from './user.model.js';
import jwt from 'jsonwebtoken';
import { isProd } from '../../config/env.js';

// In production the client and API live on different domains (e.g. two Vercel projects),
// so the cookie must be SameSite=None; Secure. In development, Lax over http is fine.
const cookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? 'none' : 'lax',
};

const generateToken = (res, userId) => {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '30d' });
  res.cookie('jwt', token, { ...cookieOptions, maxAge: 30 * 24 * 60 * 60 * 1000 });
};

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;

// POST /api/users/register
export const registerUser = async (req, res) => {
  try {
  const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : req.body.email;
  const { password } = req.body;

  if (!email || !EMAIL_REGEX.test(email)) {
    return res.status(400).json({ message: 'Please provide a valid email address.' });
  }

  if (!password || !PASSWORD_REGEX.test(password)) {
    return res.status(400).json({ 
      message: 'Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.' 
    });
  }

  const userExists = await User.findOne({ email });
  if (userExists) return res.status(400).json({ message: 'User already exists' });

  const user = await User.create({ email, password });
  if (user) {
    generateToken(res, user._id);
    res.status(201).json({ 
      _id: user._id, 
      email: user.email, 
      role: user.role,
      subscription: user.subscription 
    });
  } else {
    res.status(400).json({ message: 'Invalid user data' });
  }
  } catch (error) {
    if (error.code === 11000) return res.status(400).json({ message: 'User already exists' });
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// POST /api/users/login
export const loginUser = async (req, res) => {
  try {
  const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : req.body.email;
  const { password } = req.body;

  if (!email || !EMAIL_REGEX.test(email)) {
    return res.status(400).json({ message: 'Please provide a valid email address.' });
  }

  if (!password) {
    return res.status(400).json({ message: 'Password is required.' });
  }

  const user = await User.findOne({ email });
  
  if (user && (await user.matchPassword(password))) {
    generateToken(res, user._id);
    res.json({ 
      _id: user._id, 
      email: user.email, 
      role: user.role,
      subscription: user.subscription 
    });
  } else {
    res.status(401).json({ message: 'Invalid email or password' });
  }
  } catch {
    res.status(500).json({ message: 'Server error during login' });
  }
};

// POST /api/users/logout
export const logoutUser = (req, res) => {
  res.cookie('jwt', '', { ...cookieOptions, expires: new Date(0) });
  res.status(200).json({ message: 'Logged out successfully' });
};

// GET /api/users/me (Protected)
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile' });
  }
};