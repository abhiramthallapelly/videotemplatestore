# Render Deployment Checklist

## ✅ Before Deploying

### 1. Commit and Push All Changes
```bash
git add package.json install-backend.js build.js render-build.sh render.yaml
git commit -m "Fix Render deployment configuration"
git push origin main
```

### 2. Verify package.json is Updated
Check that `package.json` has:
```json
"start": "node backend/server.js"
```
NOT:
```json
"start": "cd backend && npm start"
```

### 3. Verify Files Exist
- ✅ `package.json` (with correct start script)
- ✅ `install-backend.js`
- ✅ `build.js`
- ✅ `render.yaml` (optional, if using Infrastructure as Code)

## 🔧 Render Configuration

### Build Command Options

**Option 1: Use Build Script (Recommended)**
```
npm run build
```

**Option 2: Explicit Install**
```
npm install
npm install --prefix backend
```
*(Note: Render UI might not allow &&, but render.yaml can use it)*

**Option 3: Shell Script**
```
chmod +x render-build.sh && ./render-build.sh
```

### Start Command
```
npm start
```

### Publish Directory
⚠️ **MUST BE EMPTY** (leave blank)

## 📋 Environment Variables

Set these in Render dashboard:

**Required:**
- `NODE_ENV` = `production`
- `PORT` = (leave empty, Render assigns automatically)
- `JWT_SECRET` = (your secret)
- `DB_PATH` = `./database.sqlite`

**OAuth (if using):**
- `GOOGLE_CLIENT_ID` = (your client ID)
- `GOOGLE_CLIENT_SECRET` = (your secret)
- `GOOGLE_REDIRECT_URI` = `https://your-app.onrender.com/api/auth/google/callback`

**Other:**
- `STRIPE_SECRET_KEY` = (if using Stripe)
- `EMAIL_USER` = (if using email)
- `EMAIL_PASS` = (if using email)
- `FRONTEND_URL` = (your frontend URL)

## 🔍 Verification

After deployment, check:

1. **Build Logs** - Should see:
   ```
   📦 Installing backend dependencies...
   ✅ Backend dependencies installed successfully
   ```

2. **Health Check**:
   ```
   https://your-app.onrender.com/api/health
   ```

3. **API Test**:
   ```
   https://your-app.onrender.com/api/store/items
   ```

## ❌ Common Errors

### "Cannot find module 'dotenv'"
- Backend dependencies not installed
- Fix: Use `npm run build` in build command or `npm install --prefix backend`

### "Publish directory npm start does not exist"
- Service configured as Static Site
- Fix: Create Web Service, clear Publish Directory

### "cd backend && npm start" error
- Old package.json on GitHub
- Fix: Push updated package.json with correct start script

## 🚀 Quick Deploy Steps

1. ✅ Push all changes to GitHub
2. ✅ Go to Render dashboard
3. ✅ Update Build Command: `npm run build`
4. ✅ Verify Start Command: `npm start`
5. ✅ Clear Publish Directory (if set)
6. ✅ Set environment variables
7. ✅ Deploy!

