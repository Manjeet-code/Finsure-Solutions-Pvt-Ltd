import LoanApplication from '../models/LoanApplication.js';
import LoanProduct from '../models/LoanProduct.js';
import Branch from '../models/Branch.js';
import AuditLog from '../models/AuditLog.js';
import { generateEmiScheduleForLoan } from './emiController.js';
import { dispatchNotification } from '../utils/notificationDispatcher.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

// Helper function to log audit events
const logAuditEvent = async ({ applicationId, action, req, previousStatus, newStatus, remarks, details }) => {
  try {
    await AuditLog.create({
      applicationId,
      action,
      performedBy: req.user._id,
      performedByName: req.user.name || req.user.email,
      performedByRole: req.user.role,
      previousStatus,
      newStatus,
      remarks,
      details,
    });
  } catch (err) {
    console.error('Failed to log audit event:', err);
  }
};

// Helper function to find branch by pincode or city
const findMatchingBranch = async (pincode, city) => {
  if (pincode) {
    let branch = await Branch.findOne({ pincodeRanges: pincode, isActive: true });
    if (branch) return branch;
  }
  if (city) {
    let branch = await Branch.findOne({ city: new RegExp(`^${city}$`, 'i'), isActive: true });
    if (branch) return branch;
  }
  return await Branch.findOne({ isActive: true });
};

// @desc    Create or save draft loan application
// @route   POST /api/loans
// @access  Private (USER)
export const createLoanApplication = async (req, res) => {
  try {
    const {
      loanProductId,
      amount,
      tenureMonths,
      purpose,
      applicantDetails,
      status,
    } = req.body;

    if (!loanProductId || !amount || !tenureMonths || !applicantDetails) {
      return sendError(res, 'Loan product, amount, tenure, and applicant details are required', 400);
    }

    const productExists = await LoanProduct.findById(loanProductId);
    if (!productExists) {
      return sendError(res, 'Invalid loan product selected', 404);
    }

    const matchedBranch = await findMatchingBranch(applicantDetails.pincode, applicantDetails.city);
    const branchId = matchedBranch ? matchedBranch._id : null;
    const applicationStatus = status === 'Submitted' ? 'Submitted' : 'DRAFT';

    const application = await LoanApplication.create({
      citizenId: req.user._id,
      loanProductId,
      amount,
      tenureMonths,
      approvedAmount: amount,
      approvedTenureMonths: tenureMonths,
      purpose: purpose || 'General Financial Requirement',
      applicantDetails,
      status: applicationStatus,
      branchId,
      uploadedDocuments: [],
    });

    if (applicationStatus === 'Submitted') {
      await logAuditEvent({
        applicationId: application._id,
        action: 'APPLICATION_SUBMITTED',
        req,
        previousStatus: 'DRAFT',
        newStatus: 'Submitted',
        remarks: 'Application submitted by citizen',
      });
    }

    const populatedApp = await LoanApplication.findById(application._id)
      .populate('loanProductId', 'name productCode interestRate requiredDocuments')
      .populate('branchId', 'branchName branchCode city address');

    return sendSuccess(res, populatedApp, applicationStatus === 'Submitted' ? 'Application submitted successfully' : 'Draft application saved', 201);
  } catch (error) {
    console.error('Create application error:', error);
    return sendError(res, error.message || 'Failed to create loan application', 500);
  }
};

// @desc    Update draft application
// @route   PUT /api/loans/:id
// @access  Private (USER)
export const updateLoanApplication = async (req, res) => {
  try {
    const application = await LoanApplication.findById(req.params.id);

    if (!application) {
      return sendError(res, 'Loan application not found', 404);
    }

    if (application.citizenId.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return sendError(res, 'Not authorized to modify this application', 403);
    }

    const { amount, tenureMonths, purpose, applicantDetails, status } = req.body;

    if (amount) {
      application.amount = amount;
      if (!application.approvedAmount) application.approvedAmount = amount;
    }
    if (tenureMonths) {
      application.tenureMonths = tenureMonths;
      if (!application.approvedTenureMonths) application.approvedTenureMonths = tenureMonths;
    }
    if (purpose) application.purpose = purpose;
    if (applicantDetails) {
      application.applicantDetails = { ...application.applicantDetails, ...applicantDetails };
      const matchedBranch = await findMatchingBranch(applicantDetails.pincode, applicantDetails.city);
      if (matchedBranch) application.branchId = matchedBranch._id;
    }
    if (status) application.status = status;

    await application.save();
    const updated = await LoanApplication.findById(application._id)
      .populate('loanProductId', 'name productCode interestRate requiredDocuments')
      .populate('branchId', 'branchName branchCode city address');

    return sendSuccess(res, updated, 'Loan application updated successfully');
  } catch (error) {
    console.error('Update application error:', error);
    return sendError(res, 'Failed to update loan application', 500);
  }
};

