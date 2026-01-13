const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  file_path: {
    type: String,
    required: true
  },
  image_path: {
    type: String
  },
  is_free: {
    type: Boolean,
    default: true
  },
  price: {
    type: Number,
    default: 0,
    min: 0
  },
  category: {
    type: String,
    default: 'template',
    trim: true
  },
  file_type: {
    type: String
  },
  file_size: {
    type: Number
  },
  download_count: {
    type: Number,
    default: 0
  },
  view_count: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
projectSchema.index({ created_at: -1 });
projectSchema.index({ download_count: -1 });
projectSchema.index({ title: 'text', description: 'text' }); // Text search

// Virtual for formatted dates
projectSchema.virtual('created_at').get(function() {
  return this.createdAt;
});

projectSchema.virtual('updated_at').get(function() {
  return this.updatedAt;
});

module.exports = mongoose.model('Project', projectSchema);

