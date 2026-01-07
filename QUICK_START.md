# Quick Start Guide - Fix All Errors

## ✅ What I Fixed

1. ✅ Created `admin-dashboard/src/index.js` - React entry point
2. ✅ Created `admin-dashboard/src/App.js` - Main app component  
3. ✅ Created `admin-dashboard/src/App.css` - Styles
4. ✅ Created `admin-dashboard/src/index.css` - Base styles
5. ✅ Created `admin-dashboard/public/index.html` - HTML template

## 🚀 How to Start Everything

### Step 1: Install Dependencies (IMPORTANT!)

Open a terminal where npm works and run:

```batch
cd D:\video-editing-store
install-dependencies.bat
```

**OR manually:**

**Backend:**
```batch
cd D:\video-editing-store\backend
npm install
```

**Admin Dashboard:**
```batch
cd D:\video-editing-store\admin-dashboard
npm install
```

### Step 2: Start Backend Server (MUST BE FIRST!)

**Terminal 1:**
```batch
cd D:\video-editing-store\backend
npm start
```
Wait until you see: `Server running on port 5050`

### Step 3: Start Admin Dashboard
```

Wait until you see: `Compiled successfully!` and the browser opens.

```batch
cd D:\video-editing-store

## 📋 Verification Checklist
- [ ] Admin Dashboard running on http://localhost:3001
- [ ] Public Website running on http://localhost:3000
- [ ] No 404 errors in browser console

- Check if port 5050 is already in use
 - [ ] Backend running on http://localhost:5050
 - [ ] Test: http://localhost:5050/api/health (should return JSON)
 - Check if port 5050 is already in use
 - Verify backend is accessible at http://localhost:5050/api/health
 - ✅ Backend: http://localhost:5050/api/health returns `{"status":"Backend is running!"}`
- Make sure backend is running first

### Still getting 404 errors?
- **Backend must be running first!** The frontend needs the backend to work.
- Check browser console for CORS errors
Verify backend is accessible at http://localhost:5050/api/health

## 🎯 Expected Result

Once everything is running:
- ✅ Backend: http://localhost:5050/api/health returns `{"status":"Backend is running!"}`
- ✅ Admin Dashboard: http://localhost:3001 shows login page
- ✅ Public Website: http://localhost:3000 shows the main page
- ✅ Login/Signup forms work without 404 errors

