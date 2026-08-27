import mongoose from 'mongoose';

const loanProductSchema = new mongoose.Schema(
  {
    productCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    interestRate: {
      type: Number,
      required: true,
    },
    minAmount: {
      type: Number,
      required: true,
    },
    maxAmount: {
      type: Number,
      required: true,
    },
    tenureOptionsMonths: [
      {
        type: Number,
        required: true,
      },
    ],
    eligibilityCriteria: {
      type: String,
      default: '',
    },
    requiredDocuments: [
      {
        type: String, // e.g., 'PAN', 'AADHAAR', 'SALARY_SLIP', 'BANK_STATEMENT', 'ITR', 'ADDRESS_PROOF'
        trim: true,
      },
    ],
    description: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const LoanProduct = mongoose.model('LoanProduct', loanProductSchema);

export default LoanProduct;
