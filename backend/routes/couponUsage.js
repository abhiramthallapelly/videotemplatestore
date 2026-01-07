const express = require('express');
const db = require('../config/db');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');

// Get coupon usage statistics (admin)
router.get('/stats', authenticateToken, (req, res) => {
  try {
    // Get total usage statistics
    db.get(`
      SELECT 
        COUNT(*) as total_uses,
        SUM(discount_amount) as total_discounts_given,
        COUNT(DISTINCT user_id) as unique_users,
        COUNT(DISTINCT coupon_id) as unique_coupons
      FROM coupon_usage
    `, (err, stats) => {
      if (err) {
        return res.status(500).json({ message: 'Error fetching statistics' });
      }

      // Get top used coupons
      db.all(`
        SELECT 
          c.code,
          c.description,
          COUNT(cu.id) as usage_count,
          SUM(cu.discount_amount) as total_discount
        FROM coupon_usage cu
        JOIN coupons c ON cu.coupon_id = c.id
        GROUP BY cu.coupon_id
        ORDER BY usage_count DESC
        LIMIT 10
      `, (err, topCoupons) => {
        if (err) {
          return res.status(500).json({ message: 'Error fetching top coupons' });
        }

        res.json({
          statistics: stats,
          topCoupons: topCoupons || []
        });
      });
    });
  } catch (error) {
    console.error('Coupon usage stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's coupon usage history
router.get('/my-usage', authenticateToken, (req, res) => {
  try {
    const userId = req.user.userId;

    db.all(`
      SELECT 
        cu.*,
        c.code,
        c.description,
        p.title as project_title
      FROM coupon_usage cu
      JOIN coupons c ON cu.coupon_id = c.id
      LEFT JOIN purchases p ON cu.purchase_id = p.id
      WHERE cu.user_id = ?
      ORDER BY cu.used_at DESC
    `, [userId], (err, usage) => {
      if (err) {
        return res.status(500).json({ message: 'Error fetching usage history' });
      }

      res.json(usage || []);
    });
  } catch (error) {
    console.error('My coupon usage error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get coupon usage by coupon ID (admin)
router.get('/coupon/:couponId', authenticateToken, (req, res) => {
  try {
    const { couponId } = req.params;

    db.all(`
      SELECT 
        cu.*,
        u.username,
        u.email,
        p.title as project_title
      FROM coupon_usage cu
      JOIN users u ON cu.user_id = u.id
      LEFT JOIN purchases p ON cu.purchase_id = p.id
      WHERE cu.coupon_id = ?
      ORDER BY cu.used_at DESC
    `, [couponId], (err, usage) => {
      if (err) {
        return res.status(500).json({ message: 'Error fetching coupon usage' });
      }

      res.json(usage || []);
    });
  } catch (error) {
    console.error('Coupon usage by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

