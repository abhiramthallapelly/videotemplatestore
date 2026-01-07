# Admin Dashboard - Video Editing Store

## Overview
This is the admin dashboard for the Video Editing Store, built with React. It provides an interface for uploading and managing video editing projects and templates.

## Structure
```
admin-dashboard/
├── src/
│   ├── components/          # Reusable UI components
│   ├── pages/              # Page components
│   ├── config/             # Configuration files
│   ├── App.js              # Main app component
│   ├── App.css             # Main styles
│   └── index.js            # Entry point
├── public/                  # Static assets
├── package.json            # Dependencies and scripts
└── start-admin.bat         # Windows startup script
```

## Prerequisites
- Node.js (version 14 or higher)
- Backend server running on port 5050

## Installation
1. Install dependencies:
   ```bash
   npm install
   ```

## Running the Dashboard

### Option 1: Using the startup script (Windows)
```bash
start-admin.bat
```

### Option 2: Manual start
```bash
npm start
```

The dashboard will be available at: http://localhost:3001

## Features
- **Project Upload**: Upload video files, project files, and templates
- **File Management**: View, edit, and delete uploaded projects
- **Pricing Control**: Set items as free or paid with custom pricing
- **Template Support**: Mark items as templates with preview images
- **Authentication**: Secure login/logout system

## API Endpoints
The dashboard connects to the main backend server:
- **Base URL**: http://localhost:5050
- **Admin API**: `/api/admin/*`
- **Health Check**: `/api/health`

## Development
- **Port**: 3001
- **Environment**: Development mode
- **Hot Reload**: Enabled for development

## Build for Production
```bash
npm run build
```

## Troubleshooting
1. **Blank Page**: Ensure backend server is running on port 5050
2. **CORS Errors**: Check backend CORS configuration
3. **Port Conflicts**: Ensure port 3001 is available
4. **API Errors**: Verify backend routes are working

## Dependencies
- React 18.2.0
- React Router DOM 6.3.0
- React Scripts 5.0.1
