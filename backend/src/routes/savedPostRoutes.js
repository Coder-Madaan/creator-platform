import express from 'express';
import { SavedPost } from '../models/SavedPost.js';
import { auth } from '../middleware/auth.js';
import User from '../models/user.model.js';

const router = express.Router();

// Save a post
router.post('/', auth, async (req, res) => {
    try {
        const { postId, title, author, subreddit, score, url, created_utc, permalink, thumbnail, num_comments } = req.body;
        
        // Check if post is already saved
        const existingPost = await SavedPost.findOne({ userId: req.user._id, postId });
        if (existingPost) {
            return res.status(400).json({ message: 'Post already saved' });
        }

        const savedPost = new SavedPost({
            userId: req.user._id,
            postId,
            title,
            author,
            subreddit,
            score,
            url,
            created_utc,
            permalink,
            thumbnail,
            num_comments
        });

        await savedPost.save();

        // Increment user credits
        await User.findByIdAndUpdate(
            req.user._id,
            { $inc: { credits: 1 } },
            { new: true }
        );

        res.status(201).json(savedPost);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get saved posts
router.get('/', auth, async (req, res) => {
    try {
        const savedPosts = await SavedPost.find({ userId: req.user._id })
            .sort({ savedAt: -1 });
        res.json(savedPosts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete a saved post
router.delete('/:postId', auth, async (req, res) => {
    try {
        const post = await SavedPost.findOneAndDelete({
            userId: req.user._id,
            postId: req.params.postId
        });
        
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        
        res.json({ message: 'Post removed from saved' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router; 