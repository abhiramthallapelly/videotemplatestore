const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  event_type: {
    type: String,
    required: true,
    trim: true
  },
  event_data: {
    type: mongoose.Schema.Types.Mixed
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  project_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  },
  ip_address: {
    type: String
  },
  user_agent: {
    type: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
analyticsSchema.index({ event_type: 1 });
analyticsSchema.index({ user_id: 1 });
analyticsSchema.index({ project_id: 1 });
analyticsSchema.index({ created_at: -1 });

module.exports = mongoose.model('Analytics', analyticsSchema);

