import mongoose from 'mongoose';

const videoSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a video title'],
      trim: true,
      minlength: [5, 'Title must be at least 5 characters long'],
      maxlength: [2000000, 'Title cannot be more than 2000000 characters long'],
    },
     slug: { 
        type: String,
        index: true,
        sparse: true // unique: true मत लगाना, क्योंकि हम id के साथ unique बनाएँगे
    },
    videoUrl: {
      type: String,
      required: [true, 'Video URL is required'],
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Video creator is required'],
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    category: {
      type: String,
      ref: 'Category',
      required: [true, 'Video category is required'],
    },
    subCategory: {
      type: String,
      ref: 'SubCategory',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Video', videoSchema);
