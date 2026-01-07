const express = require('express');
const db = require('../config/db');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');

// Get dashboard statistics (admin only)
router.get('/dashboard', authenticateToken, (req, res) => {
  try {
    const stats = {};

    // Get total users
    db.get('SELECT COUNT(*) as count FROM users', (err, result) => {
      if (err) throw err;
      stats.totalUsers = result.count;

      // Get total projects
      db.get('SELECT COUNT(*) as count FROM projects', (err, result) => {
        if (err) throw err;
        stats.totalProjects = result.count;

        // Get total downloads
        db.get('SELECT COUNT(*) as count FROM downloads', (err, result) => {
          if (err) throw err;
          stats.totalDownloads = result.count;

          // Get total purchases
          db.get('SELECT COUNT(*) as count, SUM(amount) as revenue FROM purchases WHERE payment_status = "completed"', (err, result) => {
            if (err) throw err;
            stats.totalPurchases = result.count || 0;
            stats.totalRevenue = result.revenue || 0;

            // Get recent activity
            db.all(`
              SELECT 
                'download' as type,
                d.created_at,
                u.username,
                p.title as project_title
              FROM downloads d
              LEFT JOIN users u ON d.user_id = u.id
              LEFT JOIN projects p ON d.project_id = p.id
              ORDER BY d.created_at DESC
              LIMIT 10
            `, (err, downloads) => {
              if (err) throw err;

              db.all(`
                SELECT 
                  'purchase' as type,
                  pu.created_at,
                  u.username,
                  p.title as project_title,
                  pu.amount
                FROM purchases pu
                LEFT JOIN users u ON pu.user_id = u.id
                LEFT JOIN projects p ON pu.project_id = p.id
                WHERE pu.payment_status = 'completed'
                ORDER BY pu.created_at DESC
                LIMIT 10
              `, (err, purchases) => {
                if (err) throw err;

                // Combine and sort by date
                const recentActivity = [...downloads, ...purchases]
                  .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                  .slice(0, 10);

                stats.recentActivity = recentActivity;

                // Get top products
                db.all(`
                  SELECT 
                    p.id,
                    p.title,
                    COUNT(d.id) as download_count,
                    COUNT(CASE WHEN pu.payment_status = 'completed' THEN 1 END) as purchase_count,
                    SUM(CASE WHEN pu.payment_status = 'completed' THEN pu.amount ELSE 0 END) as revenue
                  FROM projects p
                  LEFT JOIN downloads d ON p.id = d.project_id
                  LEFT JOIN purchases pu ON p.id = pu.project_id
                  GROUP BY p.id
                  ORDER BY download_count DESC, purchase_count DESC
                  LIMIT 10
                `, (err, topProducts) => {
                  if (err) throw err;
                  stats.topProducts = topProducts;

                  res.json(stats);
                });
              });
            });
          });
        });
      });
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ message: 'Error fetching analytics' });
  }
});

// Track event (public endpoint, no auth required)
router.post('/track', (req, res) => {
  try {
    const { eventType, eventData, projectId } = req.body;
    
    // Try to get user from token if provided
    let userId = null;
    const authHeader = req.headers['authorization'];
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      if (token) {
        try {
          const jwt = require('jsonwebtoken');
          const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
          userId = decoded.userId;
        } catch (err) {
          // Token invalid or expired, continue without user
        }
      }
    }
    
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    db.run(
      'INSERT INTO analytics (event_type, event_data, user_id, project_id, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?)',
      [eventType, JSON.stringify(eventData), userId, projectId, ipAddress, userAgent],
      function(err) {
        if (err) {
          console.error('Error tracking event:', err);
          return res.status(500).json({ message: 'Error tracking event' });
        }
        res.json({ success: true });
      }
    );
  } catch (error) {
    console.error('Track event error:', error);
    res.status(500).json({ message: 'Error tracking event' });
  }
});

// Get user statistics
router.get('/user-stats', authenticateToken, (req, res) => {
  try {
    const userId = req.user.userId;

    db.get('SELECT COUNT(*) as count FROM downloads WHERE user_id = ?', [userId], (err, downloads) => {
      if (err) throw err;

      db.get('SELECT COUNT(*) as count, SUM(amount) as total FROM purchases WHERE user_id = ? AND payment_status = "completed"', [userId], (err, purchases) => {
        if (err) throw err;

        db.get('SELECT COUNT(*) as count FROM wishlist WHERE user_id = ?', [userId], (err, wishlist) => {
          if (err) throw err;

          res.json({
            totalDownloads: downloads.count,
            totalPurchases: purchases.count || 0,
            totalSpent: purchases.total || 0,
            wishlistItems: wishlist.count
          });
        });
      });
    });
  } catch (error) {
    console.error('User stats error:', error);
    res.status(500).json({ message: 'Error fetching user statistics' });
  }
});

module.exports = router;

