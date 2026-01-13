# MongoDB Migration Guide

## ✅ Migration Complete!

Your application has been successfully migrated from SQLite to MongoDB. All routes, models, and database operations now use MongoDB with Mongoose.

## 🔧 Environment Variables

### Required MongoDB Connection

Add this to your `.env` or environment configuration:

```bash
# MongoDB Connection (choose one)
MONGODB_URI=mongodb://localhost:27017/video-editing-store
# OR for MongoDB Atlas (cloud)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/video-editing-store
# OR use MONGO_URI (alternative name)
MONGO_URI=mongodb://localhost:27017/video-editing-store
```

### Local MongoDB Setup

1. **Install MongoDB:**
   - Windows: Download from https://www.mongodb.com/try/download/community
   - macOS: `brew install mongodb-community`
   - Linux: `sudo apt-get install mongodb`

2. **Start MongoDB:**
   ```bash
   # Windows
   net start MongoDB
   
   # macOS/Linux
   mongod
   ```

3. **Verify connection:**
   - Default: `mongodb://localhost:27017`
   - Database name: `video-editing-store`

### MongoDB Atlas (Cloud) Setup

1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Get connection string
4. Set `MONGODB_URI` in environment variables

## 📦 Dependencies

The following dependency has been added:
- `mongoose` (^8.0.3) - MongoDB ODM

## 🗂️ Database Structure

All collections are automatically created when first used:

- **users** - User accounts (local and OAuth)
- **projects** - Store items/products
- **categories** - Product categories
- **purchases** - Purchase records
- **downloads** - Download history
- **reviews** - Customer reviews
- **wishlist** - User wishlists
- **coupons** - Discount coupons
- **coupon_usage** - Coupon usage tracking
- **newsletter** - Newsletter subscriptions
- **analytics** - Analytics events
- **contacts** - Contact messages
- **notifications** - User notifications
- **admin** - Admin accounts

## 🔄 Changes from SQLite

### ID Format
- SQLite used integer IDs (`id: 1, 2, 3...`)
- MongoDB uses ObjectIds (`_id: ObjectId("...")`)
- All routes now return `id` as string representation of `_id`

### Queries
- SQL queries replaced with Mongoose methods
- `db.get()` → `Model.findOne()`
- `db.all()` → `Model.find()`
- `db.run()` → `Model.create()` / `Model.updateOne()` / `Model.deleteOne()`

### Relationships
- Foreign keys replaced with ObjectId references
- Use `.populate()` for joins

## 🚀 First Run

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Set environment variables:**
   ```bash
   # Copy example file
   cp env.example env.development
   
   # Add MONGODB_URI
   MONGODB_URI=mongodb://localhost:27017/video-editing-store
   ```

3. **Start server:**
   ```bash
   npm start
   ```

4. **Seed default categories:**
   ```bash
   node scripts/seed-categories.js
   ```

## ✅ OAuth Support

All OAuth providers (Google, Facebook, Instagram) work with MongoDB:
- User accounts are stored in `users` collection
- OAuth IDs stored in `google_id`, `facebook_id`, `instagram_id` fields
- Automatic user creation on first OAuth login

## 🔍 Verification

Check health endpoint:
```bash
curl http://localhost:5050/api/health
```

Should return:
```json
{
  "status": "Backend is running!",
  "database": "connected",
  "databaseType": "MongoDB"
}
```

## 📝 Notes

- **No data migration needed** - This is a fresh start
- **File uploads** - Still stored in `backend/uploads/` directory
- **Indexes** - Automatically created by Mongoose models
- **Timestamps** - `createdAt` and `updatedAt` automatically managed

## 🆘 Troubleshooting

### Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:** Start MongoDB service

### Authentication Error
```
Error: Authentication failed
```
**Solution:** Check MongoDB credentials in connection string

### Database Not Found
MongoDB creates databases automatically on first write. No manual creation needed.

## 📚 Resources

- [MongoDB Documentation](https://docs.mongodb.com/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

