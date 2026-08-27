import express from 'express';
import {
  getBranches,
  getBranchById,
  createBranch,
  updateBranch,
  toggleBranchStatus,
  assignBranchManager,
} from '../controllers/branchController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(protect, getBranches)
  .post(protect, admin, createBranch);

router.route('/:id')
  .get(protect, getBranchById)
  .put(protect, admin, updateBranch);

router.put('/:id/toggle-status', protect, admin, toggleBranchStatus);
router.post('/:id/assign-manager', protect, admin, assignBranchManager);

export default router;
