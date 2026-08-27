import express from 'express';
import {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  createBranchManager,
  getBranchManagersList,
  fireBranchManager,
  forgotPassword,
  verifyOTP,
  resetPassword,
} from '../controllers/authController.js';
import { protect, admin } from '../middleware/auth.js';
import { authRateLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/register', authRateLimiter, registerUser);
router.post('/login', authRateLimiter, loginUser);
router.get('/managers', protect, admin, getBranchManagersList);
router.post('/create-manager', protect, admin, createBranchManager);
router.post('/fire-manager/:id', protect, admin, fireBranchManager);
router.post('/forgot-password', authRateLimiter, forgotPassword);
router.post('/verify-otp', authRateLimiter, verifyOTP);
router.post('/reset-password', authRateLimiter, resetPassword);
router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

export default router;


