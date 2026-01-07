const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
const imagesDir = path.join(__dirname, '../uploads/images');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

// Database path from environment or default
const dbPath = process.env.DB_PATH || path.join(__dirname, '../database.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Could not connect to database:', err);
    console.error('Database path:', dbPath);
    process.exit(1);
  } else {
    console.log('Connected to SQLite database at:', dbPath);
  }
  });

// Enable foreign keys and better error handling
db.configure('busyTimeout', 3000);
db.run('PRAGMA foreign_keys = ON');

// Create projects table if not exists (updated for store functionality)
const createProjectsTable = `
CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  file_path TEXT NOT NULL,
  image_path TEXT,
  is_free INTEGER DEFAULT 1,
  price INTEGER DEFAULT 0,
  category TEXT DEFAULT 'template',
  file_type TEXT,
  file_size INTEGER,
  download_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
`;

// Create admin user table if not exists
const createAdminTable = `
CREATE TABLE IF NOT EXISTS admin (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
`;

// Create users table for customer accounts (updated for OAuth support)
const createUsersTable = `
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT,
  email TEXT UNIQUE NOT NULL,
  password TEXT,
  full_name TEXT,
  auth_provider TEXT DEFAULT 'local',
  google_id TEXT UNIQUE,
  facebook_id TEXT UNIQUE,
  instagram_id TEXT UNIQUE,
  profile_picture TEXT,
  is_verified INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_login DATETIME
);
`;

// Create categories table for organizing store items
const createCategoriesTable = `
CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
`;

// Create purchases table for tracking paid downloads
const createPurchasesTable = `
CREATE TABLE IF NOT EXISTS purchases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  project_id INTEGER NOT NULL,
  amount INTEGER NOT NULL,
  payment_status TEXT DEFAULT 'pending',
  stripe_payment_id TEXT,
  stripe_session_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id),
  FOREIGN KEY (project_id) REFERENCES projects (id)
);
`;

// Create downloads table for tracking all downloads
const createDownloadsTable = `
CREATE TABLE IF NOT EXISTS downloads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  project_id INTEGER NOT NULL,
  download_type TEXT DEFAULT 'free',
  ip_address TEXT,
  user_agent TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id),
  FOREIGN KEY (project_id) REFERENCES projects (id)
);
`;

// Create reviews table for customer feedback
const createReviewsTable = `
CREATE TABLE IF NOT EXISTS reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT,
  message TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
  project_id INTEGER,
  user_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects (id),
  FOREIGN KEY (user_id) REFERENCES users (id)
);
`;

// Create wishlist table for user favorites
const createWishlistTable = `
CREATE TABLE IF NOT EXISTS wishlist (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  project_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id),
  FOREIGN KEY (project_id) REFERENCES projects (id),
  UNIQUE(user_id, project_id)
);
`;

// Create newsletter subscriptions table
const createNewsletterTable = `
CREATE TABLE IF NOT EXISTS newsletter (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  is_active INTEGER DEFAULT 1,
  subscribed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  unsubscribed_at DATETIME
);
`;

// Create coupons table for discount system
const createCouponsTable = `
CREATE TABLE IF NOT EXISTS coupons (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  discount_type TEXT DEFAULT 'percentage',
  discount_value INTEGER NOT NULL,
  min_purchase INTEGER DEFAULT 0,
  max_discount INTEGER,
  usage_limit INTEGER,
  used_count INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  valid_from DATETIME,
  valid_until DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
`;

// Create coupon usage tracking table
const createCouponUsageTable = `
CREATE TABLE IF NOT EXISTS coupon_usage (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  coupon_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  purchase_id INTEGER,
  discount_amount INTEGER NOT NULL,
  used_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (coupon_id) REFERENCES coupons (id),
  FOREIGN KEY (user_id) REFERENCES users (id),
  FOREIGN KEY (purchase_id) REFERENCES purchases (id)
);
`;

// Create analytics/statistics table
const createAnalyticsTable = `
CREATE TABLE IF NOT EXISTS analytics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_type TEXT NOT NULL,
  event_data TEXT,
  user_id INTEGER,
  project_id INTEGER,
  ip_address TEXT,
  user_agent TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id),
  FOREIGN KEY (project_id) REFERENCES projects (id)
);
`;

// Create contact messages table
const createContactsTable = `
CREATE TABLE IF NOT EXISTS contacts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  subject TEXT,
  is_read INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
`;

