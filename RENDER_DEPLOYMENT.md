# Render Deployment Guide

## Quick Fix for "Missing script: build" Error

The error occurs because Render tries to run `npm run build` by default, but this is a Node.js backend project that doesn't need a build step.

## Solution 1: Configure Render Dashboard (Recommended)

### Step 1: Create/Configure Web Service (NOT Static Site!)
**IMPORTANT:** Make sure you're creating a **Web Service**, not a Static Site!

1. In Render dashboard, go to **New** → **Web Service**
2. Connect your GitHub repository
3. Select the repository and branch

### Step 2: Configure Service Settings

**Service Type:** Web Service (Node.js)

**Build Command:**
```bash
npm install
```

**Note:** The `postinstall` script will automatically install backend dependencies. If that fails, the build script will handle it.

**Start Command:**
```bash
npm start
```

**Alternative Build Command (if postinstall fails):**
```bash
npm install
npm run build
```

**Note:** Render doesn't allow `&&` in commands, so if you need to run both, use the alternative approach above or configure it as two separate build steps.

**Root Directory:**
Leave empty (or set to `/`)

**Publish Directory:**
⚠️ **MUST BE EMPTY** - Do NOT set this to anything! This field is for static sites only.

**Note:** The root `package.json` now has scripts that handle the backend automatically. The `postinstall` script will install backend dependencies, and `start` will run the backend server.

### Step 3: Set Environment Variables

Add these environment variables in Render dashboard:

**Required:**
- `NODE_ENV` = `production`
- `PORT` = `5050` (or leave empty, Render will assign)
- `JWT_SECRET` = (your secret key)
- `DB_PATH` = `./database.sqlite`

**Optional (but recommended):**
- `STRIPE_SECRET_KEY` = (your Stripe key)
- `GOOGLE_CLIENT_ID` = (your Google OAuth client ID)
- `GOOGLE_CLIENT_SECRET` = (your Google OAuth secret)
- `GOOGLE_REDIRECT_URI` = `https://your-app.onrender.com/api/auth/google/callback`
- `FACEBOOK_APP_ID` = (your Facebook app ID)
- `FACEBOOK_APP_SECRET` = (your Facebook app secret)
- `INSTAGRAM_APP_ID` = (your Instagram app ID)
- `INSTAGRAM_APP_SECRET` = (your Instagram app secret)
- `EMAIL_USER` = (your email)
- `EMAIL_PASS` = (your email app password)
- `FRONTEND_URL` = `https://your-frontend-url.com`

**Important:** Update `GOOGLE_REDIRECT_URI` to use your Render URL instead of localhost!

## Solution 2: Use render.yaml (Alternative)

If you prefer infrastructure as code, use the `render.yaml` file included in the repo.

1. In Render dashboard, go to **Settings**
2. Enable **Infrastructure as Code**
3. Connect your repository
4. Render will automatically use `render.yaml`

## Solution 3: Update Root package.json (Already Done)

I've added a build script to the root `package.json`:
```json
"build": "echo 'No build step required for Node.js backend'"
```

This allows Render to run `npm run build` without errors.

## Important Notes

### 1. Database Persistence
- SQLite files are **ephemeral** on Render free tier
- They get deleted when the service restarts
- **Solution:** Use Render PostgreSQL (free tier available) or external database

### 2. File Uploads
- Uploaded files are also ephemeral
- **Solution:** Use cloud storage (AWS S3, Cloudinary, etc.)

### 3. Port Configuration
- Render assigns a port via `PORT` environment variable
- Your code should use `process.env.PORT || 5050`
- Make sure `backend/server.js` uses `process.env.PORT`

### 4. CORS Configuration
- Update `FRONTEND_URL` and `ALLOWED_ORIGINS` in environment variables
- Should point to your production frontend URL

## Verification Steps

After deployment:

1. **Check Health Endpoint:**
   ```
   https://your-app.onrender.com/api/health
   ```

2. **Test API:**
   ```
   https://your-app.onrender.com/api/store/items
   ```

3. **Check Logs:**
   - Go to Render dashboard > **Logs** tab
   - Look for any errors or warnings

## Common Issues

### Issue 1: "Publish directory npm start does not exist!"
**Fix:** 
- Make sure you created a **Web Service**, not a Static Site
- Go to Settings → **Publish Directory** should be **EMPTY** (not "npm start")
- If it's set to "npm start", clear it completely

### Issue 2: "Cannot find module"
**Fix:** Make sure build command is `npm install` and postinstall script runs automatically

### Issue 2: "Port already in use"
**Fix:** Use `process.env.PORT` in your code, don't hardcode port

### Issue 3: "Database locked"
**Fix:** SQLite on Render free tier can have issues. Consider PostgreSQL.

### Issue 4: "CORS errors"
**Fix:** Update `FRONTEND_URL` and `ALLOWED_ORIGINS` environment variables

## Next Steps

1. ✅ Fix applied: Added build script to root package.json
2. ✅ Created render.yaml for infrastructure as code
3. ⚠️ **You need to:**
   - Configure Render dashboard with correct build/start commands
   - Set all environment variables
   - Update OAuth redirect URIs to use Render URL
   - Consider database migration (PostgreSQL recommended)

## Database Migration (Recommended)

For production, consider migrating from SQLite to PostgreSQL:

1. Create PostgreSQL database in Render
2. Update `DB_PATH` or use a PostgreSQL connection string
3. Update database connection code in `backend/config/db.js`

This is optional but recommended for production stability.

