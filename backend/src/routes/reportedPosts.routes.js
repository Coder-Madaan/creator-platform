import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { ReportedPost } from '../models/ReportedPost.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);

// Report a post
router.post('/', async (req, res) => {
  try {
    const { postId, reason, postData } = req.body;
    
    const reportedPost = new ReportedPost({
      userId: req.user._id,
      postId,
      reason,
      title: postData.title,
      author: postData.author,
      subreddit: postData.subreddit,
      score: postData.score,
      url: postData.url,
      created_utc: postData.created_utc,
      permalink: postData.permalink,
      thumbnail: postData.thumbnail,
      num_comments: postData.num_comments,
      status: 'pending'
    });

    await reportedPost.save();
    res.status(201).json(reportedPost);
  } catch (error) {
    res.status(500).json({ message: 'Error reporting post' });
  }
});

// Get all reported posts (admin only)
router.get('/', async (req, res) => {
  try {
    const reportedPosts = await ReportedPost.find()
      .populate('userId', 'username')
      .sort({ reportedAt: -1 });
    res.json(reportedPosts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reported posts' });
  }
});

// Update report status (admin only)
router.put('/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const reportedPost = await ReportedPost.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    res.json(reportedPost);
  } catch (error) {
    res.status(500).json({ message: 'Error updating report status' });
  }
});

export default router;