// Create notifications table
const createNotificationsTable = `
CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read INTEGER DEFAULT 0,
  link TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id)
);
`;

// Initialize database tables
db.serialize(() => {
  db.run(createProjectsTable, (err) => {
    if (err) {
      console.error('Error creating projects table:', err);
    } else {
      console.log('Projects table ready');
    }
    });
  
  db.run(createAdminTable, (err) => {
    if (err) {
      console.error('Error creating admin table:', err);
    } else {
      console.log('Admin table ready');
    }
  });

  db.run(createUsersTable, (err) => {
    if (err) {
      console.error('Error creating users table:', err);
    } else {
      console.log('Users table ready');
    }
  });

  db.run(createCategoriesTable, (err) => {
    if (err) {
      console.error('Error creating categories table:', err);
    } else {
      console.log('Categories table ready');
    }
  });

  db.run(createPurchasesTable, (err) => {
    if (err) {
      console.error('Error creating purchases table:', err);
    } else {
      console.log('Purchases table ready');
    }
  });

  db.run(createDownloadsTable, (err) => {
    if (err) {
      console.error('Error creating downloads table:', err);
    } else {
      console.log('Downloads table ready');
    }
  });

  db.run(createReviewsTable, (err) => {
    if (err) {
      console.error('Error creating reviews table:', err);
    } else {
      console.log('Reviews table ready');
    }
  });

  db.run(createWishlistTable, (err) => {
    if (err) {
      console.error('Error creating wishlist table:', err);
    } else {
      console.log('Wishlist table ready');
    }
  });

  db.run(createNewsletterTable, (err) => {
    if (err) {
      console.error('Error creating newsletter table:', err);
    } else {
      console.log('Newsletter table ready');
    }
  });

  db.run(createCouponsTable, (err) => {
    if (err) {
      console.error('Error creating coupons table:', err);
    } else {
      console.log('Coupons table ready');
    }
  });

  db.run(createCouponUsageTable, (err) => {
    if (err) {
      console.error('Error creating coupon_usage table:', err);
    } else {
      console.log('Coupon usage table ready');
    }
  });

  db.run(createAnalyticsTable, (err) => {
    if (err) {
      console.error('Error creating analytics table:', err);
    } else {
      console.log('Analytics table ready');
    }
  });

  db.run(createContactsTable, (err) => {
    if (err) {
      console.error('Error creating contacts table:', err);
    } else {
      console.log('Contacts table ready');
    }
  });

  db.run(createNotificationsTable, (err) => {
    if (err) {
      console.error('Error creating notifications table:', err);
    } else {
      console.log('Notifications table ready');
    }
  });

  // Migrate existing database - add missing columns if they don't exist
  // This runs after all tables are created
  setTimeout(() => {
    db.all("PRAGMA table_info(projects)", (err, columns) => {
    if (!err) {
      const columnNames = columns.map(col => col.name);
      
      // Add category column if it doesn't exist
      if (!columnNames.includes('category')) {
        db.run("ALTER TABLE projects ADD COLUMN category TEXT DEFAULT 'template'", (err) => {
          if (err) {
            console.error('Error adding category column:', err);
          } else {
            console.log('Added category column to projects table');
          }
          });
      }
      
      // Add view_count column if it doesn't exist
      if (!columnNames.includes('view_count')) {
        db.run("ALTER TABLE projects ADD COLUMN view_count INTEGER DEFAULT 0", (err) => {
          if (err) {
            console.error('Error adding view_count column:', err);
          } else {
            console.log('Added view_count column to projects table');
          }
        });
      }
      
      // Add updated_at column if it doesn't exist
      if (!columnNames.includes('updated_at')) {
        db.run("ALTER TABLE projects ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP", (err) => {
          if (err) {
            console.error('Error adding updated_at column:', err);
          } else {
            console.log('Added updated_at column to projects table');
          }
        });
      }
      }
    });
  
    // Migrate users table - add missing columns
    db.all("PRAGMA table_info(users)", (err, columns) => {
    if (!err) {
      const columnNames = columns.map(col => col.name);
      
      // Add facebook_id column if it doesn't exist
      if (!columnNames.includes('facebook_id')) {
        db.run("ALTER TABLE users ADD COLUMN facebook_id TEXT UNIQUE", (err) => {
          if (err) {
            console.error('Error adding facebook_id column:', err);
          } else {
            console.log('Added facebook_id column to users table');
          }
        });
      }
      
      // Add instagram_id column if it doesn't exist
      if (!columnNames.includes('instagram_id')) {
        db.run("ALTER TABLE users ADD COLUMN instagram_id TEXT UNIQUE", (err) => {
          if (err) {
            console.error('Error adding instagram_id column:', err);
          } else {
            console.log('Added instagram_id column to users table');
          }
        });
      }
      
      // Add is_active column if it doesn't exist
      if (!columnNames.includes('is_active')) {
        db.run("ALTER TABLE users ADD COLUMN is_active INTEGER DEFAULT 1", (err) => {
          if (err) {
            console.error('Error adding is_active column:', err);
          } else {
            console.log('Added is_active column to users table');
          }
        });
      }
      
      // Add last_login column if it doesn't exist
      if (!columnNames.includes('last_login')) {
        db.run("ALTER TABLE users ADD COLUMN last_login DATETIME", (err) => {
          if (err) {
            console.error('Error adding last_login column:', err);
          } else {
            console.log('Added last_login column to users table');
          }
        });
      }
        }
    });
  
    // Migrate purchases table - add stripe_session_id if it doesn't exist
    db.all("PRAGMA table_info(purchases)", (err, columns) => {
    if (!err) {
      const columnNames = columns.map(col => col.name);
      
      if (!columnNames.includes('stripe_session_id')) {
        db.run("ALTER TABLE purchases ADD COLUMN stripe_session_id TEXT", (err) => {
          if (err) {
            console.error('Error adding stripe_session_id column:', err);
          } else {
            console.log('Added stripe_session_id column to purchases table');
          }
        });
      }
        }
    });
  }, 1000); // Run migrations 1 second after table creation

  // Insert default categories
  const defaultCategories = [
    { name: 'Video Templates', description: 'Premiere Pro, After Effects, and video editing templates', icon: '🎬' },
    { name: 'Project Files', description: 'Complete project files for various editing software', icon: '📁' },
    { name: 'Fonts', description: 'Typography and font collections', icon: '🔤' },
    { name: 'Effects', description: 'Video effects, transitions, and presets', icon: '✨' },
    { name: 'Graphics', description: 'Logos, overlays, and graphic elements', icon: '🎨' }
  ];

  defaultCategories.forEach(category => {
    db.run('INSERT OR IGNORE INTO categories (name, description, icon) VALUES (?, ?, ?)', 
      [category.name, category.description, category.icon]);
  });

  // Add indexes for better performance (use callbacks to avoid uncaught exceptions if columns missing)
  db.run('CREATE INDEX IF NOT EXISTS idx_projects_category ON projects(category)', (err) => { if (err) console.warn('Index idx_projects_category skipped:', err.message); });
  db.run('CREATE INDEX IF NOT EXISTS idx_projects_created ON projects(created_at)', (err) => { if (err) console.warn('Index idx_projects_created skipped:', err.message); });
  db.run('CREATE INDEX IF NOT EXISTS idx_downloads_user ON downloads(user_id)', (err) => { if (err) console.warn('Index idx_downloads_user skipped:', err.message); });
  db.run('CREATE INDEX IF NOT EXISTS idx_downloads_project ON downloads(project_id)', (err) => { if (err) console.warn('Index idx_downloads_project skipped:', err.message); });
  db.run('CREATE INDEX IF NOT EXISTS idx_purchases_user ON purchases(user_id)', (err) => { if (err) console.warn('Index idx_purchases_user skipped:', err.message); });
  db.run('CREATE INDEX IF NOT EXISTS idx_purchases_project ON purchases(project_id)', (err) => { if (err) console.warn('Index idx_purchases_project skipped:', err.message); });
  db.run('CREATE INDEX IF NOT EXISTS idx_wishlist_user ON wishlist(user_id)', (err) => { if (err) console.warn('Index idx_wishlist_user skipped:', err.message); });
  db.run('CREATE INDEX IF NOT EXISTS idx_analytics_type ON analytics(event_type)', (err) => { if (err) console.warn('Index idx_analytics_type skipped:', err.message); });
  db.run('CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id)', (err) => { if (err) console.warn('Index idx_notifications_user skipped:', err.message); });
});

module.exports = db;
