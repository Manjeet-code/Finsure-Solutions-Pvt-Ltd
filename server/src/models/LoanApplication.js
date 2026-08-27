import mongoose from 'mongoose';

const uploadedDocumentSchema = new mongoose.Schema({
  documentType: {
    type: String,
    required: true,
    enum: ['PAN', 'AADHAAR', 'SALARY_SLIP', 'BANK_STATEMENT', 'ITR', 'ADDRESS_PROOF', 'OTHER'],
  },
  fileUrl: {
    type: String,
    required: true,
  },
  originalName: {
    type: String,
  },
  mimeType: {
    type: String,
  },
  sizeBytes: {
    type: Number,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['PENDING', 'VERIFIED', 'REJECTED'],
    default: 'PENDING',
  },
  remarks: {
    type: String,
  },
});

const loanApplicationSchema = new mongoose.Schema(
  {
    applicationId: {
      type: String,
      unique: true,
    },
    citizenId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    loanProductId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LoanProduct',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 10000,
    },
    tenureMonths: {
      type: Number,
      required: true,
    },
    purpose: {
      type: String,
      required: true,
    },
    applicantDetails: {
      fullName: { type: String, required: true, default: 'Applicant' },
      phone: { type: String, required: true, default: '9876543210' },
      email: { type: String },
      dob: { type: Date },
      address: { type: String, required: true, default: 'Gomti Nagar, Lucknow' },
      city: { type: String, required: true, default: 'Lucknow' },
      state: { type: String, required: true, default: 'Uttar Pradesh' },
      pincode: { type: String, required: true, default: '226010' },
      monthlyIncome: { type: Number, required: true, default: 50000 },
      employmentType: { type: String, enum: ['Salaried', 'Self-Employed', 'Business'], required: true, default: 'Salaried' },
      panNumber: { type: String, uppercase: true },
      aadhaarNumber: { type: String },
    },
    uploadedDocuments: [uploadedDocumentSchema],
    status: {
      type: String,
      enum: ['DRAFT', 'Submitted', 'Pending', 'DOCS_REQUESTED', 'Verified', 'Approved', 'SANCTIONED', 'Disbursed', 'Rejected'],
      default: 'DRAFT',
    },
    approvedAmount: {
      type: Number,
    },
    approvedTenureMonths: {
      type: Number,
    },
    sanctionRefNumber: {
      type: String,
    },
    sanctionedAt: {
      type: Date,
    },
    sanctionAcceptedByApplicant: {
      type: Boolean,
      default: false,
    },
    sanctionAcceptedAt: {
      type: Date,
    },
    disbursedAt: {
      type: Date,
    },
    disbursementRefNumber: {
      type: String,
    },
    disbursementAccountDetails: {
      bankName: String,
      accountNumber: String,
      ifscCode: String,
      accountHolderName: String,
    },
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
    },
    creditScorePrediction: {
      type: Number,
      default: 720,
    },
    eligibilityPrediction: {
      type: String,
      default: 'Eligible',
    },
    remarks: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-generate applicationId before save if not present
loanApplicationSchema.pre('save', function () {
  if (!this.applicationId) {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    this.applicationId = `APP-${new Date().getFullYear()}-${randomSuffix}`;
  }
});

const LoanApplication = mongoose.models.LoanApplication || mongoose.model('LoanApplication', loanApplicationSchema);

export default LoanApplication;
