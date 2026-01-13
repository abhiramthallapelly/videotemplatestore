const mongoose = require('mongoose');

const newsletterSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  name: {
    type: String,
    trim: true
  },
  is_active: {
    type: Boolean,
    default: true
  },
  unsubscribed_at: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

newsletterSchema.index({ email: 1 });
newsletterSchema.index({ is_active: 1 });

module.exports = mongoose.model('Newsletter', newsletterSchema);

