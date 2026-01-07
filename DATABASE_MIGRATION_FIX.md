# Database Migration Fix

## Issue
The server was showing an error:
```
[Error: SQLITE_ERROR: no such column: category
```

This happened because the existing database was created before the `category` column was added to the schema.

## Solution
I've added automatic database migration code that will:
1. Check if the `category` column exists in the `projects` table
2. Add it if it's missing (with default value 'template')
3. Also add other missing columns:
   - `view_count` to projects table
   - `updated_at` to projects table
   - `facebook_id` to users table
   - `instagram_id` to users table
   - `is_active` to users table
   - `last_login` to users table
   - `stripe_session_id` to purchases table

## How to Apply the Fix

### Step 1: Restart the Server
Stop the current server (Ctrl+C) and restart it:

```bash
cd backend
npm start
```

### Step 2: Check the Console
You should see messages like:
```
Projects table ready
Added category column to projects table
Added view_count column to projects table
...
```

### Step 3: Verify
The error should be gone. The server will now work correctly with the updated database schema.

## What Happens
- On server start, the migration code automatically checks for missing columns
- Missing columns are added automatically
- Existing data is preserved
- Default values are applied to new columns

## If Migration Fails
If you still see errors:
1. **Option 1**: Delete the database and let it recreate (⚠️ This deletes all data)
   ```bash
   # Stop the server first
   del backend\database.sqlite
   # Restart the server
   ```

2. **Option 2**: Manually add the column using SQLite
   ```bash
   sqlite3 backend\database.sqlite
   ALTER TABLE projects ADD COLUMN category TEXT DEFAULT 'template';
   .quit
   ```

## Verification
After restarting, test the API:
- http://localhost:5050/api/health
- http://localhost:5050/api/store/items

Both should work without errors now!

