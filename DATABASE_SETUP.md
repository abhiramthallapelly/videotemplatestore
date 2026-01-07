# Database Setup Guide

This guide explains how to set up and manage the database for the Video Editing Store.

## 🗄️ Database Overview

The application uses **SQLite** as the database, which is a lightweight, file-based database perfect for small to medium applications.

### Database Location

- **Development**: `backend/database.sqlite`
- **Production**: Configured via `DB_PATH` environment variable

## 📋 Database Tables

### Core Tables

1. **projects** - Store items (templates, files, etc.)
2. **users** - User accounts
3. **admin** - Admin accounts
4. **categories** - Product categories
5. **purchases** - Purchase records
6. **downloads** - Download history
7. **reviews** - Customer reviews

### New Tables (Added in Latest Update)

8. **wishlist** - User favorite items
9. **newsletter** - Email subscriptions
10. **coupons** - Discount codes
11. **coupon_usage** - Coupon usage tracking
12. **analytics** - Event tracking and statistics
13. **contacts** - Contact form submissions
14. **notifications** - User notifications

## 🚀 Automatic Setup

The database is **automatically initialized** when you start the server. All tables are created automatically if they don't exist.

### First Time Setup

1. **Start the server:**
   ```bash
   cd backend
   npm start
   ```

2. The server will:
   - Create the database file if it doesn't exist
   - Create all required tables
   - Insert default categories
   - Create necessary indexes

3. You should see console output like:
   ```
   Connected to SQLite database at: ./database.sqlite
   Projects table ready
   Admin table ready
   Users table ready
   ...
   ```

## 🔧 Manual Setup (Optional)

If you want to manually set up the database:

```bash
node backend/scripts/setup-database.js
```

## 📊 Database Schema Details

### Projects Table

```sql
CREATE TABLE projects (
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
```

### Users Table

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT,
  email TEXT UNIQUE NOT NULL,
  password TEXT,
  full_name TEXT,
  auth_provider TEXT DEFAULT 'local',
  google_id TEXT UNIQUE,
  profile_picture TEXT,
  is_verified INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_login DATETIME
);
```

### Wishlist Table

```sql
CREATE TABLE wishlist (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  project_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id),
  FOREIGN KEY (project_id) REFERENCES projects (id),
  UNIQUE(user_id, project_id)
);
```

### Coupons Table

```sql
CREATE TABLE coupons (
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
```

## 🔍 Database Indexes

The following indexes are automatically created for better performance:

- `idx_projects_category` - On projects.category
- `idx_projects_created` - On projects.created_at
- `idx_downloads_user` - On downloads.user_id
- `idx_downloads_project` - On downloads.project_id
- `idx_purchases_user` - On purchases.user_id
- `idx_purchases_project` - On purchases.project_id
- `idx_wishlist_user` - On wishlist.user_id
- `idx_analytics_type` - On analytics.event_type
- `idx_notifications_user` - On notifications.user_id

## 🛠️ Database Management

### View Database

You can use SQLite command-line tools or GUI tools like:
- **DB Browser for SQLite** (https://sqlitebrowser.org/)
- **SQLiteStudio** (https://sqlitestudio.pl/)

### Backup Database

```bash
# Copy the database file
cp backend/database.sqlite backend/database.sqlite.backup
```

### Reset Database

⚠️ **Warning**: This will delete all data!

```bash
# Delete the database file
rm backend/database.sqlite

# Restart the server to recreate it
npm start
```

### Export Data

```bash
# Using sqlite3 command-line tool
sqlite3 backend/database.sqlite .dump > database_backup.sql
```

### Import Data

```bash
# Using sqlite3 command-line tool
sqlite3 backend/database.sqlite < database_backup.sql
```

## 🔐 Default Categories

The following categories are automatically created:

1. **Video Templates** 🎬 - Premiere Pro, After Effects templates
2. **Project Files** 📁 - Complete project files
3. **Fonts** 🔤 - Typography collections
4. **Effects** ✨ - Video effects and presets
5. **Graphics** 🎨 - Logos, overlays, graphics

## 📝 Environment Variables

Configure database path in environment file:

```env
# Database path (relative to backend directory)
DB_PATH=./database.sqlite

# For production, use absolute path
# DB_PATH=/var/www/database.sqlite
```

## 🐛 Troubleshooting

### Database Locked Error

If you see "database is locked" errors:

1. Make sure only one instance of the server is running
2. Check for other processes accessing the database
3. Restart the server

### Permission Errors

If you see permission errors:

1. Check file permissions on the database file
2. Ensure the directory is writable
3. On Linux/Mac: `chmod 664 backend/database.sqlite`

### Database Not Found

If the database file is not found:

1. Check the `DB_PATH` environment variable
2. Ensure the directory exists
3. The database will be created automatically on first run

## 📚 Additional Resources

- [SQLite Documentation](https://www.sqlite.org/docs.html)
- [Node.js sqlite3 Package](https://github.com/mapbox/node-sqlite3)
- [MODULES_DOCUMENTATION.md](./MODULES_DOCUMENTATION.md) - API documentation

## ✅ Verification

To verify your database is set up correctly:

1. Start the server
2. Check console for "table ready" messages
3. Visit `http://localhost:5050/api/health`
4. Try accessing store items: `http://localhost:5050/api/store/items`

If everything works, your database is properly configured! 🎉

