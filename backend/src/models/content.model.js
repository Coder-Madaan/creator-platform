import mongoose from 'mongoose';

const contentSchema = new mongoose.Schema({
  source: {
    type: String,
    enum: ['twitter', 'reddit', 'linkedin'],
    required: true
  },
  sourceId: {
    type: String,
    required: true
  },
  author: {
    name: String,
    username: String,
    profileUrl: String
  },
  content: {
    text: String,
    media: [String],
    url: String
  },
  metrics: {
    likes: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    comments: { type: Number, default: 0 }
  },
  metadata: {
    publishedAt: Date,
    language: String,
    tags: [String]
  },
  status: {
    type: String,
    enum: ['active', 'reported', 'removed'],
    default: 'active'
  },
  reports: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: String,
    reportedAt: Date
  }]
}, {
  timestamps: true
});

// Indexes
contentSchema.index({ source: 1, sourceId: 1 }, { unique: true });
contentSchema.index({ 'metadata.publishedAt': -1 });
contentSchema.index({ 'metadata.tags': 1 });

const Content = mongoose.model('Content', contentSchema);

export default Content; 