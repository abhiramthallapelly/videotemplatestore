const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  discount_type: {
    type: String,
    enum: ['percentage', 'fixed'],
    default: 'percentage'
  },
  discount_value: {
    type: Number,
    required: true,
    min: 0
  },
  min_purchase: {
    type: Number,
    default: 0,
    min: 0
  },
  max_discount: {
    type: Number,
    min: 0
  },
  usage_limit: {
    type: Number,
    min: 0
  },
  used_count: {
    type: Number,
    default: 0,
    min: 0
  },
  is_active: {
    type: Boolean,
    default: true
  },
  valid_from: {
    type: Date
  },
  valid_until: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
couponSchema.index({ code: 1 });
couponSchema.index({ is_active: 1 });

module.exports = mongoose.model('Coupon', couponSchema);

