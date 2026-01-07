# Quick Start Guide - Enhanced Backend

## 🚀 Starting the Enhanced Backend

### Step 1: Install Dependencies
```bash
cd backend
npm install
```

All new packages are already installed:
- ✅ express-rate-limit
- ✅ express-validator
- ✅ helmet
- ✅ compression
- ✅ morgan
- ✅ winston
- ✅ sharp

### Step 2: Start the Server
```bash
npm start
```

You should see:
```
🚀 Server running on port 5050 in development mode
📊 Health check available at: http://localhost:5050/api/health
✅ Database connection verified
```

### Step 3: Verify Everything Works

1. **Health Check:**
   ```bash
   curl http://localhost:5050/api/health
   ```

2. **Test Store Items:**
   ```bash
   curl http://localhost:5050/api/store/items
   ```

3. **Check Logs:**
   - Logs are in `backend/logs/` directory
   - Check `combined.log` for all activity
   - Check `error.log` for errors only

## 🎯 What's New

### Security
- ✅ Rate limiting on all endpoints
- ✅ Input validation on all forms
- ✅ Security headers (Helmet)
- ✅ CORS properly configured

### Performance
- ✅ Response compression
- ✅ Request logging
- ✅ Connection optimization
- ✅ Error handling

### Features
- ✅ Database backup system
- ✅ Image processing
- ✅ Connection retry logic
- ✅ Health monitoring

## 📋 API Endpoints

### Health & Status
- `GET /api/health` - Server health check

### Backup (Admin)
- `POST /api/backup/create` - Create backup
- `GET /api/backup/list` - List backups
- `POST /api/backup/restore/:filename` - Restore backup

### All Other Endpoints
- Now have rate limiting
- Now have input validation
- Now have better error handling

## 🔧 Configuration

### Rate Limits
Edit `backend/middleware/rateLimiter.js` to adjust limits.

### Logging
Set `LOG_LEVEL` in environment:
- `error` - Errors only
- `warn` - Warnings and errors
- `info` - General information (default)
- `debug` - All logs

### Timeouts
Edit timeout in `backend/server.js`:
```javascript
app.use(timeoutHandler(30000)); // 30 seconds
```

## ✅ Success Indicators

When everything is working:
- ✅ Server starts without errors
- ✅ Health check shows database: "connected"
- ✅ No errors in console
- ✅ Logs directory created
- ✅ All API endpoints respond

## 🐛 Troubleshooting

### "Cannot find module" errors
```bash
cd backend
npm install
```

### Rate limit errors
- Wait for the time window to reset
- Or adjust limits in `rateLimiter.js`

### Database errors
- Check `backend/database.sqlite` exists
- Restart server to trigger migration
- Check logs for specific errors

### Connection errors
 - Verify port 5050 is not in use
- Check firewall settings
- Verify CORS configuration

## 📚 Documentation

- `ENHANCED_MODULES.md` - All new modules
- `CONNECTION_FIXES.md` - Connection fixes
- `MODULES_DOCUMENTATION.md` - API documentation

Your backend is now production-ready with enterprise-grade features! 🎉

