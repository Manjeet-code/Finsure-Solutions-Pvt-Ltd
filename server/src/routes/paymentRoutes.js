import express from 'express';
import { processPayment, getMyPayments } from '../controllers/paymentController.js';
import { mockBankDisburse, mockRepayment } from '../controllers/mockBankController.js';
import { protect, manager } from '../middleware/auth.js';

const router = express.Router();

router.post('/mock-bank-disburse', protect, manager, mockBankDisburse);
router.post('/mock-repayment', protect, mockRepayment);

router.route('/')
  .post(protect, processPayment);

router.route('/myhistory')
  .get(protect, getMyPayments);

export default router;
