const express = require('express');
const db = require('../config/db');
const router = express.Router();

const { authenticateToken } = require('../middleware/auth');

// Get user's wishlist
router.get('/', authenticateToken, (req, res) => {
  try {
    const userId = req.user.userId;

    db.all(`
      SELECT 
        w.id as wishlist_id,
        w.created_at as added_at,
        p.*,
        c.name as category_name,
        c.icon as category_icon
      FROM wishlist w
      JOIN projects p ON w.project_id = p.id
      LEFT JOIN categories c ON p.category = c.name
      WHERE w.user_id = ?
      ORDER BY w.created_at DESC
    `, [userId], (err, items) => {
      if (err) {
        console.error('Error fetching wishlist:', err);
        return res.status(500).json({ message: 'Error fetching wishlist' });
      }

      res.json(items);
    });
  } catch (error) {
    console.error('Wishlist error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add item to wishlist
router.post('/add/:projectId', authenticateToken, (req, res) => {
  try {
    const userId = req.user.userId;
    const { projectId } = req.params;

    // Check if project exists
    db.get('SELECT id FROM projects WHERE id = ?', [projectId], (err, project) => {
      if (err) {
        return res.status(500).json({ message: 'Database error' });
      }

      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }

      // Check if already in wishlist
      db.get('SELECT id FROM wishlist WHERE user_id = ? AND project_id = ?', [userId, projectId], (err, existing) => {
        if (err) {
          return res.status(500).json({ message: 'Database error' });
        }

        if (existing) {
          return res.status(400).json({ message: 'Item already in wishlist' });
        }

        // Add to wishlist
        db.run('INSERT INTO wishlist (user_id, project_id) VALUES (?, ?)', [userId, projectId], function(err) {
          if (err) {
            return res.status(500).json({ message: 'Error adding to wishlist' });
          }

          res.json({ message: 'Item added to wishlist', wishlistId: this.lastID });
        });
      });
    });
  } catch (error) {
    console.error('Add to wishlist error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove item from wishlist
router.delete('/remove/:projectId', authenticateToken, (req, res) => {
  try {
    const userId = req.user.userId;
    const { projectId } = req.params;

    db.run('DELETE FROM wishlist WHERE user_id = ? AND project_id = ?', [userId, projectId], function(err) {
      if (err) {
        return res.status(500).json({ message: 'Error removing from wishlist' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ message: 'Item not found in wishlist' });
      }

      res.json({ message: 'Item removed from wishlist' });
    });
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Check if item is in wishlist
router.get('/check/:projectId', authenticateToken, (req, res) => {
  try {
    const userId = req.user.userId;
    const { projectId } = req.params;

    db.get('SELECT id FROM wishlist WHERE user_id = ? AND project_id = ?', [userId, projectId], (err, item) => {
      if (err) {
        return res.status(500).json({ message: 'Database error' });
      }

      res.json({ inWishlist: !!item });
    });
  } catch (error) {
    console.error('Check wishlist error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

