import express from 'express';
import {
  getLoanProducts,
  getLoanProductById,
  createLoanProduct,
  updateLoanProduct,
  toggleLoanProductStatus,
} from '../controllers/loanProductController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(getLoanProducts)
  .post(protect, admin, createLoanProduct);

router.route('/:id')
  .get(getLoanProductById)
  .put(protect, admin, updateLoanProduct);

router.put('/:id/toggle-status', protect, admin, toggleLoanProductStatus);

export default router;
