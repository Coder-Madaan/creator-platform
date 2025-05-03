import express from 'express';
import { admin, protect } from '../middleware/auth.middleware.js';
import User from '../models/user.model.js';
import Content from '../models/content.model.js';
import { ReportedPost } from '../models/ReportedPost.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);
router.use(admin);

// Get analytics data
router.get('/analytics', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeToday = await User.countDocuments({
      lastActive: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });
    
    const totalCredits = await User.aggregate([
      { $group: { _id: null, total: { $sum: '$credits' } } }
    ]);
    
    const pendingReports = await Content.countDocuments({ status: 'reported' });

    res.json({
      totalUsers,
      activeToday,
      totalCredits: totalCredits[0]?.total || 0,
      pendingReports,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get activity data
router.get('/activity', async (req, res) => {
  try {
    const { timeRange = 'week' } = req.query;
    const days = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 90;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    // Get new users per day
    const newUsersData = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get active users per day
    const activeUsersData = await User.aggregate([
      {
        $match: {
          lastActive: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$lastActive' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Generate dates array
    const dates = [];
    const newUsers = [];
    const activeUsers = [];
    
    for (let i = 0; i < days; i++) {
      const date = new Date(Date.now() - (days - i - 1) * 24 * 60 * 60 * 1000);
      const dateString = date.toISOString().split('T')[0];
      dates.push(new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
      
      const newUsersCount = newUsersData.find(d => d._id === dateString)?.count || 0;
      const activeUsersCount = activeUsersData.find(d => d._id === dateString)?.count || 0;
      
      newUsers.push(newUsersCount);
      activeUsers.push(activeUsersCount);
    }

    // Get credit distribution data
    const creditSources = ['Daily Login', 'Profile Completion', 'Content Interaction', 'Referrals', 'Special Events'];
    // In a real app, this would come from a credits log/history collection
    const creditAmounts = await Promise.all(creditSources.map(async () => {
      return Math.floor(Math.random() * 500) + 100; // Mock data
    }));

    // Get content engagement data
    const contentStats = await Content.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          saved: { $sum: { $cond: [{ $eq: ['$type', 'saved'] }, 1, 0] } },
          shared: { $sum: { $cond: [{ $eq: ['$type', 'shared'] }, 1, 0] } },
          reported: { $sum: { $cond: [{ $eq: ['$status', 'reported'] }, 1, 0] } }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Format content engagement data
    const savedContent = [];
    const sharedContent = [];
    const reportedContent = [];
    
    dates.forEach(date => {
      const stats = contentStats.find(s => new Date(s._id).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) === date);
      savedContent.push(stats?.saved || 0);
      sharedContent.push(stats?.shared || 0);
      reportedContent.push(stats?.reported || 0);
    });

    // Get report reasons distribution
    const reportReasons = ['Inappropriate', 'Spam', 'Misleading', 'Copyright', 'Other'];
    const reportCounts = await Content.aggregate([
      {
        $match: { status: 'reported' }
      },
      {
        $group: {
          _id: '$reportReason',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      dates,
      newUsers,
      activeUsers,
      creditSources,
      creditAmounts,
      savedContent,
      sharedContent,
      reportedContent,
      reportReasons,
      reportCounts: reportReasons.map(reason => 
        reportCounts.find(r => r._id === reason)?.count || 0
      )
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get top users
router.get('/top-users', async (req, res) => {
  try {
    const users = await User.find()
      .select('username email credits lastActive')
      .sort({ credits: -1 })
      .limit(5);

    const topUsers = users.map(user => ({
      id: user._id,
      name: user.username,
      email: user.email,
      credits: user.credits,
      interactions: Math.floor(Math.random() * 50) + 30, // Mock data
      lastActive: user.lastActive,
      // Avatar would come from user profile in real app
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}`
    }));

    res.json(topUsers);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get recent reports
router.get('/recent-reports', async (req, res) => {
  try {
    const reports = await Content.find({ status: 'reported' })
      .select('_id source reportReason status createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    const formattedReports = reports.map(report => ({
      id: report._id,
      contentId: `post-${report._id.toString().slice(-3)}`,
      source: report.source || 'website',
      reason: report.reportReason || 'Inappropriate content',
      status: report.status,
      timestamp: report.createdAt
    }));

    res.json(formattedReports);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ lastActive: -1 });

    // Calculate profile completion percentage
    const usersWithCompletion = users.map(user => {
      const fields = {
        username: Boolean(user.username),
        email: Boolean(user.email),
        bio: Boolean(user.profile?.bio),
        avatar: Boolean(user.profile?.avatar && !user.profile.avatar.includes('ui-avatars.com')), // Only count uploaded avatars
        location: Boolean(user.profile?.location),
        profession: Boolean(user.profile?.profession),
        socialLinks: Boolean(user.profile?.socialLinks?.twitter || user.profile?.socialLinks?.linkedin || user.profile?.socialLinks?.reddit)
      };
      
      const totalFields = Object.keys(fields).length;
      const completedFields = Object.values(fields).filter(Boolean).length;
      const profileCompletion = Math.round((completedFields / totalFields) * 100);
      
      return {
        ...user.toObject(),
        profileCompletion,
        completedFields: fields,
        name: user.username, // For frontend compatibility
      };
    });

    res.json(usersWithCompletion);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get reported content
router.get('/reported-content', async (req, res) => {
  try {
    const reportedContent = await ReportedPost.find()
      .populate('userId', 'username email profile')
      .sort({ reportedAt: -1 });

    // Transform data to match frontend expectations
    const formattedContent = reportedContent.map(post => ({
      id: post._id,
      title: post.title,
      content: post.title,
      source: 'reddit',
      sourceId: post.postId,
      author: post.author,
      subreddit: post.subreddit,
      url: post.url,
      permalink: post.permalink,
      thumbnail: post.thumbnail,
      createdAt: new Date(post.created_utc * 1000),
      status: post.status === 'pending' ? 'reported' : 
             post.status === 'reviewed' ? 'active' : 'removed',
      reports: [{
        id: post._id,
        userId: {
          id: post.userId._id,
          name: post.userId.username,
          email: post.userId.email,
          avatar: post.userId.profile?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.userId.username)}`
        },
        reason: post.reason,
        date: post.reportedAt
      }],
      reportCount: 1,
      score: post.score,
      numComments: post.num_comments
    }));

    res.json(formattedContent);
  } catch (error) {
    console.error('Error fetching reported content:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update content status
router.put('/content/:contentId', async (req, res) => {
  try {
    const { status } = req.body;
    const content = await Content.findById(req.params.contentId);

    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }

    content.status = status;
    await content.save();

    res.json({ message: 'Content status updated successfully', content });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update report status
router.put('/reported-content/:reportId', async (req, res) => {
  try {
    const { status } = req.body;
    const reportedPost = await ReportedPost.findByIdAndUpdate(
      req.params.reportId,
      { status },
      { new: true }
    );

    if (!reportedPost) {
      return res.status(404).json({ message: 'Reported post not found' });
    }

    res.json({ message: 'Report status updated successfully', reportedPost });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user status
router.put('/users/:userId/status', async (req, res) => {
  try {
    const { status } = req.body;
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.status = status;
    await user.save();

    res.json({ message: 'User status updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user role
router.put('/users/:userId/role', async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent removing the last admin
    if (role === 'user' && user.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return res.status(400).json({ message: 'Cannot remove the last admin' });
      }
    }

    user.role = role;
    await user.save();

    res.json({ message: 'User role updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete user
router.delete('/users/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent deleting the last admin
    if (user.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return res.status(400).json({ message: 'Cannot delete the last admin' });
      }
    }

    await user.deleteOne();
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
