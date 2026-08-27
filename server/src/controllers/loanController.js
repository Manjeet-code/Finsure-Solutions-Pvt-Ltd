import LoanApplication from '../models/LoanApplication.js';
import Document from '../models/Document.js';

// @desc    Submit a new loan application
// @route   POST /api/loans
// @access  Private (Citizen)
export const submitLoanApplication = async (req, res) => {
  const { loanProductId, amount, tenureMonths, purpose, branchId } = req.body;

  try {
    const loan = await LoanApplication.create({
      citizenId: req.user._id,
      loanProductId,
      amount,
      tenureMonths,
      purpose,
      branchId,
      status: 'Pending',
    });

    res.status(201).json(loan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Upload document for a loan application
// @route   POST /api/loans/:id/documents
// @access  Private (Citizen)
export const uploadDocument = async (req, res) => {
  const { type } = req.body; // e.g., 'Aadhaar', 'PAN', 'Salary Slip', 'Bank Statement'
  
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const fileUrl = req.file.path && req.file.path.startsWith('http')
      ? req.file.path
      : `http://localhost:5000/uploads/${req.file.filename}`;

    const document = await Document.create({
      userId: req.user._id,
      loanApplicationId: req.params.id,
      type: type || 'Document',
      url: fileUrl,
    });

    res.status(201).json(document);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get documents for a specific loan application
// @route   GET /api/loans/:id/documents
// @access  Private
export const getLoanDocuments = async (req, res) => {
  try {
    const documents = await Document.find({ loanApplicationId: req.params.id });
    res.json(documents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify or reject a document
// @route   PUT /api/loans/documents/:docId/status
// @access  Private/Manager
export const verifyDocument = async (req, res) => {
  const { isVerified, verificationRemarks } = req.body;

  try {
    const document = await Document.findById(req.params.docId);

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    document.isVerified = isVerified;
    if (verificationRemarks !== undefined) {
      document.verificationRemarks = verificationRemarks;
    }

    const updatedDoc = await document.save();
    res.json(updatedDoc);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user's loan applications
// @route   GET /api/loans/myloans
// @access  Private (Citizen)
export const getMyLoans = async (req, res) => {
  try {
    const loans = await LoanApplication.find({ citizenId: req.user._id })
      .populate('loanProductId')
      .populate('branchId', 'branchName address');
    res.json(loans);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all loans (for branch manager/admin)
// @route   GET /api/loans
// @access  Private/Manager
export const getAllLoans = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'Branch Manager' && req.user.branchId) {
      query = { branchId: req.user.branchId };
    }

    const loans = await LoanApplication.find(query)
      .populate('citizenId', 'name email phone')
      .populate('loanProductId', 'name interestRate maxTenureMonths')
      .populate('branchId', 'branchName address');
    res.json(loans);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update loan status
// @route   PUT /api/loans/:id/status
// @access  Private/Manager
export const updateLoanStatus = async (req, res) => {
  const { status, remarks } = req.body;

  try {
    const loan = await LoanApplication.findById(req.params.id);

    if (!loan) {
      return res.status(404).json({ message: 'Loan application not found' });
    }

    if (req.user.role === 'Branch Manager' && req.user.branchId && loan.branchId && loan.branchId.toString() !== req.user.branchId.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this loan' });
    }

    loan.status = status;
    if (remarks) {
      loan.remarks = remarks;
    }

    const updatedLoan = await loan.save();
    res.json(updatedLoan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
