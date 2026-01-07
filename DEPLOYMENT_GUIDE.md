# Admin Dashboard Deployment Guide

## Issues Fixed

The admin dashboard was not working properly after deployment due to several critical issues:

### 1. **Missing Environment Variables**
- No `.env` file existed
- Missing `JWT_SECRET` for authentication
- Missing proper database configuration

### 2. **Hardcoded Localhost URLs**
-- Frontend was hardcoded to `http://localhost:5050`
- This breaks in production/deployment

### 3. **Missing Start Scripts**
- Backend had no start script
- No production build configuration

### 4. **Database Path Issues**
- SQLite database path was relative
- No database initialization for production

### 5. **CORS Configuration**
- CORS was set to allow all origins
- No proper production security

## Deployment Steps

### Backend Deployment

1. **Set Environment Variables**
   ```bash
   # Copy the production environment file
   cp backend/env.production backend/.env
   
   # Edit .env with your production values
   JWT_SECRET=your-super-secure-jwt-secret-key
   FRONTEND_URL=https://your-domain.com
   ALLOWED_ORIGINS=https://your-domain.com
   ```

2. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Start the Backend**
   ```bash
   npm start
   # or for production
   NODE_ENV=production npm start
   ```

### Frontend Deployment

1. **Build for Production**
   ```bash
   cd admin-dashboard
   npm run build
   ```

2. **Set Environment Variables** (optional)
   ```bash
   # Create .env file in admin-dashboard directory
   REACT_APP_API_URL=https://your-backend-domain.com
   REACT_APP_UPLOADS_URL=https://your-backend-domain.com
   ```

3. **Serve the Build**
   ```bash
   # Install serve globally
   npm install -g serve
   
   # Serve the build
   npm run serve
   # or
   serve -s build -l 3001
   ```

## Environment Configuration

### Backend (.env)
```env
PORT=5000
NODE_ENV=production
JWT_SECRET=your-super-secure-jwt-secret-key
DB_PATH=./database.sqlite
FRONTEND_URL=https://your-domain.com
ALLOWED_ORIGINS=https://your-domain.com
MAX_FILE_SIZE=104857600
UPLOAD_PATH=./uploads
```

### Frontend (.env)
```env
REACT_APP_API_URL=https://your-backend-domain.com
REACT_APP_UPLOADS_URL=https://your-backend-domain.com
```

## Quick Start Commands

### Development
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd admin-dashboard
npm start
```

### Production
```bash
# Terminal 1 - Backend
cd backend
NODE_ENV=production npm start

# Terminal 2 - Frontend
cd admin-dashboard
npm run build
npm run serve
```

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Check `ALLOWED_ORIGINS` in backend `.env`
   - Ensure frontend URL is included

2. **Authentication Failures**
   - Verify `JWT_SECRET` is set in backend `.env`
   - Check token expiration (default: 2 hours)

3. **Database Connection Issues**
   - Ensure `database.sqlite` file exists
   - Check file permissions in production

4. **File Upload Issues**
   - Verify `uploads/` directory exists
   - Check file size limits (default: 100MB)

### Health Check
Test backend health at: `http://your-backend-domain.com/api/health`

## Security Notes

- Change `JWT_SECRET` in production
- Set proper `ALLOWED_ORIGINS` for CORS
- Use HTTPS in production
- Regularly rotate JWT secrets
- Monitor file uploads for malicious content
