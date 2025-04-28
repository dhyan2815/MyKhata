import mongoose from 'mongoose';

const categorySchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    name: {
      type: String,
      required: [true, 'Please add a category name'],
      trim: true,
    },
    type: {
      type: String,
      required: [true, 'Please specify category type'],
      enum: ['income', 'expense'],
    },
    color: {
      type: String,
      default: '#3B82F6',
    },
    icon: {
      type: String,
      default: 'tag',
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for unique categories per user
categorySchema.index({ user: 1, name: 1, type: 1 }, { unique: true });

const Category = mongoose.model('Category', categorySchema);

export default Category;