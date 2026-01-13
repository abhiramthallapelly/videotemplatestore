const express = require('express');
const Coupon = require('../models/Coupon');
const CouponUsage = require('../models/CouponUsage');
const router = express.Router();

const { authenticateToken } = require('../middleware/auth');

// Validate coupon code
router.post('/validate', async (req, res) => {
  try {
    const { code, amount } = req.body;

    if (!code) {
      return res.status(400).json({ message: 'Coupon code is required' });
    }

    const coupon = await Coupon.findOne({ 
      code: code.toUpperCase(), 
      is_active: true 
    });

    if (!coupon) {
      return res.status(404).json({ message: 'Invalid or expired coupon code' });
    }

    // Check validity dates
    const now = new Date();
    if (coupon.valid_from && new Date(coupon.valid_from) > now) {
      return res.status(400).json({ message: 'Coupon is not yet valid' });
    }

    if (coupon.valid_until && new Date(coupon.valid_until) < now) {
      return res.status(400).json({ message: 'Coupon has expired' });
    }

    // Check usage limit
    if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
      return res.status(400).json({ message: 'Coupon usage limit reached' });
    }

    // Check minimum purchase
    if (amount && coupon.min_purchase && amount < coupon.min_purchase) {
      return res.status(400).json({ 
        message: `Minimum purchase of $${coupon.min_purchase} required` 
      });
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discount_type === 'percentage') {
      discountAmount = Math.round((amount || 0) * coupon.discount_value / 100);
      if (coupon.max_discount && discountAmount > coupon.max_discount) {
        discountAmount = coupon.max_discount;
      }
    } else {
      discountAmount = coupon.discount_value;
    }

    res.json({
      valid: true,
      coupon: {
        id: coupon._id.toString(),
        code: coupon.code,
        description: coupon.description,
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value,
        discount_amount: discountAmount
      }
    });
  } catch (error) {
    console.error('Validate coupon error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all coupons (admin)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 }).lean();
    res.json(coupons.map(c => ({
      ...c,
      id: c._id.toString()
    })));
  } catch (error) {
    console.error('Get coupons error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create coupon (admin)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { 
      code, 
      description, 
      discount_type, 
      discount_value, 
      min_purchase, 
      max_discount, 
      usage_limit,
      valid_from,
      valid_until
    } = req.body;

    if (!code || !discount_value) {
      return res.status(400).json({ message: 'Code and discount value are required' });
    }

    try {
      const coupon = await Coupon.create({
        code: code.toUpperCase(),
        description: description || null,
        discount_type: discount_type || 'percentage',
        discount_value,
        min_purchase: min_purchase || 0,
        max_discount: max_discount || null,
        usage_limit: usage_limit || null,
        valid_from: valid_from || null,
        valid_until: valid_until || null
      });

      res.json({ 
        message: 'Coupon created successfully', 
        couponId: coupon._id.toString() 
      });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(400).json({ message: 'Coupon code already exists' });
      }
      throw error;
    }
  } catch (error) {
    console.error('Create coupon error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update coupon (admin)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      description, 
      discount_type, 
      discount_value, 
      min_purchase, 
      max_discount, 
      usage_limit,
      is_active,
      valid_from,
      valid_until
    } = req.body;

    const coupon = await Coupon.findByIdAndUpdate(
      id,
      {
        description: description || null,
        discount_type: discount_type || 'percentage',
        discount_value,
        min_purchase: min_purchase || 0,
        max_discount: max_discount || null,
        usage_limit: usage_limit || null,
        is_active: is_active !== undefined ? is_active : true,
        valid_from: valid_from || null,
        valid_until: valid_until || null
      },
      { new: true, runValidators: true }
    );

    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    res.json({ message: 'Coupon updated successfully' });
  } catch (error) {
    console.error('Update coupon error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete coupon (admin)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const coupon = await Coupon.findByIdAndDelete(id);

    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    res.json({ message: 'Coupon deleted successfully' });
  } catch (error) {
    console.error('Delete coupon error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper function to record coupon usage
async function recordCouponUsage(couponId, userId, discountAmount, purchaseId = null) {
  try {
    // Increment used_count in coupons table
    await Coupon.findByIdAndUpdate(couponId, { $inc: { used_count: 1 } });
    
    // Record usage in coupon_usage table for analytics
    await CouponUsage.create({
      coupon_id: couponId,
      user_id: userId,
      purchase_id: purchaseId,
      discount_amount: discountAmount
    });
  } catch (error) {
    console.error('Error recording coupon usage:', error);
    throw error;
  }
}

// Apply coupon to purchase
router.post('/apply', authenticateToken, async (req, res) => {
  try {
    const { code, amount, purchaseId } = req.body;
    const userId = req.user.userId;

    if (!code || !amount) {
      return res.status(400).json({ message: 'Code and amount are required' });
    }

    const coupon = await Coupon.findOne({ 
      code: code.toUpperCase(), 
      is_active: true 
    });

    if (!coupon) {
      return res.status(404).json({ message: 'Invalid coupon code' });
    }

    // Check validity
    const now = new Date();
    if (coupon.valid_from && new Date(coupon.valid_from) > now) {
      return res.status(400).json({ message: 'Coupon is not yet valid' });
    }

    if (coupon.valid_until && new Date(coupon.valid_until) < now) {
      return res.status(400).json({ message: 'Coupon has expired' });
    }

    // Check usage limit
    if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
      return res.status(400).json({ message: 'Coupon usage limit reached' });
    }

    if (amount < coupon.min_purchase) {
      return res.status(400).json({ 
        message: `Minimum purchase of $${coupon.min_purchase} required` 
      });
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discount_type === 'percentage') {
      discountAmount = Math.round(amount * coupon.discount_value / 100);
      if (coupon.max_discount && discountAmount > coupon.max_discount) {
        discountAmount = coupon.max_discount;
      }
    } else {
      discountAmount = coupon.discount_value;
    }

    const finalAmount = Math.max(0, amount - discountAmount);

    // Record coupon usage (only if purchaseId is provided, meaning it's an actual purchase)
    if (purchaseId) {
      try {
        await recordCouponUsage(coupon._id.toString(), userId, discountAmount, purchaseId);
      } catch (err) {
        console.error('Error recording coupon usage:', err);
        // Don't fail the request, just log the error
      }
    }

    res.json({
      valid: true,
      originalAmount: amount,
      discountAmount: discountAmount,
      finalAmount: finalAmount,
      coupon: {
        id: coupon._id.toString(),
        code: coupon.code,
        description: coupon.description
      },
      usageRecorded: !!purchaseId
    });
  } catch (error) {
    console.error('Apply coupon error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
