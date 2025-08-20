// Models/News.js
import mongoose from 'mongoose';

// --- Nested Schemas for Media, Likes, Comments ---

const mediaSchema = mongoose.Schema({
    url: {
        type: String,
        required: true,
    },
    type: { // 'image' or 'video'
        type: String,
        enum: ['image', 'video'],
        required: true,
    },
    caption: String,
});

const likeSchema = mongoose.Schema(
    {
        user: { // User who liked (ObjectId to User model)
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    {
        timestamps: true, // createdAt for the like
    }
);

const commentSchema = mongoose.Schema(
    {
        user: { // User who made the comment (ObjectId to User model)
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        text: { // Comment content
            type: String,
            required: true,
            trim: true,
            maxlength: [500, 'Comment cannot be more than 500 characters'],
        },
    },
    {
        timestamps: true, // createdAt for the comment
    }
);

// --- Main News Schema ---

const newsSchema = mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Please add a news title'],
            trim: true,
            minlength: [5, 'Title must be at least 5 characters long'],
            maxlength: [200, 'Title cannot be more than 200 characters long'],
        },
        content: {
            type: String,
            required: [true, 'Please add news content'],
            minlength: [20, 'Content must be at least 20 characters long'],
            maxlength: [10000, 'Content cannot be more than 10000 characters long'],
        },
        summary: {
            type: String,
            maxlength: [500, 'Summary cannot be more than 500 characters long'],
            trim: true,
        },
      category: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Category',
},

subCategory: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'SubCategory',
},

// bhia  ya 8/7/25
subSubCategory: {
    type: String,
    trim: true,
    default: null,
},

        tags: {
            type: [String],
            default: [],
        },
        media: [mediaSchema], // Array of nested mediaSchema documents
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
        city: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'City',
            default: null,
        },
        localAddress: {
            type: String,
            trim: true,
            maxlength: [200, 'Local address cannot be more than 200 characters long'],
            default: null,
        },
        status: {
            type: String,
            enum: ['draft', 'pending_approval', 'posted', 'live', 'rejected'],
            default: 'pending_approval',
            required: true,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'News creator is required'],
        },
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
        publishedAt: {
            type: Date,
            default: null,
        },
        viewsCount: {
            type: Number,
            default: 0,
        },
        likes: [likeSchema], // Array of nested likeSchema documents
        comments: [commentSchema], // Array of nested commentSchema documents
           shareLink: {
            type: String,
            default: null, // यह न्यूज़ बनने के बाद जेनरेट होगा
        },
    },

   
    
    {
        timestamps: true, // createdAt and updatedAt for the news item itself
    }
);

// Pre-save hook to set publishedAt
newsSchema.pre('save', function(next) {
    // Only set publishedAt if status is changing TO 'posted' or 'live'
    // AND it hasn't been set before (or it's explicitly cleared and being reset)
    if (this.isModified('status')) {
        if ((this.status === 'posted' || this.status === 'live') && !this.publishedAt) {
            this.publishedAt = new Date();
        }
        // Optional: If you want to clear publishedAt when status changes from posted/live
        // else if (!(this.status === 'posted' || this.status === 'live') && this.publishedAt) {
        //     this.publishedAt = null;
        // }
    }
    next();
});

// Helper virtual for quick likes count (optional, can also use `likes.length` directly)
newsSchema.virtual('likesCount').get(function() {
    return this.likes ? this.likes.length : 0;
});

// Helper virtual for quick comments count (optional)
newsSchema.virtual('commentsCount').get(function() {
    return this.comments ? this.comments.length : 0;
});

export default mongoose.model('News', newsSchema);