const express = require('express');
const Wishlist = require('../models/Wishlist');
const Project = require('../models/Project');
const Category = require('../models/Category');
const router = express.Router();

const { authenticateToken } = require('../middleware/auth');

// Get user's wishlist
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const wishlistItems = await Wishlist.find({ user_id: userId })
      .populate({
        path: 'project_id',
        populate: {
          path: 'category',
          model: 'Category',
          select: 'name icon'
        }
      })
      .sort({ createdAt: -1 })
      .lean();

    // Get categories for enrichment
    const categories = await Category.find().lean();
    const categoryMap = {};
    categories.forEach(cat => {
      categoryMap[cat.name] = cat;
    });

    const items = wishlistItems.map(item => {
      const project = item.project_id;
      return {
        ...project,
        id: project._id.toString(),
        wishlist_id: item._id.toString(),
        added_at: item.createdAt,
        category_name: categoryMap[project.category]?.name || project.category || 'template',
        category_icon: categoryMap[project.category]?.icon || '📁',
        created_at: project.createdAt,
        updated_at: project.updatedAt
      };
    });

    res.json(items);
  } catch (error) {
    console.error('Wishlist error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add item to wishlist
router.post('/add/:projectId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { projectId } = req.params;

    // Check if project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if already in wishlist
    const existing = await Wishlist.findOne({ 
      user_id: userId, 
      project_id: projectId 
    });

    if (existing) {
      return res.status(400).json({ message: 'Item already in wishlist' });
    }

    // Add to wishlist
    const wishlistItem = await Wishlist.create({
      user_id: userId,
      project_id: projectId
    });

    res.json({ 
      message: 'Item added to wishlist', 
      wishlistId: wishlistItem._id.toString() 
    });
  } catch (error) {
    console.error('Add to wishlist error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Item already in wishlist' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove item from wishlist
router.delete('/remove/:projectId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { projectId } = req.params;

    const result = await Wishlist.findOneAndDelete({ 
      user_id: userId, 
      project_id: projectId 
    });

    if (!result) {
      return res.status(404).json({ message: 'Item not found in wishlist' });
    }

    res.json({ message: 'Item removed from wishlist' });
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Check if item is in wishlist
router.get('/check/:projectId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { projectId } = req.params;

    const item = await Wishlist.findOne({ 
      user_id: userId, 
      project_id: projectId 
    });

    res.json({ inWishlist: !!item });
  } catch (error) {
    console.error('Check wishlist error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
