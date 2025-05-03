import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  credits: {
    type: Number,
    default: 0
  },
  creditHistory: [{
    amount: Number,
    reason: String,
    source: {
      type: String,
      enum: ['login', 'profile', 'admin', 'interaction'],
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  profile: {
    bio: String,
    avatar: String,
    location: String,
    profession: String,
    socialLinks: {
      website: String,
      twitter: String,
      instagram: String
    }
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  savedContent: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Content'
  }],
  reportedContent: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Content'
  }]
}, {
  timestamps: true
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ lastActive: -1 });
userSchema.index({ role: 1 });
userSchema.index({ status: 1 });

const User = mongoose.model('User', userSchema);

export default User;