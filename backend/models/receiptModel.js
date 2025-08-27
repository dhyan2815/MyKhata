import mongoose from 'mongoose';

const receiptSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    receiptImage: {
      type: String, // URL to stored image
      required: true,
      trim: true,
    },
    rawText: {
      type: String,
      required: true,
    },
    extractedData: {
      merchant: {
        type: String,
        trim: true,
      },
      amount: {
        type: Number,
      },
      total: {
        type: Number,
      },
      subtotal: {
        type: Number,
      },
      date: {
        type: Date,
      },
      description: {
        type: String,
        trim: true,
      },
      type: {
        type: String,
        enum: ['income', 'expense'],
        default: 'expense',
      },
    },
    status: {
      type: String,
      enum: ['scanned', 'processed', 'failed'],
      default: 'scanned',
    },
    transactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transaction',
      default: null,
    },
    processingNotes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Add index for better query performance
receiptSchema.index({ user: 1, createdAt: -1 });
receiptSchema.index({ user: 1, status: 1 });

const Receipt = mongoose.model('Receipt', receiptSchema);

export default Receipt;
