import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

const router = express.Router();

// Register user
router.post('/register', async (req, res) => {
  try {
    const { email, password, username } = req.body;

    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    user = new User({
      email,
      password,
      username,
      role: 'user', // Default role
      credits: 100, // Starting credits
      lastLogin: new Date(),
      createdAt: new Date(),
      lastActive: new Date()
    });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Add credit history entry for initial credits
    user.creditHistory.push({
      amount: 100,
      reason: 'Welcome bonus',
      source: 'interaction',
      timestamp: new Date()
    });

    await user.save();

    // Create token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'jwt_secret',
      { expiresIn: '7d' }
    );

    // Return user data with profile
    const userResponse = {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      credits: user.credits,
      profile: user.profile
    };

    res.json({ token, user: userResponse });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password, isAdmin } = req.body;
    const user = await User.findOne({ email });

    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (user.status !== 'active') {
      return res.status(403).json({ message: 'Account is not active' });
    }

    // If attempting admin login, verify user is admin
    if (isAdmin && user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized as admin' });
    }

    // Check if 24 hours have passed since last login reward
    const lastLoginReward = user.creditHistory.find(ch => ch.source === 'login');
    const now = new Date();
    const hoursFromLastReward = lastLoginReward 
      ? (now - new Date(lastLoginReward.timestamp)) / (1000 * 60 * 60)
      : 25; // If no previous reward, make sure they get one

    let loginReward = 0;
    if (hoursFromLastReward >= 24) {
      loginReward = 10;
      user.credits += loginReward;
      user.creditHistory.push({
        amount: loginReward,
        reason: 'Daily login reward',
        source: 'login',
        timestamp: now
      });
    }

    // Update last active and login times
    user.lastActive = now;
    user.lastLogin = now;
    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'jwt_secret',
      { expiresIn: '24h' }
    );

    res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      credits: user.credits,
      loginReward: loginReward > 0 ? loginReward : null,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Logout user
router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

export default router;