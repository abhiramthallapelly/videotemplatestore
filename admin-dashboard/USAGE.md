# Admin Dashboard Usage Guide

## 🚀 Getting Started

### 1. Start the Backend
```batch
cd D:\video-editing-store\backend
npm start
```

### 2. Start the Admin Dashboard
```batch
cd D:\video-editing-store\admin-dashboard
npm start
```

### 3. Access the Dashboard
Open: http://localhost:3001

## 🔐 Login

### First Time Setup - Create Admin Account

If you don't have an admin account yet, create one via API:

```bash
POST http://localhost:5050/api/admin/register
Content-Type: application/json

{
  "username": "admin",
  "password": "your_secure_password"
}
```

Or use curl:
```bash
curl -X POST http://localhost:5050/api/admin/register \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"your_password"}'
```

### Login to Dashboard

1. Go to http://localhost:3001
2. Enter your admin username and password
3. Click "Login"

## ➕ Upload a New Template

### Using the Dashboard (Recommended)

1. **Click "+ Upload Template"** button in the header
2. **Fill in the form:**
   - **Title**: Name of your template (required)
   - **Category**: e.g., "Video Templates", "Project Files" (optional)
   - **Description**: Brief description (optional)
   - **Pricing**: 
     - Select "Free" for free templates
     - Select "Paid" and enter price in cents (e.g., 999 = $9.99)
   - **Template File**: Select your file (required, max 100MB)
   - **Preview Image**: Select preview/thumbnail image (optional, JPG/PNG/GIF)
3. **Click "Upload Template"**
4. Wait for upload to complete
5. Template will appear in the list below

### Using API Directly

```bash
POST http://localhost:5050/api/admin/projects
Authorization: Bearer YOUR_ADMIN_TOKEN
Content-Type: multipart/form-data

Form Data:
- title: "My Template"
- description: "Template description"
- category: "Video Templates"
- is_free: "1" (or "0" for paid)
- price: "0" (or price in cents)
- file: [your template file]
- image: [preview image, optional]
```

## 📋 View All Templates

After logging in, you'll see:
- **Statistics**: Total templates, free templates, paid templates
- **Template List**: All uploaded templates in a grid view
- Each template card shows:
  - Preview image (if uploaded)
  - Title and description
  - Price badge (FREE or $X.XX)
  - Category
  - Download count
  - Creation date
  - Actions: Delete and Download buttons

## 🗑️ Delete a Template

1. Find the template in the list
2. Click the **"Delete"** button on the template card
3. Confirm deletion
4. Template and its files will be removed

## 🔄 Refresh Template List

Click the **"Refresh"** button in the "All Templates" section to reload the list.

## 📊 Features

- ✅ **Upload Templates**: Upload files with preview images
- ✅ **View All Templates**: See all uploaded templates in a grid
- ✅ **Delete Templates**: Remove templates and their files
- ✅ **Statistics**: View counts of total, free, and paid templates
- ✅ **Download Links**: Direct download links for each template
- ✅ **Responsive Design**: Works on desktop and mobile

## 🛠️ Troubleshooting

### Can't Login
- Make sure backend is running on port 5050
- Check if admin account exists (create one if needed)
- Check browser console for errors

### Upload Fails
- Check file size (max 100MB)
- Verify backend is running
- Check browser console for error messages
- Ensure you're logged in

### Templates Not Showing
- Click "Refresh" button
- Check backend logs for errors
- Verify database connection

### Delete Not Working
- Make sure you're logged in
- Check backend logs
- Verify template ID is correct

## 📝 Notes

- **File Size Limit**: 100MB per file
- **Supported Formats**: Any file type
- **Image Formats**: JPG, PNG, GIF
- **Price Format**: Enter in cents (999 = $9.99)
- **Token Expiry**: Admin tokens expire after 2 hours (re-login required)

