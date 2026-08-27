import express from 'express';
import {
  getPlatformAnalytics,
  getBranchPerformanceMatrix,
  getBranchDrilldownDetails,
  getAdminStats,
  getManagerStats,
} from '../controllers/analyticsController.js';
import { protect, admin, manager } from '../middleware/auth.js';

const router = express.Router();

router.get('/platform-summary', protect, admin, getPlatformAnalytics);
router.get('/branch-matrix', protect, admin, getBranchPerformanceMatrix);
router.get('/drilldown/branch/:branchId', protect, admin, getBranchDrilldownDetails);

router.route('/admin')
  .get(protect, admin, getAdminStats);

router.route('/manager')
  .get(protect, manager, getManagerStats);

export default router;
