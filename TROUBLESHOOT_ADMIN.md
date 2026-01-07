# Troubleshooting Admin Dashboard Connection

## Issue: "Backend: ✗ Not Connected"

### Quick Fixes

#### 1. Verify Backend is Running
Open a new terminal and test:
```batch
curl http://localhost:5050/api/health
```

Or in PowerShell:
```powershell
Invoke-WebRequest -Uri "http://localhost:5050/api/health"
```

You should see: `{"status":"Backend is running!"}`

#### 2. Check Browser Console
1. Open Admin Dashboard: http://localhost:3001
2. Press F12 to open Developer Tools
3. Go to Console tab
4. Look for error messages
5. Go to Network tab
6. Refresh the page
7. Check if `/api/health` request is being made
8. Check the response status

#### 3. Common Issues

**Issue: CORS Error**
- Error: "Access to fetch at 'http://localhost:5050/api/health' from origin 'http://localhost:3001' has been blocked by CORS policy"
- **Fix**: The backend CORS is already configured to allow all origins in development. Make sure backend is running with `NODE_ENV=development` or no NODE_ENV set.

**Issue: Network Error**
- Error: "Failed to fetch" or "NetworkError"
- **Fix**: 
  1. Make sure backend is actually running
  2. Check if port 5000 is accessible
   3. Try accessing http://localhost:5050/api/health directly in browser

**Issue: Wrong API URL**
- The React app might be using wrong URL
- **Fix**: Check browser console for the log message showing the API URL being used

#### 4. Restart Services

**Stop everything and restart:**

1. **Stop Backend** (Ctrl+C in backend terminal)
2. **Stop Admin Dashboard** (Ctrl+C in admin terminal)
3. **Restart Backend:**
   ```batch
   cd D:\video-editing-store\backend
   npm start
   ```
4. **Wait 5 seconds**
5. **Restart Admin Dashboard:**
   ```batch
   cd D:\video-editing-store\admin-dashboard
   npm start
   ```

#### 5. Verify Environment Variables

Check if `REACT_APP_API_URL` is set correctly:
- Should be: `http://localhost:5050`
- Check in: `admin-dashboard/.env` or `admin-dashboard/env.development`

#### 6. Test Direct Connection

Open these URLs in your browser:
- ✅ http://localhost:5050/api/health (should return JSON)
- ✅ http://localhost:3001 (should show login page)

If both work, the issue is likely CORS or the React app configuration.

#### 7. Check Firewall/Antivirus

Sometimes Windows Firewall or antivirus blocks localhost connections. Try:
- Temporarily disable firewall
- Add exception for Node.js
- Check Windows Defender settings

## Still Not Working?

1. Check backend terminal for error messages
2. Check admin dashboard terminal for error messages
3. Check browser console (F12) for detailed errors
4. Verify both services are using correct ports (5050 and 3001)

