import mongoose from 'mongoose';

const savedPostSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    postId: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    subreddit: {
        type: String,
        required: true
    },
    score: {
        type: Number,
        required: true
    },
    url: {
        type: String,
        required: true
    },
    created_utc: {
        type: Number,
        required: true
    },
    permalink: {
        type: String,
        required: true
    },
    thumbnail: String,
    num_comments: {
        type: Number,
        required: true
    },
    savedAt: {
        type: Date,
        default: Date.now
    }
});

export const SavedPost = mongoose.model('SavedPost', savedPostSchema); 