import mongoose from 'mongoose';

const savedNewsSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    news: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'News',
            required: true,
        }
    ],
}, {
    timestamps: true,
});

// Optional: prevent duplicate news IDs in the array for the same user
savedNewsSchema.index({ user: 1, news: 1 }, { unique: true, sparse: true });

const SavedNews = mongoose.model('SavedNews', savedNewsSchema);
export default SavedNews;
