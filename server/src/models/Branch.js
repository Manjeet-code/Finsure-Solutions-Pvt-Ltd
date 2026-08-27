import mongoose from 'mongoose';

const branchSchema = new mongoose.Schema(
  {
    branchCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    branchName: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
    },
    pincodeRanges: [
      {
        type: String,
        trim: true,
      },
    ],
    managerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
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

// Index for pincode lookup performance
branchSchema.index({ pincodeRanges: 1 });

const Branch = mongoose.model('Branch', branchSchema);

export default Branch;
