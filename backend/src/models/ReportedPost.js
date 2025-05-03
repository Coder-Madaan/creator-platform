import mongoose from 'mongoose';

const reportedPostSchema = new mongoose.Schema({
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
    reason: {
        type: String,
        required: true
    },
    reportedAt: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['pending', 'reviewed', 'dismissed'],
        default: 'pending'
    }
});

export const ReportedPost = mongoose.model('ReportedPost', reportedPostSchema);