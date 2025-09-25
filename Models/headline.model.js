import mongoose from 'mongoose';

const headlineSchema = mongoose.Schema(
  {


    newsId: { 
      type: mongoose.Schema.Types.ObjectId,
      ref: 'News', 
      required: [true, 'News ID is required for a headline'],
      unique: true 
    },
    headlineText: {
      type: String,
      required: [true, 'Please add a headline text'],
      trim: true,
      minlength: [5, 'Headline must be at least 5 characters long'],
      maxlength: [2000000, 'Headline cannot be more than 2000000 characters long'],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Headline creator is required'],
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    category: {
      type: String,
      ref: 'Category',
      required: [true, 'Headline category is required'],
    },
    subCategory: {
      type: String,
      ref: 'SubCategory',
      default: null,
    },
    country: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Country',
      default: null,
    },
    state: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'State',
      default: null,
    },
    district: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'City',
      default: null,
    },
    status: {
      type: String,
      enum: ['draft', 'pending_approval', 'posted', 'live', 'rejected'],
      default: 'draft',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Headline', headlineSchema);