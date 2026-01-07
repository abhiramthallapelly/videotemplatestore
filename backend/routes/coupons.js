const express = require('express');
const db = require('../config/db');
const router = express.Router();

const { authenticateToken } = require('../middleware/auth');

// Validate coupon code
router.post('/validate', (req, res) => {
  try {
    const { code, amount } = req.body;

    if (!code) {
      return res.status(400).json({ message: 'Coupon code is required' });
    }

    db.get('SELECT * FROM coupons WHERE code = ? AND is_active = 1', [code.toUpperCase()], (err, coupon) => {
      if (err) {
        return res.status(500).json({ message: 'Database error' });
      }

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
          id: coupon.id,
          code: coupon.code,
          description: coupon.description,
          discount_type: coupon.discount_type,
          discount_value: coupon.discount_value,
          discount_amount: discountAmount
        }
      });
    });
  } catch (error) {
    console.error('Validate coupon error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all coupons (admin)
router.get('/', authenticateToken, (req, res) => {
  try {
    db.all('SELECT * FROM coupons ORDER BY created_at DESC', (err, coupons) => {
      if (err) {
        return res.status(500).json({ message: 'Error fetching coupons' });
      }

      res.json(coupons);
    });
  } catch (error) {
    console.error('Get coupons error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create coupon (admin)
router.post('/', authenticateToken, (req, res) => {
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

    db.run(
      `INSERT INTO coupons (code, description, discount_type, discount_value, min_purchase, max_discount, usage_limit, valid_from, valid_until) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        code.toUpperCase(),
        description || null,
        discount_type || 'percentage',
        discount_value,
        min_purchase || 0,
        max_discount || null,
        usage_limit || null,
        valid_from || null,
        valid_until || null
      ],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint')) {
            return res.status(400).json({ message: 'Coupon code already exists' });
          }
          return res.status(500).json({ message: 'Error creating coupon' });
        }

        res.json({ message: 'Coupon created successfully', couponId: this.lastID });
      }
    );
  } catch (error) {
    console.error('Create coupon error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update coupon (admin)
router.put('/:id', authenticateToken, (req, res) => {
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

    db.run(
      `UPDATE coupons SET 
        description = ?, 
        discount_type = ?, 
        discount_value = ?, 
        min_purchase = ?, 
        max_discount = ?, 
        usage_limit = ?,
        is_active = ?,
        valid_from = ?,
        valid_until = ?
       WHERE id = ?`,
      [
        description || null,
        discount_type || 'percentage',
        discount_value,
        min_purchase || 0,
        max_discount || null,
        usage_limit || null,
        is_active !== undefined ? is_active : 1,
        valid_from || null,
        valid_until || null,
        id
      ],
      function(err) {
        if (err) {
          return res.status(500).json({ message: 'Error updating coupon' });
        }

        if (this.changes === 0) {
          return res.status(404).json({ message: 'Coupon not found' });
        }

        res.json({ message: 'Coupon updated successfully' });
      }
    );
  } catch (error) {
    console.error('Update coupon error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete coupon (admin)
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;

    db.run('DELETE FROM coupons WHERE id = ?', [id], function(err) {
      if (err) {
        return res.status(500).json({ message: 'Error deleting coupon' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ message: 'Coupon not found' });
      }

      res.json({ message: 'Coupon deleted successfully' });
    });
  } catch (error) {
    console.error('Delete coupon error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper function to record coupon usage
function recordCouponUsage(couponId, userId, discountAmount, purchaseId = null, callback) {
  // Increment used_count in coupons table
  db.run('UPDATE coupons SET used_count = used_count + 1 WHERE id = ?', [couponId], (err) => {
    if (err) {
      console.error('Error updating coupon used_count:', err);
      return callback(err);
    }

    // Record usage in coupon_usage table for analytics
    db.run(
      'INSERT INTO coupon_usage (coupon_id, user_id, purchase_id, discount_amount) VALUES (?, ?, ?, ?)',
      [couponId, userId, purchaseId, discountAmount],
      (err) => {
        if (err) {
          console.error('Error recording coupon usage:', err);
          return callback(err);
        }
        callback(null);
      }
    );
  });
}

// Apply coupon to purchase
router.post('/apply', authenticateToken, (req, res) => {
  try {
    const { code, amount, purchaseId } = req.body;
    const userId = req.user.userId;

    if (!code || !amount) {
      return res.status(400).json({ message: 'Code and amount are required' });
    }

    db.get('SELECT * FROM coupons WHERE code = ? AND is_active = 1', [code.toUpperCase()], (err, coupon) => {
      if (err) {
        return res.status(500).json({ message: 'Database error' });
      }

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

      // Check if user has already used this coupon (prevent duplicate usage)
      db.get('SELECT id FROM coupon_usage WHERE coupon_id = ? AND user_id = ?', 
        [coupon.id, userId], (err, existingUsage) => {
        if (err) {
          return res.status(500).json({ message: 'Database error' });
        }

        // Check usage limit (only if coupon has per-user limit, otherwise check global limit)
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
        // If purchaseId is not provided, this is just a validation/preview
        if (purchaseId) {
          recordCouponUsage(coupon.id, userId, discountAmount, purchaseId, (err) => {
            if (err) {
              console.error('Error recording coupon usage:', err);
              // Don't fail the request, just log the error
            }
          });
        }

        res.json({
          valid: true,
          originalAmount: amount,
          discountAmount: discountAmount,
          finalAmount: finalAmount,
          coupon: {
            id: coupon.id,
            code: coupon.code,
            description: coupon.description
          },
          usageRecorded: !!purchaseId
        });
      });
    });
  } catch (error) {
    console.error('Apply coupon error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