// @desc    Upload document for loan application
// @route   POST /api/loans/:id/upload
// @access  Private (USER)
export const uploadApplicationDocument = async (req, res) => {
  try {
    const application = await LoanApplication.findById(req.params.id);

    if (!application) {
      return sendError(res, 'Loan application not found', 404);
    }

    if (application.citizenId.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return sendError(res, 'Not authorized to upload files to this application', 403);
    }

    if (!req.file) {
      return sendError(res, 'No file uploaded', 400);
    }

    const { documentType } = req.body;
    if (!documentType) {
      return sendError(res, 'documentType is required (e.g. PAN, AADHAAR, SALARY_SLIP)', 400);
    }

    const fileUrl = `/uploads/documents/${req.file.filename}`;

    const existingIndex = application.uploadedDocuments.findIndex(
      (doc) => doc.documentType === documentType
    );

    const docObj = {
      documentType,
      fileUrl,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      sizeBytes: req.file.size,
      uploadedAt: new Date(),
      status: 'PENDING',
    };

    if (existingIndex >= 0) {
      application.uploadedDocuments[existingIndex] = docObj;
    } else {
      application.uploadedDocuments.push(docObj);
    }

    // If application was in DOCS_REQUESTED state and candidate re-uploaded, transition back to Submitted
    if (application.status === 'DOCS_REQUESTED') {
      const prevStatus = application.status;
      application.status = 'Submitted';
      await logAuditEvent({
        applicationId: application._id,
        action: 'DOCUMENT_REUPLOADED',
        req,
        previousStatus: prevStatus,
        newStatus: 'Submitted',
        remarks: `Re-uploaded ${documentType} file. Returned to branch review queue.`,
      });
    }

    await application.save();

    return sendSuccess(res, application.uploadedDocuments, 'Document uploaded successfully');
  } catch (error) {
    console.error('Upload document error:', error);
    return sendError(res, error.message || 'Failed to upload document', 500);
  }
};

// @desc    Submit draft application for review
// @route   POST /api/loans/:id/submit
// @access  Private (USER)
export const submitLoanApplication = async (req, res) => {
  try {
    const application = await LoanApplication.findById(req.params.id);

    if (!application) {
      return sendError(res, 'Loan application not found', 404);
    }

    if (application.citizenId.toString() !== req.user._id.toString()) {
      return sendError(res, 'Not authorized to submit this application', 403);
    }

    const prevStatus = application.status;
    if (!application.branchId && application.applicantDetails) {
      const matchedBranch = await findMatchingBranch(application.applicantDetails.pincode, application.applicantDetails.city);
      if (matchedBranch) application.branchId = matchedBranch._id;
    }

    application.status = 'Submitted';
    await application.save();

    await logAuditEvent({
      applicationId: application._id,
      action: 'APPLICATION_SUBMITTED',
      req,
      previousStatus: prevStatus,
      newStatus: 'Submitted',
      remarks: 'Application submitted for branch manager verification',
    });

    await dispatchNotification({
      recipientId: application.citizenId,
      recipientRole: 'Citizen',
      title: 'Loan Application Submitted',
      message: `Your loan application ${application.applicationId} for ₹${Number(application.amount).toLocaleString('en-IN')} has been submitted and auto-routed for verification.`,
      type: 'SUCCESS',
      category: 'APPLICATION',
      link: `/applications/${application._id}`,
    });

    const updated = await LoanApplication.findById(application._id)
      .populate('loanProductId', 'name productCode interestRate requiredDocuments')
      .populate('branchId', 'branchName branchCode city address');

    return sendSuccess(res, updated, 'Loan application submitted successfully! It is now routed to the branch manager queue.');
  } catch (error) {
    console.error('Submit application error:', error);
    return sendError(res, 'Failed to submit loan application', 500);
  }
};

