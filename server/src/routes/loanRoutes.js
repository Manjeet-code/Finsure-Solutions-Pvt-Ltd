import express from 'express';
import {
  submitLoanApplication,
  uploadDocument,
  getLoanDocuments,
  verifyDocument,
  getMyLoans,
  getAllLoans,
  updateLoanStatus
} from '../controllers/loanController.js';
import { protect, manager } from '../middleware/auth.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

router.route('/')
  .post(protect, submitLoanApplication)
  .get(protect, manager, getAllLoans);

router.route('/myloans')
  .get(protect, getMyLoans);

router.route('/:id/documents')
  .post(protect, upload.single('document'), uploadDocument)
  .get(protect, getLoanDocuments);

router.route('/documents/:docId/status')
  .put(protect, manager, verifyDocument);

router.route('/:id/status')
  .put(protect, manager, updateLoanStatus);

export default router;

