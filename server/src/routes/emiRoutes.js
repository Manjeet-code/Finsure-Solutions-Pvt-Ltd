import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  getMyEmiSchedule,
  getEmiScheduleByLoanId,
  payEmiInstallment,
  getOverdueEmiReport,
} from '../controllers/emiController.js';

const router = express.Router();

router.use(protect);

router.get('/my-schedule', getMyEmiSchedule);
router.get('/loan/:loanId', getEmiScheduleByLoanId);
router.post('/pay/:emiId', payEmiInstallment);
router.get('/overdue-report', authorize('Branch Manager', 'Admin'), getOverdueEmiReport);

export default router;
