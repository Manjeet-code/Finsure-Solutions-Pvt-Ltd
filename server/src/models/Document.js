import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    loanApplicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LoanApplication',
    },
    type: {
      type: String, // e.g., 'Aadhaar', 'PAN', 'Salary Slip', 'Bank Statement'
      required: true,
    },
    url: {
      type: String, // Cloudinary URL
      required: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationRemarks: {
      type: String, // e.g., from OCR
    },
  },
  {
    timestamps: true,
  }
);

const Document = mongoose.model('Document', documentSchema);

export default Document;
