import mongoose from 'mongoose';

const emiScheduleSchema = new mongoose.Schema(
  {
    loanApplicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LoanApplication',
      required: true,
    },
    citizenId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
    },
    installmentNumber: {
      type: Number,
      required: true,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    principalComponent: {
      type: Number,
      default: 0,
    },
    interestComponent: {
      type: Number,
      default: 0,
    },
    remainingBalance: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['PENDING', 'PAID', 'OVERDUE'],
      default: 'PENDING',
    },
    paidAt: {
      type: Date,
    },
    paymentTransactionRef: {
      type: String,
    },
    paymentMethod: {
      type: String,
      default: 'Auto-Debit',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for quick queries
emiScheduleSchema.index({ loanApplicationId: 1, installmentNumber: 1 });
emiScheduleSchema.index({ citizenId: 1, status: 1 });
emiScheduleSchema.index({ branchId: 1, status: 1 });

const EMISchedule = mongoose.models.EMISchedule || mongoose.model('EMISchedule', emiScheduleSchema);

export default EMISchedule;
