const express = require('express');
const User = require('../models/User');
const Purchase = require('../models/Purchase');
const Download = require('../models/Download');
const Wishlist = require('../models/Wishlist');
const Notification = require('../models/Notification');
const router = express.Router();

const { authenticateToken } = require('../middleware/auth');

// Get user dashboard data
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get user info
    const user = await User.findById(userId)
      .select('username email full_name createdAt')
      .lean();

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get purchase history
    const purchases = await Purchase.find({
      user_id: userId,
      payment_status: 'completed'
    })
    .populate('project_id', 'title image_path file_path')
    .sort({ createdAt: -1 })
    .lean();

    // Get download history
    const downloads = await Download.find({ user_id: userId })
      .populate('project_id', 'title image_path file_path is_free')
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    // Get wishlist count
    const wishlistCount = await Wishlist.countDocuments({ user_id: userId });

    // Get statistics
    const totalDownloads = await Download.countDocuments({ user_id: userId });
    const totalPurchases = await Purchase.countDocuments({
      user_id: userId,
      payment_status: 'completed'
    });
    const totalSpentResult = await Purchase.aggregate([
      { $match: { user_id: userId, payment_status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalSpent = totalSpentResult.length > 0 ? totalSpentResult[0].total : 0;

    res.json({
      user: {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        created_at: user.createdAt
      },
      purchases: purchases.map(p => ({
        ...p.project_id,
        id: p.project_id._id.toString(),
        amount: p.amount,
        payment_status: p.payment_status,
        created_at: p.createdAt
      })),
      downloads: downloads.map(d => ({
        ...d.project_id,
        id: d.project_id._id.toString(),
        download_type: d.download_type,
        created_at: d.createdAt
      })),
      wishlistCount,
      statistics: {
        totalDownloads,
        totalPurchases,
        totalSpent
      }
    });
  } catch (error) {
    console.error('User dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user notifications
router.get('/notifications', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { unread } = req.query;

    const query = { user_id: userId };
    if (unread === 'true') {
      query.is_read = false;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    res.json(notifications.map(n => ({
      ...n,
      id: n._id.toString()
    })));
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark notification as read
router.put('/notifications/:id/read', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, user_id: userId },
      { is_read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark all notifications as read
router.put('/notifications/read-all', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await Notification.updateMany(
      { user_id: userId, is_read: false },
      { is_read: true }
    );

    res.json({ 
      message: 'All notifications marked as read', 
      updated: result.modifiedCount 
    });
  } catch (error) {
    console.error('Mark all notifications read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