// @desc    Get user's loan applications
// @route   GET /api/loans/my
// @access  Private (USER)
export const getMyLoanApplications = async (req, res) => {
  try {
    const applications = await LoanApplication.find({ citizenId: req.user._id })
      .populate('loanProductId', 'name productCode interestRate requiredDocuments')
      .populate('branchId', 'branchName branchCode city address')
      .sort({ createdAt: -1 });

    return sendSuccess(res, applications, 'My applications fetched successfully');
  } catch (error) {
    console.error('Get my applications error:', error);
    return sendError(res, 'Failed to fetch loan applications', 500);
  }
};

// @desc    Get Branch Manager Review Queue applications
// @route   GET /api/loans/branch-queue
// @access  Private (BRANCH_MANAGER, ADMIN)
export const getBranchReviewQueue = async (req, res) => {
  try {
    let query = { status: { $ne: 'DRAFT' } };
    const userRole = (req.user.role || '').toUpperCase();

    if (userRole === 'BRANCH MANAGER' || userRole === 'BRANCH_MANAGER') {
      let branch = await Branch.findOne({
        $or: [
          { managerId: req.user._id },
          { _id: req.user.branchId },
        ],
      });

      if (!branch && req.user.email) {
        if (req.user.email.includes('lucknow')) {
          branch = await Branch.findOne({ city: /Lucknow/i });
        } else if (req.user.email.includes('delhi')) {
          branch = await Branch.findOne({ city: /Delhi/i });
        } else if (req.user.email.includes('mumbai')) {
          branch = await Branch.findOne({ city: /Mumbai/i });
        }
      }

      if (branch) {
        query.$or = [
          { branchId: branch._id },
          { 'applicantDetails.pincode': { $in: branch.pincodeRanges || [] } },
          { 'applicantDetails.city': new RegExp(`^${branch.city}$`, 'i') },
        ];
      }
    } else if (req.query.branchId) {
      query.branchId = req.query.branchId;
    }

    const applications = await LoanApplication.find(query)
      .populate('loanProductId', 'name productCode interestRate requiredDocuments')
      .populate('citizenId', 'name email phone')
      .populate('branchId', 'branchName branchCode city address')
      .sort({ createdAt: -1 });

    return sendSuccess(res, applications, 'Branch review queue fetched successfully');
  } catch (error) {
    console.error('Get branch queue error:', error);
    return sendError(res, 'Failed to fetch branch review queue', 500);
  }
};

// @desc    Get single application details
// @route   GET /api/loans/:id
// @access  Private
export const getLoanApplicationById = async (req, res) => {
  try {
    const application = await LoanApplication.findById(req.params.id)
      .populate('loanProductId', 'name productCode interestRate requiredDocuments')
      .populate('citizenId', 'name email phone')
      .populate('branchId', 'branchName branchCode city address');

    if (!application) {
      return sendError(res, 'Loan application not found', 404);
    }

    return sendSuccess(res, application, 'Application details fetched successfully');
  } catch (error) {
    console.error('Get application by ID error:', error);
    return sendError(res, 'Failed to fetch application details', 500);
  }
};

// @desc    Admin Manual Branch Reassignment (Phase 6 Feature)
// @route   POST /api/loans/:id/reassign-branch
// @access  Private (ADMIN)
export const reassignApplicationBranch = async (req, res) => {
  try {
    const { branchId, remarks } = req.body;
    if (!branchId) {
      return sendError(res, 'Target branchId is required for reassignment', 400);
    }

    const application = await LoanApplication.findById(req.params.id);
    if (!application) {
      return sendError(res, 'Loan application not found', 404);
    }

    const targetBranch = await Branch.findById(branchId);
    if (!targetBranch) {
      return sendError(res, 'Target branch not found', 404);
    }

    const prevBranchId = application.branchId;
    application.branchId = targetBranch._id;
    await application.save();

    await logAuditEvent({
      applicationId: application._id,
      action: 'BRANCH_REASSIGNED',
      req,
      previousStatus: application.status,
      newStatus: application.status,
      remarks: remarks || `Manually reassigned to ${targetBranch.branchName} by Admin`,
      details: { previousBranchId: prevBranchId, newBranchId: targetBranch._id },
    });

    const updated = await LoanApplication.findById(application._id)
      .populate('loanProductId', 'name productCode interestRate requiredDocuments')
      .populate('citizenId', 'name email phone')
      .populate('branchId', 'branchName branchCode city address');

    return sendSuccess(res, updated, `Application reassigned to ${targetBranch.branchName}`);
  } catch (error) {
    console.error('Reassign branch error:', error);
    return sendError(res, 'Failed to reassign application branch', 500);
  }
};

