const express = require('express');
const path = require('path');
const fs = require('fs');
const { query } = require('../config/postgres');
const Project = require('../models-pg/Project');
const Category = require('../models-pg/Category');
const { authenticateToken } = require('../middleware/auth');
const { validateSearch } = require('../middleware/validator');
const router = express.Router();

router.get('/items', validateSearch, async (req, res) => {
  try {
    const { search, category, minPrice, maxPrice, sortBy, isFree } = req.query;
    
    let sql = 'SELECT * FROM projects WHERE 1=1';
    const values = [];
    
    if (search) {
      values.push(`%${search}%`);
      sql += ` AND (title ILIKE $${values.length} OR description ILIKE $${values.length})`;
    }
    
    if (category && category !== 'all') {
      values.push(category);
      sql += ` AND category = $${values.length}`;
    }
    
    if (minPrice) {
      values.push(parseInt(minPrice));
      sql += ` AND price >= $${values.length}`;
    }
    
    if (maxPrice) {
      values.push(parseInt(maxPrice));
      sql += ` AND price <= $${values.length}`;
    }
    
    if (isFree === 'true') {
      sql += ' AND is_free = true';
    } else if (isFree === 'false') {
      sql += ' AND is_free = false';
    }
    
    switch (sortBy) {
      case 'price_low':
        sql += ' ORDER BY price ASC';
        break;
      case 'price_high':
        sql += ' ORDER BY price DESC';
        break;
      case 'popular':
        sql += ' ORDER BY download_count DESC';
        break;
      case 'newest':
      default:
        sql += ' ORDER BY created_at DESC';
        break;
    }
    
    const result = await query(sql, values);
    const categories = await Category.find();
    const categoryMap = {};
    categories.forEach(cat => {
      categoryMap[cat.name] = cat;
    });

    const transformedItems = result.rows.map(item => ({
      ...item,
      id: item.id.toString(),
      _id: item.id.toString(),
      category_name: categoryMap[item.category]?.name || item.category || 'template',
      category_icon: categoryMap[item.category]?.icon || '📁'
    }));
    
    res.json(transformedItems);
  } catch (error) {
    console.error('Store items error:', error);
    res.json([]);
  }
});

router.get('/categories', async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories.map(cat => ({
      ...cat,
      id: cat.id.toString()
    })));
  } catch (error) {
    console.error('Categories error:', error);
    res.json([
      { id: '1', name: 'Video Templates', icon: '🎬' },
      { id: '2', name: 'Project Files', icon: '📁' },
      { id: '3', name: 'Fonts', icon: '🔤' },
      { id: '4', name: 'Effects', icon: '✨' },
      { id: '5', name: 'Graphics', icon: '🎨' }
    ]);
  }
});

router.get('/categories-placeholder', async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories.map(cat => ({
      ...cat,
      id: cat.id.toString()
    })));
  } catch (error) {
    console.error('Categories error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/item/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Project.findById(id);
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    const category = await Category.findOne({ name: item.category });
    
    const response = {
      ...item,
      id: item.id.toString(),
      _id: item.id.toString(),
      category_name: category?.name || item.category || 'template',
      category_icon: category?.icon || '📁'
    };

    res.json(response);
  } catch (error) {
    console.error('Store item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/download/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const item = await Project.findById(id);
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    if (!item.is_free) {
      const purchaseResult = await query(
        'SELECT * FROM purchases WHERE user_id = $1 AND project_id = $2 AND payment_status = $3',
        [userId, id, 'completed']
      );

      if (purchaseResult.rows.length === 0) {
        return res.status(403).json({ message: 'This item requires purchase before download' });
      }
    }

    const uploadsDir = path.join(__dirname, '../uploads');
    const filePath = path.join(uploadsDir, item.file_path);
    
    if (!fs.existsSync(filePath)) {
      console.error('File not found at path:', filePath);
      return res.status(404).json({ message: 'File not found. Please contact support.' });
    }

    await Project.incrementDownload(id);

    res.download(filePath, path.basename(item.file_path), (err) => {
      if (err) {
        console.error('Download error:', err);
        if (!res.headersSent) {
          res.status(500).json({ message: 'Error downloading file' });
        }
      }
    });

  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/purchase/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const item = await Project.findById(id);
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    if (item.is_free) {
      return res.status(400).json({ message: 'This item is free' });
    }

    const existingPurchase = await query(
      'SELECT * FROM purchases WHERE user_id = $1 AND project_id = $2 AND payment_status = $3',
      [userId, id, 'completed']
    );

    if (existingPurchase.rows.length > 0) {
      return res.status(400).json({ message: 'Item already purchased' });
    }

    const result = await query(
      'INSERT INTO purchases (user_id, project_id, amount, payment_status, stripe_payment_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [userId, id, item.price, 'completed', 'simulated_payment_' + Date.now()]
    );

    res.json({ 
      message: 'Purchase successful! You can now download this item.',
      purchaseId: result.rows[0].id.toString(),
      originalAmount: item.price,
      discountAmount: 0,
      finalAmount: item.price,
      couponApplied: false
    });

  } catch (error) {
    console.error('Purchase error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/my-purchases', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await query(
      `SELECT p.*, pr.title, pr.description, pr.file_path, pr.image_path, pr.is_free, pr.price, pr.category
       FROM purchases p
       LEFT JOIN projects pr ON p.project_id = pr.id
       WHERE p.user_id = $1 AND p.payment_status = $2
       ORDER BY p.created_at DESC`,
      [userId, 'completed']
    );

    const purchases = result.rows.map(row => ({
      id: row.project_id?.toString(),
      title: row.title,
      description: row.description,
      file_path: row.file_path,
      image_path: row.image_path,
      is_free: row.is_free,
      price: row.price,
      category: row.category,
      amount: row.amount,
      payment_status: row.payment_status,
      purchase_date: row.created_at
    }));

    res.json(purchases);
  } catch (error) {
    console.error('My purchases error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/my-downloads', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    res.json([]);
  } catch (error) {
    console.error('My downloads error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
