// Models/shorts.model.js
import mongoose from 'mongoose';

const ShortsSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Shorts title is required'],
        trim: true,
        maxlength: [100, 'Title cannot be more than 100 characters']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description cannot be more than 500 characters']
    },
    videoUrl: {
        type: String,
        required: [true, 'Video URL is required']
    },
    thumbnailUrl: {
        type: String,
    },
    status: {
        type: String,
        enum: ['draft', 'pending_approval', 'published', 'rejected'],
        default: 'pending_approval'
    },
    createdBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    category: { // Added for categorization
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        default: null
    },
    subCategory: { // Added for categorization
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SubCategory',
        default: null
    },
    country: { // Added for location tagging
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Country',
        default: null
    },
    state: { // Added for location tagging
        type: mongoose.Schema.Types.ObjectId,
        ref: 'State',
        default: null
    },
    city: { // Added for location tagging
        type: mongoose.Schema.Types.ObjectId,
        ref: 'City',
        default: null
    },
    likes: [{
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        },
        likedAt: {
            type: Date,
            default: Date.now
        }
    }],
    comments: [{
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: true
        },
        text: {
            type: String,
            required: true
        },
        commentedAt: {
            type: Date,
            default: Date.now
        },
        replies: [{
            user: {
                type: mongoose.Schema.ObjectId,
                ref: 'User',
                required: true
            },
            text: {
                type: String,
                required: true
            },
            repliedAt: {
                type: Date,
                default: Date.now
            }
        }]
    }],
    viewsCount: {
        type: Number,
        default: 0
    },
    publishedAt: {
        type: Date
    }
}, {
    timestamps: true // Adds createdAt and updatedAt
});

// Virtuals for easy access to counts
ShortsSchema.virtual('likesCount').get(function() {
    return this.likes.length;
});

ShortsSchema.virtual('commentsCount').get(function() {
    return this.comments.length;
});

export default mongoose.model('Shorts', ShortsSchema);