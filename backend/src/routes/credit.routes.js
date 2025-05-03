import express from 'express';
import { protect, admin } from '../middleware/auth.middleware.js';
import User from '../models/user.model.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);

// Get user credits with recent changes
router.get('/balance', async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('credits creditHistory');
    const recentChanges = user.creditHistory?.slice(-5) || [];
    res.json({ 
      credits: user.credits,
      recentChanges
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add credit history entry
const addCreditHistory = async (userId, amount, reason, source) => {
  const user = await User.findById(userId);
  if (!user.creditHistory) {
    user.creditHistory = [];
  }
  
  user.creditHistory.push({
    amount,
    reason,
    source,
    timestamp: new Date()
  });

  // Keep only last 50 entries
  if (user.creditHistory.length > 50) {
    user.creditHistory = user.creditHistory.slice(-50);
  }
  
  await user.save();
};

// Award daily login bonus
router.post('/daily-bonus', async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const now = new Date();
    const lastLogin = user.lastLogin || new Date(0);
    
    // Compare dates without time
    const lastLoginDate = new Date(lastLogin.getFullYear(), lastLogin.getMonth(), lastLogin.getDate());
    const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    if (lastLoginDate < todayDate) {
      const bonusAmount = 10; // Daily bonus amount
      user.credits += bonusAmount;
      user.lastLogin = now;
      
      // Add to credit history
      await addCreditHistory(user._id, bonusAmount, 'Daily login bonus', 'login');
      await user.save();
      
      return res.json({ 
        message: 'Daily bonus awarded',
        credits: user.credits,
        creditChange: {
          amount: bonusAmount,
          reason: 'Daily login bonus'
        }
      });
    } 
    
    // If user already claimed bonus today
    const tomorrow = new Date(todayDate);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const hoursLeft = Math.ceil((tomorrow - now) / (1000 * 60 * 60));
    
    return res.status(400).json({ 
      message: `Already claimed today's bonus. Come back in ${hoursLeft} hours.`,
      nextBonusTime: tomorrow
    });
  } catch (error) {
    console.error('Daily bonus error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin routes below this point
router.use(admin);

// Get all users' credits
router.get('/all', async (req, res) => {
  try {
    const users = await User.find().select('username email credits creditHistory');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user credits (admin only)
router.put('/:userId', async (req, res) => {
  try {
    const { credits, reason } = req.body;
    
    if (typeof credits !== 'number' || credits < 0) {
      return res.status(400).json({ message: 'Invalid credit amount' });
    }

    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Store previous credits for logging
    const previousCredits = user.credits;
    const creditChange = credits - previousCredits;
    
    user.credits = credits;
    await addCreditHistory(user._id, creditChange, reason || 'Admin adjustment', 'admin');
    await user.save();
    
    // Refresh the requesting user's data if they modified their own credits
    const requestingUser = await User.findById(req.user._id);
    
    res.json({ 
      message: 'Credits updated successfully',
      user: {
        id: user._id,
        username: user.username,
        credits: user.credits,
        previousCredits,
        creditChange,
        reason
      },
      requestingUser: req.user._id.equals(user._id) ? {
        id: requestingUser._id,
        username: requestingUser.username,
        credits: requestingUser.credits
      } : null
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;