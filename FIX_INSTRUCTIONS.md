# Fix Instructions for Current Errors

## Error 1: Backend - Missing dotenv Module

**Problem:** Backend server can't start because `dotenv` module is not installed.

**Solution:**
1. Open a terminal/command prompt
2. Navigate to the backend folder:
   ```batch
   cd D:\video-editing-store\backend
   ```
3. Install dependencies:
   ```batch
   npm install
   ```
4. Wait for installation to complete
5. Start the backend server:
   ```batch
   npm start
   ```

## Error 2: Admin Dashboard - Missing index.html

**Problem:** Admin dashboard can't start because `public/index.html` is missing.

**Solution:** ✅ **FIXED** - I've created the missing `public/index.html` file.

Now you need to:
1. Navigate to admin-dashboard folder:
   ```batch
   cd D:\video-editing-store\admin-dashboard
   ```
2. Make sure dependencies are installed:
   ```batch
   npm install
   ```
3. Start the admin dashboard:
   ```batch
   npm start
   ```

## Error 3: Frontend - 404 Errors for API Calls

**Problem:** Frontend (port 3000) is getting 404 errors because backend (port 5000) is not running.

**Solution:** 
1. First, fix Error 1 (install backend dependencies and start backend)
2. Once backend is running on port 5000, the frontend will be able to connect
3. The frontend code has already been fixed to use the correct backend URL

## Quick Fix - Run All Services

After installing dependencies, you can use the batch file:

```batch
cd D:\video-editing-store
.\start-all-services.bat
```

Or start them manually in separate terminals:

**Terminal 1 - Backend:**
```batch
cd D:\video-editing-store\backend
npm install
npm start
```

**Terminal 2 - Admin Dashboard:**
```batch
cd D:\video-editing-store\admin-dashboard
npm install
npm start
```

**Terminal 3 - Public Website:**
```batch
cd D:\video-editing-store
javac tools\StaticFileServer.java
java -cp tools StaticFileServer 3000
```

## Verification

Once all services are running:
- ✅ Backend: http://localhost:5050/api/health
- ✅ Admin Dashboard: http://localhost:3001
- ✅ Public Website: http://localhost:3000

