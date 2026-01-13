const mongoose = require('mongoose');

const couponUsageSchema = new mongoose.Schema({
  coupon_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Coupon',
    required: true
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  purchase_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Purchase'
  },
  discount_amount: {
    type: Number,
    required: true,
    min: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
couponUsageSchema.index({ coupon_id: 1 });
couponUsageSchema.index({ user_id: 1 });
couponUsageSchema.index({ purchase_id: 1 });
couponUsageSchema.index({ created_at: -1 });

module.exports = mongoose.model('CouponUsage', couponUsageSchema);

