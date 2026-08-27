import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import upload from '../middleware/upload.js';
import {
  createLoanApplication,
  updateLoanApplication,
  uploadApplicationDocument,
  submitLoanApplication,
  getMyLoanApplications,
  getBranchReviewQueue,
  getLoanApplicationById,
  verifyApplicationDocument,
  requestDocumentReupload,
  decideLoanApplication,
  reassignApplicationBranch,
  getApplicationAuditTrail,
  acceptSanctionLetter,
  disburseLoanApplication,
  uploadFieldEvidence,
} from '../controllers/loanApplicationController.js';

const router = express.Router();

router.use(protect);

router.post('/', createLoanApplication);
router.get('/my', getMyLoanApplications);
router.get('/branch-queue', authorize('Branch Manager', 'Admin'), getBranchReviewQueue);
router.get('/:id', getLoanApplicationById);
router.get('/:id/audit-trail', getApplicationAuditTrail);
router.put('/:id', updateLoanApplication);
router.post('/:id/upload', upload.single('document'), uploadApplicationDocument);
router.post('/:id/field-evidence', authorize('Branch Manager', 'Admin'), upload.single('evidence'), uploadFieldEvidence);
router.post('/:id/submit', submitLoanApplication);
router.post('/:id/verify-doc', authorize('Branch Manager', 'Admin'), verifyApplicationDocument);
router.post('/:id/request-reupload', authorize('Branch Manager', 'Admin'), requestDocumentReupload);
router.post('/:id/decide', authorize('Branch Manager', 'Admin'), decideLoanApplication);
router.post('/:id/reassign-branch', authorize('Admin'), reassignApplicationBranch);
router.post('/:id/accept-sanction', acceptSanctionLetter);
router.post('/:id/disburse', authorize('Branch Manager', 'Admin'), disburseLoanApplication);

export default router;
