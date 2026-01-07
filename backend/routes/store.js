const express = require('express');
const path = require('path');
const fs = require('fs');
const db = require('../config/db');
const { authenticateToken } = require('../middleware/auth');
const { validateSearch } = require('../middleware/validator');
const router = express.Router();

// Get all store items with categories and search
router.get('/items', validateSearch, (req, res) => {
  try {
    const { search, category, minPrice, maxPrice, sortBy, isFree } = req.query;
    
    let query = 'SELECT p.*, c.name as category_name, c.icon as category_icon FROM projects p LEFT JOIN categories c ON COALESCE(p.category, \'template\') = c.name WHERE 1=1';
    const params = [];
    
    // Search filter
    if (search) {
      query += ' AND (p.title LIKE ? OR p.description LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }
    
    // Category filter
    if (category && category !== 'all') {
      query += ' AND p.category = ?';
      params.push(category);
    }
    
    // Price filters
    if (minPrice) {
      query += ' AND p.price >= ?';
      params.push(minPrice);
    }
    
    if (maxPrice) {
      query += ' AND p.price <= ?';
      params.push(maxPrice);
    }
    
    // Free/Paid filter
    if (isFree === 'true') {
      query += ' AND p.is_free = 1';
    } else if (isFree === 'false') {
      query += ' AND p.is_free = 0';
    }
    
    // Sorting
    switch (sortBy) {
      case 'price_low':
        query += ' ORDER BY p.price ASC';
        break;
      case 'price_high':
        query += ' ORDER BY p.price DESC';
        break;
      case 'popular':
        query += ' ORDER BY p.download_count DESC';
        break;
      case 'newest':
      default:
        query += ' ORDER BY p.created_at DESC';
        break;
    }

    db.all(query, params, (err, items) => {
      if (err) {
        console.error('Error fetching store items:', err);
        return res.status(500).json({ message: 'Error fetching store items', error: err.message });
      }

      // Transform the data to match expected format
      const transformedItems = items.map(item => ({
        ...item,
        category_name: item.category_name || item.category || 'template',
        category_icon: item.category_icon || '📁'
      }));
      
      res.json(transformedItems);
    });
  } catch (error) {
    console.error('Store items error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get store categories
router.get('/categories', (req, res) => {
  try {
    db.all('SELECT * FROM categories ORDER BY name', (err, categories) => {
      if (err) {
        console.error('Error fetching categories:', err);
        return res.status(500).json({ message: 'Error fetching categories' });
      }

      res.json(categories);
    });
  } catch (error) {
    console.error('Categories error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single store item
router.get('/item/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    db.get(`
      SELECT p.*, c.name as category_name, c.icon as category_icon 
      FROM projects p 
      LEFT JOIN categories c ON p.category = c.name 
      WHERE p.id = ?
    `, [id], (err, item) => {
      if (err) {
        console.error('Error fetching item:', err);
        return res.status(500).json({ message: 'Error fetching item' });
      }

      if (!item) {
        return res.status(404).json({ message: 'Item not found' });
      }

      res.json(item);
    });
  } catch (error) {
    console.error('Store item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Download item (free or paid)
router.post('/download/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const userAgent = req.headers['user-agent'];
    const ipAddress = req.ip || req.connection.remoteAddress;

    // Get item details
    db.get('SELECT * FROM projects WHERE id = ?', [id], (err, item) => {
      if (err) {
        return res.status(500).json({ message: 'Database error' });
      }

      if (!item) {
        return res.status(404).json({ message: 'Item not found' });
      }

      // Check if user has already purchased this item (if it's paid)
      if (!item.is_free) {
        db.get('SELECT * FROM purchases WHERE user_id = ? AND project_id = ? AND payment_status = "completed"', 
          [userId, id], (err, purchase) => {
          if (err) {
            return res.status(500).json({ message: 'Database error' });
          }

          if (!purchase) {
            return res.status(403).json({ 
              message: 'This item requires purchase before download' 
            });
          }

          // Purchase verified, proceed with download
          proceedWithDownload(item, id, userId, ipAddress, userAgent, res);
        });
      } else {
        // Free item, proceed with download
        proceedWithDownload(item, id, userId, ipAddress, userAgent, res);
      }
    });

  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper function to handle file download
function proceedWithDownload(item, id, userId, ipAddress, userAgent, res) {
  // Check if file exists
  // Files are stored in uploads directory, file_path contains just the filename
  const uploadsDir = path.join(__dirname, '../uploads');
  const filePath = path.join(uploadsDir, item.file_path);
  
  // Verify uploads directory exists
  if (!fs.existsSync(uploadsDir)) {
    console.error('Uploads directory not found:', uploadsDir);
    return res.status(500).json({ message: 'Server configuration error. Please contact support.' });
  }
  
  // Check if file exists
  if (!fs.existsSync(filePath)) {
    console.error('File not found at path:', filePath);
    console.error('Item file_path from DB:', item.file_path);
    console.error('Full resolved path:', path.resolve(filePath));
    console.error('Uploads directory:', uploadsDir);
    
    // List files in uploads directory for debugging
    try {
      const files = fs.readdirSync(uploadsDir);
      console.error('Files in uploads directory:', files.slice(0, 10)); // Show first 10 files
    } catch (err) {
      console.error('Error reading uploads directory:', err);
    }
    
    return res.status(404).json({ 
      message: 'File not found. The file may have been moved or deleted. Please contact support.',
      debug: process.env.NODE_ENV === 'development' ? {
        expectedPath: filePath,
        filePathFromDB: item.file_path
      } : undefined
    });
  }

  // Record download
  db.run('INSERT INTO downloads (user_id, project_id, download_type, ip_address, user_agent) VALUES (?, ?, ?, ?, ?)', 
    [userId, id, item.is_free ? 'free' : 'paid', ipAddress, userAgent], function(err) {
    if (err) {
      console.error('Error recording download:', err);
    }
  });

  // Update download count
  db.run('UPDATE projects SET download_count = download_count + 1 WHERE id = ?', [id]);

  // Send file for download
  res.download(filePath, path.basename(item.file_path), (err) => {
    if (err) {
      console.error('Download error:', err);
      if (!res.headersSent) {
        res.status(500).json({ message: 'Error downloading file' });
      }
    }
  });
}

// Purchase item
router.post('/purchase/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const { paymentMethodId, couponCode } = req.body;

    // Get item details
    db.get('SELECT * FROM projects WHERE id = ?', [id], (err, item) => {
      if (err) {
        return res.status(500).json({ message: 'Database error' });
      }

      if (!item) {
        return res.status(404).json({ message: 'Item not found' });
      }

      if (item.is_free) {
        return res.status(400).json({ message: 'This item is free' });
      }

      // Check if already purchased
      db.get('SELECT * FROM purchases WHERE user_id = ? AND project_id = ? AND payment_status = "completed"', 
        [userId, id], (err, existingPurchase) => {
        if (err) {
          return res.status(500).json({ message: 'Database error' });
        }

        if (existingPurchase) {
          return res.status(400).json({ message: 'Item already purchased' });
        }

        // Calculate final price (with coupon if provided)
        let finalPrice = item.price;
        let discountAmount = 0;
        let couponId = null;

        // Helper function to record purchase
        const recordPurchase = () => {
          // Here you would integrate with Stripe for payment processing
          // For now, we'll simulate a successful payment
          
          db.run('INSERT INTO purchases (user_id, project_id, amount, payment_status, stripe_payment_id) VALUES (?, ?, ?, ?, ?)', 
            [userId, id, finalPrice, 'completed', 'simulated_payment_' + Date.now()], function(err) {
            if (err) {
              return res.status(500).json({ message: 'Error recording purchase' });
            }

            const purchaseId = this.lastID;

            // Record coupon usage if coupon was applied
            if (couponId && discountAmount > 0) {
              // Increment used_count in coupons table
              db.run('UPDATE coupons SET used_count = used_count + 1 WHERE id = ?', [couponId], (err) => {
                if (err) {
                  console.error('Error updating coupon used_count:', err);
                }
              });
              
              // Record usage in coupon_usage table
              db.run(
                'INSERT INTO coupon_usage (coupon_id, user_id, purchase_id, discount_amount) VALUES (?, ?, ?, ?)',
                [couponId, userId, purchaseId, discountAmount],
                (err) => {
                  if (err) {
                    console.error('Error recording coupon usage:', err);
                  }
                }
              );
            }

            res.json({ 
              message: 'Purchase successful! You can now download this item.',
              purchaseId: purchaseId,
              originalAmount: item.price,
              discountAmount: discountAmount,
              finalAmount: finalPrice,
              couponApplied: !!couponId
            });
          });
        };

        // Validate and apply coupon if provided
        if (couponCode) {
          db.get('SELECT * FROM coupons WHERE code = ? AND is_active = 1', [couponCode.toUpperCase()], (err, coupon) => {
            if (err) {
              console.error('Error checking coupon:', err);
              // Continue without coupon
              recordPurchase();
              return;
            }

            if (coupon) {
              const now = new Date();
              // Check coupon validity
              if ((!coupon.valid_from || new Date(coupon.valid_from) <= now) &&
                  (!coupon.valid_until || new Date(coupon.valid_until) >= now) &&
                  (!coupon.usage_limit || coupon.used_count < coupon.usage_limit) &&
                  item.price >= coupon.min_purchase) {
                
                // Calculate discount
                if (coupon.discount_type === 'percentage') {
                  discountAmount = Math.round(item.price * coupon.discount_value / 100);
                  if (coupon.max_discount && discountAmount > coupon.max_discount) {
                    discountAmount = coupon.max_discount;
                  }
                } else {
                  discountAmount = coupon.discount_value;
                }
                
                finalPrice = Math.max(0, item.price - discountAmount);
                couponId = coupon.id;
              }
            }
            
            recordPurchase();
          });
        } else {
          recordPurchase();
        }
      });
    });

  } catch (error) {
    console.error('Purchase error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's purchased items
router.get('/my-purchases', authenticateToken, (req, res) => {
  try {
    const userId = req.user.userId;

    db.all(`
      SELECT p.*, pu.amount, pu.payment_status, pu.created_at as purchase_date
      FROM purchases pu
      JOIN projects p ON pu.project_id = p.id
      WHERE pu.user_id = ? AND pu.payment_status = 'completed'
      ORDER BY pu.created_at DESC
    `, [userId], (err, purchases) => {
      if (err) {
        console.error('Error fetching purchases:', err);
        return res.status(500).json({ message: 'Error fetching purchases' });
      }

      res.json(purchases);
    });
  } catch (error) {
    console.error('My purchases error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's download history
router.get('/my-downloads', authenticateToken, (req, res) => {
  try {
    const userId = req.user.userId;

    db.all(`
      SELECT p.*, d.download_type, d.created_at as download_date
      FROM downloads d
      JOIN projects p ON d.project_id = p.id
      WHERE d.user_id = ?
      ORDER BY d.created_at DESC
    `, [userId], (err, downloads) => {
      if (err) {
        console.error('Error fetching downloads:', err);
        return res.status(500).json({ message: 'Error fetching downloads' });
      }

      res.json(downloads);
    });
  } catch (error) {
    console.error('My downloads error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