// @desc    Verify individual document in loan application
// @route   POST /api/loans/:id/verify-doc
// @access  Private (BRANCH_MANAGER, ADMIN)
export const verifyApplicationDocument = async (req, res) => {
  try {
    const { documentType, status, remarks } = req.body;
    if (!documentType || !status) {
      return sendError(res, 'documentType and status (VERIFIED/REJECTED) are required', 400);
    }

    const application = await LoanApplication.findById(req.params.id);
    if (!application) {
      return sendError(res, 'Loan application not found', 404);
    }

    const docIndex = application.uploadedDocuments.findIndex((d) => d.documentType === documentType);
    if (docIndex < 0) {
      return sendError(res, 'Document not found in application', 404);
    }

    const prevStatus = application.status;
    application.uploadedDocuments[docIndex].status = status;
    if (remarks) application.uploadedDocuments[docIndex].remarks = remarks;

    const allVerified = application.uploadedDocuments.every((d) => d.status === 'VERIFIED');
    if (allVerified && application.status === 'Submitted') {
      application.status = 'Verified';
    }

    await application.save();

    await logAuditEvent({
      applicationId: application._id,
      action: 'DOCUMENT_VERIFIED',
      req,
      previousStatus: prevStatus,
      newStatus: application.status,
      remarks: `Document ${documentType} marked as ${status}`,
    });

    const updated = await LoanApplication.findById(application._id)
      .populate('loanProductId', 'name productCode interestRate requiredDocuments')
      .populate('citizenId', 'name email phone')
      .populate('branchId', 'branchName branchCode city address');

    return sendSuccess(res, updated, `Document ${documentType} marked as ${status}`);
  } catch (error) {
    console.error('Verify document error:', error);
    return sendError(res, 'Failed to verify document', 500);
  }
};

// @desc    Branch Manager Request Document Re-upload Loop (Phase 7 Feature)
// @route   POST /api/loans/:id/request-reupload
// @access  Private (BRANCH_MANAGER, ADMIN)
export const requestDocumentReupload = async (req, res) => {
  try {
    const { documentType, remarks } = req.body;
    if (!documentType || !remarks) {
      return sendError(res, 'documentType and manager remarks are required', 400);
    }

    const application = await LoanApplication.findById(req.params.id);
    if (!application) {
      return sendError(res, 'Loan application not found', 404);
    }

    const docIndex = application.uploadedDocuments.findIndex((d) => d.documentType === documentType);
    if (docIndex >= 0) {
      application.uploadedDocuments[docIndex].status = 'REJECTED';
      application.uploadedDocuments[docIndex].remarks = remarks;
    }

    const prevStatus = application.status;
    application.status = 'DOCS_REQUESTED';
    application.remarks = remarks;
    await application.save();

    await logAuditEvent({
      applicationId: application._id,
      action: 'DOCS_REQUESTED',
      req,
      previousStatus: prevStatus,
      newStatus: 'DOCS_REQUESTED',
      remarks: `Re-upload requested for ${documentType}: ${remarks}`,
    });

    await dispatchNotification({
      recipientId: application.citizenId,
      recipientRole: 'Citizen',
      title: 'Action Required: Document Re-upload Requested',
      message: `Branch Manager requested re-upload for ${documentType.replace(/_/g, ' ')}: ${remarks}`,
      type: 'WARNING',
      category: 'DOCUMENT',
      link: `/applications/${application._id}`,
    });

    const updated = await LoanApplication.findById(application._id)
      .populate('loanProductId', 'name productCode interestRate requiredDocuments')
      .populate('citizenId', 'name email phone')
      .populate('branchId', 'branchName branchCode city address');

    return sendSuccess(res, updated, `Re-upload request sent to citizen for ${documentType}`);
  } catch (error) {
    console.error('Request reupload error:', error);
    return sendError(res, 'Failed to request document re-upload', 500);
  }
};

