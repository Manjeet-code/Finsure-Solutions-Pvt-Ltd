import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    recipientRole: {
      type: String,
      enum: ['Citizen', 'Branch Manager', 'Admin', 'USER', 'BRANCH_MANAGER', 'ADMIN'],
      default: 'Citizen',
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['INFO', 'SUCCESS', 'WARNING', 'DANGER', 'SYSTEM'],
      default: 'INFO',
    },
    category: {
      type: String,
      enum: ['APPLICATION', 'DOCUMENT', 'SANCTION', 'DISBURSAL', 'EMI', 'SYSTEM'],
      default: 'APPLICATION',
    },
    link: {
      type: String,
    },
    read: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
    },
    emailSent: {
      type: Boolean,
      default: true,
    },
    smsSent: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast user queries
notificationSchema.index({ recipientId: 1, read: 1, createdAt: -1 });

const Notification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);

export default Notification;
