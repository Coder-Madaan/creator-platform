import express from 'express';
import { redditService } from '../services/redditService.js';

const router = express.Router();

router.get('/posts/:subreddit', async (req, res) => {
    try {
        const { subreddit } = req.params;
        const { limit } = req.query;
        const posts = await redditService.getPosts(subreddit, limit);
        res.json(posts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router; 