# How to Start Your Project

## ✅ Best Method: Use Backend to Serve Everything

The backend server can now serve both the API and the static website files!

### Step 1: Install Dependencies
```batch
cd D:\video-editing-store
install-dependencies.bat
```

### Step 2: Start Backend (Serves API + Website)
```batch
cd D:\video-editing-store\backend
npm start
```

The backend will serve:
- ✅ API: http://localhost:5050/api/*
- ✅ Website: http://localhost:5050 (index.html)
- ✅ Store: http://localhost:5050/store.html

### Step 3: Start Admin Dashboard (Optional)
```batch
cd D:\video-editing-store\admin-dashboard
npm start
```

## 🎯 Quick Start (All Services)

```batch
cd D:\video-editing-store
start-all-services.bat
```

## 🔧 Alternative: Separate Web Server

If you want to use a separate web server for the frontend:

### Option 1: Use Java static server (Full Path)
```batch
javac tools\StaticFileServer.java
java -cp tools StaticFileServer 3000
```

If you prefer Node, you can also use `http-server`:
```batch
npx http-server -p 3000
```

### Option 2: Install http-server
```batch
cd D:\video-editing-store
npm install
npm run serve
```

### Option 3: Use the standalone script
```batch
start-website.bat
```

## 📋 Recommended Setup

**For Development:**
1. Backend on port 5050 (serves API + website)
2. Admin Dashboard on port 3001

**Access:**
- Main Website: http://localhost:5050
- Store: http://localhost:5050/store.html
- Admin Dashboard: http://localhost:3001
- API: http://localhost:5050/api/health

This way you only need to run 2 services instead of 3!

