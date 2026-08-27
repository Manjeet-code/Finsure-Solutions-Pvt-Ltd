import express from 'express';
import { processPayment, getMyPayments } from '../controllers/paymentController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .post(protect, processPayment);

router.route('/myhistory')
  .get(protect, getMyPayments);

export default router;
