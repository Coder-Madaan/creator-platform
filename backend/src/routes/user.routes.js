import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import User from '../models/user.model.js';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);

// Get user profile
router.get('/profile', async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    // Return complete user data including profile
    const userResponse = {
      id: user._id,
      username: user.username,
      email: user.email,
      credits: user.credits,
      role: user.role,
      profile: user.profile || {} // Ensure profile is always an object
    };
    res.json(userResponse);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/profile', async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Store previous profile state
    const previousProfile = { ...user.profile };

    // Update user fields
    if (req.body.username) user.username = req.body.username;
    if (req.body.email) user.email = req.body.email;
    
    // Update profile fields
    if (req.body.profile) {
      user.profile = {
        ...user.profile,
        ...req.body.profile
      };
    }

    // Calculate credits earned
    const getCompletedFields = (profile) => ({
      bio: Boolean(profile.bio),
      avatar: Boolean(profile.avatar && !profile.avatar.includes('ui-avatars.com')),
      location: Boolean(profile.location),
      profession: Boolean(profile.profession),
      socialLinks: Boolean(
        profile.socialLinks?.twitter || 
        profile.socialLinks?.instagram ||
        profile.socialLinks?.website
      )
    });

    const prevFields = getCompletedFields(previousProfile);
    const newFields = getCompletedFields(user.profile);
    
    // Award credits for newly completed fields
    const creditRewards = {
      bio: 5,
      avatar: 10,
      location: 3,
      profession: 5,
      socialLinks: 7
    };

    let creditsEarned = 0;
    const completedFields = [];
    
    for (const field in newFields) {
      if (!prevFields[field] && newFields[field]) {
        creditsEarned += creditRewards[field];
        completedFields.push(field);
      }
    }

    if (creditsEarned > 0) {
      user.credits += creditsEarned;
      
      // Add credit history entry for each completed field
      for (const field of completedFields) {
        const reward = creditRewards[field];
        user.creditHistory.push({
          amount: reward,
          reason: `Completed profile field: ${field}`,
          source: 'profile',
          timestamp: new Date()
        });
      }
    }

    await user.save();
    
    // Return complete user data including profile
    const userResponse = {
      id: user._id,
      username: user.username,
      email: user.email,
      credits: user.credits,
      role: user.role,
      profile: user.profile
    };
    
    return res.json({ 
      message: 'Profile updated successfully', 
      user: userResponse,
      creditsEarned: creditsEarned || 0,
      updatedFields: creditsEarned > 0 ? completedFields : []
    });

  } catch (error) {
    console.error('Profile update error:', error);
    return res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Update user avatar
router.put('/profile/avatar', async (req, res) => {
  try {
    if (!req.files || !req.files.avatar) {
      return res.status(400).json({ message: 'No avatar file uploaded' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const avatarFile = req.files.avatar;
    const uploadPath = `uploads/avatars/${user._id}-${Date.now()}${path.extname(avatarFile.name)}`;
    
    // Move the uploaded file
    await avatarFile.mv(uploadPath);
    
    // Store previous avatar state to check for credit rewards
    const previousAvatar = user.profile?.avatar;

    // Ensure profile object exists
    if (!user.profile) {
      user.profile = {};
    }
    
    // Update avatar while preserving other profile fields
    user.profile = {
      ...user.profile,
      avatar: `/${uploadPath}`,
      socialLinks: user.profile.socialLinks || {} // Preserve existing socialLinks or initialize empty object
    };

    // Check if this is the first real avatar (not default ui-avatars.com)
    let creditsEarned = 0;
    if (!previousAvatar || previousAvatar.includes('ui-avatars.com')) {
      creditsEarned = 10;
      user.credits += creditsEarned;
      user.creditHistory.push({
        amount: creditsEarned,
        reason: 'Added profile picture',
        source: 'profile',
        timestamp: new Date()
      });
    }

    await user.save();

    return res.json({ 
      message: 'Avatar updated successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        credits: user.credits,
        role: user.role,
        profile: user.profile
      },
      creditsEarned
    });

  } catch (error) {
    console.error('Avatar update error:', error);
    return res.status(500).json({ 
      message: 'Error updating avatar',
      error: error.message 
    });
  }
});

// Get saved content
router.get('/saved-content', async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('savedContent')
      .select('savedContent');
    res.json(user.savedContent);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get activity history
router.get('/activity', async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('savedContent')
      .populate('reportedContent')
      .select('savedContent reportedContent lastLogin');
    
    res.json({
      lastLogin: user.lastLogin,
      savedContent: user.savedContent,
      reportedContent: user.reportedContent
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;