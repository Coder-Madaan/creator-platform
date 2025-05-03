import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import Content from '../models/content.model.js';
import User from '../models/user.model.js';
import { ReportedPost } from '../models/ReportedPost.js';
import axios from 'axios';

const router = express.Router();

// Get feed content
router.get('/', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const content = await Content.find({ status: 'active' })
      .sort({ 'metadata.publishedAt': -1 })
      .skip(skip)
      .limit(limit);

    res.json(content);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Save content
router.post('/save/:contentId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const content = await Content.findById(req.params.contentId);

    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }

    if (!user.savedContent.includes(content._id)) {
      user.savedContent.push(content._id);
      await user.save();
      
      // Award credits for saving content
      user.credits += 5;
      await user.save();
    }

    res.json({ message: 'Content saved successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Report content
router.post('/report/:contentId', protect, async (req, res) => {
  try {
    const { reason } = req.body;
    
    if (!reason) {
      return res.status(400).json({ message: 'Report reason is required' });
    }

    const content = await Content.findById(req.params.contentId);

    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }

    // Check if user has already reported this content
    const hasReported = content.reports.some(report => 
      report.userId && report.userId.toString() === req.user._id.toString()
    );

    if (hasReported) {
      return res.status(400).json({ message: 'You have already reported this content' });
    }

    // Add the report
    content.reports.push({
      userId: req.user._id,
      reason,
      reportedAt: new Date()
    });

    // If content receives 3 or more reports, mark it as reported
    if (content.reports.length >= 3) {
      content.status = 'reported';
    }

    await content.save();

    res.json({ 
      message: 'Content reported successfully',
      content
    });
  } catch (error) {
    console.error('Error reporting content:', error);
    res.status(500).json({ 
      message: 'Error reporting content',
      error: error.message 
    });
  }
});

// Report post from feed
router.post('/report', protect, async (req, res) => {
  try {
    const { postId, reason, postData } = req.body;
    
    if (!reason) {
      return res.status(400).json({ message: 'Report reason is required' });
    }

    if (!postId || !postData) {
      return res.status(400).json({ message: 'Post data is required' });
    }

    // Check if this post has already been reported by this user
    const existingReport = await ReportedPost.findOne({
      userId: req.user._id,
      postId: postId
    });

    if (existingReport) {
      return res.status(400).json({ message: 'You have already reported this post' });
    }

    // Create a new reported post
    const reportedPost = new ReportedPost({
      userId: req.user._id,
      postId: postId,
      title: postData.title,
      author: postData.author,
      subreddit: postData.subreddit,
      score: postData.score,
      url: postData.url,
      created_utc: postData.created_utc,
      permalink: postData.permalink,
      thumbnail: postData.thumbnail,
      num_comments: postData.num_comments,
      reason: reason,
      status: 'pending'
    });

    await reportedPost.save();

    res.status(201).json({ 
      message: 'Post reported successfully',
      reportedPost
    });
  } catch (error) {
    console.error('Error reporting post:', error);
    res.status(500).json({ 
      message: 'Error reporting post',
      error: error.message 
    });
  }
});

// Fetch new content from APIs
router.post('/fetch', protect, async (req, res) => {
  try {
    const newContent = [];

    // Fetch from Reddit
    try {
      const redditResponse = await axios.get('https://www.reddit.com/r/technology/top.json?limit=10', {
        headers: {
          'User-Agent': 'CreatorPlatform/1.0'
        }
      });

      // Process Reddit content
      for (const post of redditResponse.data.data.children) {
        const content = await Content.create({
          source: 'reddit',
          sourceId: post.data.id,
          author: {
            name: post.data.author,
            username: post.data.author
          },
          content: {
            text: post.data.title,
            url: `https://reddit.com${post.data.permalink}`
          },
          metrics: {
            likes: post.data.score,
            shares: post.data.num_crossposts,
            comments: post.data.num_comments
          },
          metadata: {
            publishedAt: new Date(post.data.created_utc * 1000),
            language: 'en',
            tags: post.data.link_flair_text ? [post.data.link_flair_text] : []
          }
        });
        newContent.push(content);
      }
    } catch (error) {
      console.error('Error fetching Reddit content:', error.message);
    }

    res.json({ 
      message: 'Content fetched successfully', 
      newContent,
      note: 'Twitter integration is currently disabled. Please configure Twitter API credentials in .env file to enable it.'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;