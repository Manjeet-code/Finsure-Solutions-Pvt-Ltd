import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LoanApplication',
      required: true,
    },
    action: {
      type: String,
      required: true, // e.g. 'BRANCH_REASSIGNED', 'DOCUMENT_VERIFIED', 'DOCS_REQUESTED', 'LOAN_APPROVED', 'LOAN_REJECTED'
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    performedByName: {
      type: String,
    },
    performedByRole: {
      type: String,
    },
    previousStatus: {
      type: String,
    },
    newStatus: {
      type: String,
    },
    remarks: {
      type: String,
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

const AuditLog = mongoose.models.AuditLog || mongoose.model('AuditLog', auditLogSchema);

export default AuditLog;
