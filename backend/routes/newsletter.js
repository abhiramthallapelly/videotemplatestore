const express = require('express');
const db = require('../config/db');
const router = express.Router();

// Subscribe to newsletter
router.post('/subscribe', (req, res) => {
  try {
    const { email, name } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email address' });
    }

    // Check if already subscribed
    db.get('SELECT id, is_active FROM newsletter WHERE email = ?', [email], (err, existing) => {
      if (err) {
        return res.status(500).json({ message: 'Database error' });
      }

      if (existing) {
        if (existing.is_active) {
          return res.status(400).json({ message: 'Email already subscribed' });
        } else {
          // Reactivate subscription
          db.run('UPDATE newsletter SET is_active = 1, unsubscribed_at = NULL WHERE id = ?', [existing.id], function(err) {
            if (err) {
              return res.status(500).json({ message: 'Error reactivating subscription' });
            }
            res.json({ message: 'Successfully resubscribed to newsletter!' });
          });
        }
      } else {
        // New subscription
        db.run('INSERT INTO newsletter (email, name) VALUES (?, ?)', [email, name || null], function(err) {
          if (err) {
            return res.status(500).json({ message: 'Error subscribing to newsletter' });
          }
          res.json({ message: 'Successfully subscribed to newsletter!' });
        });
      }
    });
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Unsubscribe from newsletter
router.post('/unsubscribe', (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    db.run('UPDATE newsletter SET is_active = 0, unsubscribed_at = CURRENT_TIMESTAMP WHERE email = ?', [email], function(err) {
      if (err) {
        return res.status(500).json({ message: 'Error unsubscribing' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ message: 'Email not found in newsletter list' });
      }

      res.json({ message: 'Successfully unsubscribed from newsletter' });
    });
  } catch (error) {
    console.error('Newsletter unsubscribe error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all subscribers (admin only)
router.get('/subscribers', (req, res) => {
  try {
    // In production, add admin authentication here
    const { active } = req.query;

    let query = 'SELECT * FROM newsletter';
    const params = [];

    if (active === 'true') {
      query += ' WHERE is_active = 1';
    } else if (active === 'false') {
      query += ' WHERE is_active = 0';
    }

    query += ' ORDER BY subscribed_at DESC';

    db.all(query, params, (err, subscribers) => {
      if (err) {
        return res.status(500).json({ message: 'Error fetching subscribers' });
      }

      res.json(subscribers);
    });
  } catch (error) {
    console.error('Get subscribers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