// @desc    Manager Approval or Rejection decision with custom approved amount & tenure
// @route   POST /api/loans/:id/decide
// @access  Private (BRANCH_MANAGER, ADMIN)
export const decideLoanApplication = async (req, res) => {
  try {
    const { decision, remarks, approvedAmount, approvedTenureMonths } = req.body;
    if (!decision || !['Approved', 'Rejected', 'Verified'].includes(decision)) {
      return sendError(res, 'Invalid decision value (Approved, Rejected, Verified required)', 400);
    }

    const application = await LoanApplication.findById(req.params.id);
    if (!application) {
      return sendError(res, 'Loan application not found', 404);
    }

    const prevStatus = application.status;
    application.status = decision;
    if (remarks) application.remarks = remarks;

    if (approvedAmount && Number(approvedAmount) > 0) {
      application.approvedAmount = Number(approvedAmount);
    } else if (!application.approvedAmount) {
      application.approvedAmount = application.amount;
    }

    if (approvedTenureMonths && Number(approvedTenureMonths) > 0) {
      application.approvedTenureMonths = Number(approvedTenureMonths);
    } else if (!application.approvedTenureMonths) {
      application.approvedTenureMonths = application.tenureMonths;
    }

    if (decision === 'Approved') {
      if (!application.sanctionRefNumber) {
        application.sanctionRefNumber = `SNC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
        application.sanctionedAt = new Date();
      }
    }

    await application.save();

    await logAuditEvent({
      applicationId: application._id,
      action: decision === 'Approved' ? 'LOAN_APPROVED' : decision === 'Rejected' ? 'LOAN_REJECTED' : 'LOAN_VERIFIED',
      req,
      previousStatus: prevStatus,
      newStatus: decision,
      remarks: remarks || `Loan application marked as ${decision}`,
      details: { approvedAmount: application.approvedAmount, approvedTenureMonths: application.approvedTenureMonths, sanctionRefNumber: application.sanctionRefNumber },
    });

    if (decision === 'Approved') {
      await dispatchNotification({
        recipientId: application.citizenId,
        recipientRole: 'Citizen',
        title: 'Congratulations! Loan Application Approved',
        message: `Your loan application ${application.applicationId} has been sanctioned for ₹${Number(application.approvedAmount || application.amount).toLocaleString('en-IN')}. Download your official Sanction Letter now.`,
        type: 'SUCCESS',
        category: 'SANCTION',
        link: `/applications/${application._id}`,
      });
    } else if (decision === 'Rejected') {
      await dispatchNotification({
        recipientId: application.citizenId,
        recipientRole: 'Citizen',
        title: 'Update on Loan Application',
        message: `Your loan application ${application.applicationId} has been rejected. Remarks: ${remarks || 'Does not meet underwriting criteria.'}`,
        type: 'DANGER',
        category: 'APPLICATION',
        link: `/applications/${application._id}`,
      });
    }

    const updated = await LoanApplication.findById(application._id)
      .populate('loanProductId', 'name productCode interestRate requiredDocuments')
      .populate('citizenId', 'name email phone')
      .populate('branchId', 'branchName branchCode city address');

    return sendSuccess(res, updated, `Loan application status updated to ${decision}`);
  } catch (error) {
    console.error('Decide application error:', error);
    return sendError(res, 'Failed to update loan application decision', 500);
  }
};

// @desc    Get Audit Trail for Loan Application (Phase 7 Feature)
// @route   GET /api/loans/:id/audit-trail
// @access  Private
export const getApplicationAuditTrail = async (req, res) => {
  try {
    const logs = await AuditLog.find({ applicationId: req.params.id }).sort({ createdAt: -1 });
    return sendSuccess(res, logs, 'Audit trail fetched successfully');
  } catch (error) {
    console.error('Get audit trail error:', error);
    return sendError(res, 'Failed to fetch application audit trail', 500);
  }
};

// @desc    Applicant Accept Sanction Letter & Provide Bank Disbursal Account (Phase 8 Feature)
// @route   POST /api/loans/:id/accept-sanction
// @access  Private (USER)
export const acceptSanctionLetter = async (req, res) => {
  try {
    const { bankName, accountNumber, ifscCode, accountHolderName } = req.body;
    if (!bankName || !accountNumber || !ifscCode || !accountHolderName) {
      return sendError(res, 'Bank Name, Account Number, IFSC Code, and Account Holder Name are required for disbursal', 400);
    }

    const application = await LoanApplication.findById(req.params.id);
    if (!application) {
      return sendError(res, 'Loan application not found', 404);
    }

    if (application.citizenId.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return sendError(res, 'Not authorized to accept sanction terms for this application', 403);
    }

    const prevStatus = application.status;
    application.status = 'SANCTIONED';
    application.sanctionAcceptedByApplicant = true;
    application.sanctionAcceptedAt = new Date();
    application.disbursementAccountDetails = {
      bankName,
      accountNumber,
      ifscCode,
      accountHolderName,
    };

    if (!application.sanctionRefNumber) {
      application.sanctionRefNumber = `SNC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      application.sanctionedAt = new Date();
    }

    await application.save();

    await logAuditEvent({
      applicationId: application._id,
      action: 'SANCTION_ACCEPTED',
      req,
      previousStatus: prevStatus,
      newStatus: 'SANCTIONED',
      remarks: `Applicant accepted sanction terms (${application.sanctionRefNumber}) & entered bank disbursal details (${bankName} - ${accountNumber.slice(-4)})`,
    });

    const updated = await LoanApplication.findById(application._id)
      .populate('loanProductId', 'name productCode interestRate requiredDocuments')
      .populate('citizenId', 'name email phone')
      .populate('branchId', 'branchName branchCode city address');

    return sendSuccess(res, updated, 'Sanction letter terms accepted successfully! Application is ready for disbursal.');
  } catch (error) {
    console.error('Accept sanction error:', error);
    return sendError(res, 'Failed to accept sanction letter', 500);
  }
};

// @desc    Branch Manager / Admin Execute Loan Disbursal (Phase 8 Feature)
// @route   POST /api/loans/:id/disburse
// @access  Private (BRANCH_MANAGER, ADMIN)
export const disburseLoanApplication = async (req, res) => {
  try {
    const { disbursementRefNumber, remarks } = req.body;
    
    const application = await LoanApplication.findById(req.params.id);
    if (!application) {
      return sendError(res, 'Loan application not found', 404);
    }

    if (!['Approved', 'SANCTIONED', 'Verified'].includes(application.status)) {
      return sendError(res, `Cannot disburse application in current status (${application.status})`, 400);
    }

    const refNo = disbursementRefNumber || `NEFT-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
    const prevStatus = application.status;

    application.status = 'Disbursed';
    application.disbursedAt = new Date();
    application.disbursementRefNumber = refNo;
    if (remarks) application.remarks = remarks;

    await application.save();

    // Phase 9: Auto-generate EMI schedule
    await generateEmiScheduleForLoan(application._id);

    await logAuditEvent({
      applicationId: application._id,
      action: 'LOAN_DISBURSED',
      req,
      previousStatus: prevStatus,
      newStatus: 'Disbursed',
      remarks: remarks || `Loan funds disbursed under reference ${refNo}`,
      details: {
        disbursementRefNumber: refNo,
        approvedAmount: application.approvedAmount || application.amount,
        disbursedAt: application.disbursedAt,
      },
    });

    await dispatchNotification({
      recipientId: application.citizenId,
      recipientRole: 'Citizen',
      title: 'Loan Funds Disbursed Successfully!',
      message: `Your approved loan funds of ₹${Number(application.approvedAmount || application.amount).toLocaleString('en-IN')} have been transferred under NEFT Ref: ${refNo}.`,
      type: 'SUCCESS',
      category: 'DISBURSAL',
      link: `/applications/${application._id}`,
    });

    const updated = await LoanApplication.findById(application._id)
      .populate('loanProductId', 'name productCode interestRate requiredDocuments')
      .populate('citizenId', 'name email phone')
      .populate('branchId', 'branchName branchCode city address');

    return sendSuccess(res, updated, `Loan disbursed successfully under Ref ${refNo}!`);
  } catch (error) {
    console.error('Disburse loan error:', error);
    return sendError(res, 'Failed to execute loan disbursal', 500);
  }
};
