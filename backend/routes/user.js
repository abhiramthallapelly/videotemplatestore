const express = require('express');
const db = require('../config/db');
const router = express.Router();

const { authenticateToken } = require('../middleware/auth');

// Get user dashboard data
router.get('/dashboard', authenticateToken, (req, res) => {
  try {
    const userId = req.user.userId;

    // Get user info
    db.get('SELECT id, username, email, full_name, created_at FROM users WHERE id = ?', [userId], (err, user) => {
      if (err) {
        return res.status(500).json({ message: 'Database error' });
      }

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Get purchase history
      db.all(`
        SELECT 
          pu.*,
          p.title,
          p.image_path,
          p.file_path
        FROM purchases pu
        JOIN projects p ON pu.project_id = p.id
        WHERE pu.user_id = ? AND pu.payment_status = 'completed'
        ORDER BY pu.created_at DESC
      `, [userId], (err, purchases) => {
        if (err) {
          return res.status(500).json({ message: 'Database error' });
        }

        // Get download history
        db.all(`
          SELECT 
            d.*,
            p.title,
            p.image_path,
            p.file_path,
            p.is_free
          FROM downloads d
          JOIN projects p ON d.project_id = p.id
          WHERE d.user_id = ?
          ORDER BY d.created_at DESC
          LIMIT 50
        `, [userId], (err, downloads) => {
          if (err) {
            return res.status(500).json({ message: 'Database error' });
          }

          // Get wishlist count
          db.get('SELECT COUNT(*) as count FROM wishlist WHERE user_id = ?', [userId], (err, wishlist) => {
            if (err) {
              return res.status(500).json({ message: 'Database error' });
            }

            // Get statistics
            db.get(`
              SELECT 
                COUNT(DISTINCT d.id) as total_downloads,
                COUNT(DISTINCT pu.id) as total_purchases,
                SUM(pu.amount) as total_spent
              FROM users u
              LEFT JOIN downloads d ON u.id = d.user_id
              LEFT JOIN purchases pu ON u.id = pu.user_id AND pu.payment_status = 'completed'
              WHERE u.id = ?
            `, [userId], (err, stats) => {
              if (err) {
                return res.status(500).json({ message: 'Database error' });
              }

              res.json({
                user,
                purchases: purchases || [],
                downloads: downloads || [],
                wishlistCount: wishlist.count || 0,
                statistics: {
                  totalDownloads: stats.total_downloads || 0,
                  totalPurchases: stats.total_purchases || 0,
                  totalSpent: stats.total_spent || 0
                }
              });
            });
          });
        });
      });
    });
  } catch (error) {
    console.error('User dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user notifications
router.get('/notifications', authenticateToken, (req, res) => {
  try {
    const userId = req.user.userId;
    const { unread } = req.query;

    let query = 'SELECT * FROM notifications WHERE user_id = ?';
    const params = [userId];

    if (unread === 'true') {
      query += ' AND is_read = 0';
    }

    query += ' ORDER BY created_at DESC LIMIT 50';

    db.all(query, params, (err, notifications) => {
      if (err) {
        return res.status(500).json({ message: 'Error fetching notifications' });
      }

      res.json(notifications);
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark notification as read
router.put('/notifications/:id/read', authenticateToken, (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    db.run('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?', [id, userId], function(err) {
      if (err) {
        return res.status(500).json({ message: 'Error updating notification' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ message: 'Notification not found' });
      }

      res.json({ message: 'Notification marked as read' });
    });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark all notifications as read
router.put('/notifications/read-all', authenticateToken, (req, res) => {
  try {
    const userId = req.user.userId;

    db.run('UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0', [userId], function(err) {
      if (err) {
        return res.status(500).json({ message: 'Error updating notifications' });
      }

      res.json({ message: 'All notifications marked as read', updated: this.changes });
    });
  } catch (error) {
    console.error('Mark all notifications read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

