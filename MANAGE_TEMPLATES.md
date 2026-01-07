# How to Manage Templates

## 🗑️ Delete All Templates

### Method 1: Using the Script (Recommended)

1. **Stop the backend server** (if running) - Press Ctrl+C

2. **Run the delete script:**
   ```batch
   cd D:\video-editing-store
   node delete-all-templates.js
   ```

This will:
- ✅ Delete all template files from `backend/uploads/`
- ✅ Delete all image files from `backend/uploads/images/`
- ✅ Remove all records from the database
- ✅ Clean up download and purchase history

### Method 2: Using Admin Dashboard

1. **Start the backend server:**
   ```batch
   cd D:\video-editing-store\backend
   npm start
   ```

2. **Start the admin dashboard:**
   ```batch
   cd D:\video-editing-store\admin-dashboard
   npm start
   ```

3. **Login to admin dashboard** at http://localhost:3001

4. **Delete templates one by one** using the delete button for each template

### Method 3: Using Database Directly

1. **Install SQLite browser** or use command line:
   ```batch
   sqlite3 backend/database.sqlite
   ```

2. **Delete all templates:**
   ```sql
   DELETE FROM projects;
   DELETE FROM downloads;
   DELETE FROM purchases;
   ```

3. **Manually delete files** from:
   - `backend/uploads/` (all files)
   - `backend/uploads/images/` (all images)

## ➕ Add a New Template

### Method 1: Using Admin Dashboard (Recommended)

1. **Make sure backend is running:**
   ```batch
   cd D:\video-editing-store\backend
   npm start
   ```

2. **Start admin dashboard:**
   ```batch
   cd D:\video-editing-store\admin-dashboard
   npm start
   ```

3. **Login** at http://localhost:3001

4. **Click "Upload" or "Add New Template"**

5. **Fill in the form:**
   - **Title**: Name of your template (e.g., "Summer Promo Template")
   - **Description**: Brief description
   - **File**: Upload your template file (video file, project file, etc.)
   - **Image** (optional): Preview/thumbnail image
   - **Price**: 
     - Check "Free" for free templates
     - Or enter a price (in cents, e.g., 999 = $9.99)
   - **Category**: Select a category

6. **Click "Upload"**

### Method 2: Using API (cURL or Postman)

1. **Get admin token** (login first):
   ```bash
   POST http://localhost:5050/api/admin/login
   Body: {
     "username": "your_admin_username",
     "password": "your_admin_password"
   }
   ```

2. **Upload template:**
   ```bash
   POST http://localhost:5050/api/admin/projects
   Headers: {
     "Authorization": "Bearer YOUR_ADMIN_TOKEN"
   }
   Body (multipart/form-data):
     - title: "My Template"
     - description: "Template description"
     - is_free: "1" (or "0" for paid)
     - price: "0" (or price in cents)
     - file: [your template file]
     - image: [preview image, optional]
   ```

### Method 3: Direct File Upload Script

Create a file `upload-template.js`:

```javascript
const FormData = require('form-data');
const fs = require('fs');
const fetch = require('node-fetch');

async function uploadTemplate() {
  // First, login to get token
   const loginRes = await fetch('http://localhost:5050/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'your_admin_username',
      password: 'your_admin_password'
    })
  });
  
  const { token } = await loginRes.json();
  
  // Create form data
  const form = new FormData();
  form.append('title', 'My New Template');
  form.append('description', 'Template description');
  form.append('is_free', '1');
  form.append('price', '0');
  form.append('file', fs.createReadStream('path/to/your/template.file'));
  form.append('image', fs.createReadStream('path/to/preview.jpg'));
  
  // Upload
   const uploadRes = await fetch('http://localhost:5050/api/admin/projects', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: form
  });
  
  const result = await uploadRes.json();
  console.log('Upload result:', result);
}

uploadTemplate();
```

## 📋 Template Requirements

### Supported File Types:
- Video files (.mp4, .mov, .avi, etc.)
- Project files (.prproj, .aep, .fcpx, etc.)
- Any file type you want to offer

### Image Requirements:
- Format: JPG, PNG, or GIF
- Recommended size: 1280x720 or 1920x1080
- Used as thumbnail/preview in the store

### Pricing:
- **Free**: Set `is_free = 1` and `price = 0`
- **Paid**: Set `is_free = 0` and `price` in cents (e.g., 999 = $9.99)

## 🔍 View All Templates

### Via Admin Dashboard:
- Login at http://localhost:3001
- View all templates in the dashboard

### Via API:
```bash
GET http://localhost:5050/api/admin/projects
Headers: {
  "Authorization": "Bearer YOUR_ADMIN_TOKEN"
}
```

### Via Store (Public):
```bash
GET http://localhost:5050/api/store/items
```

## 🛠️ Troubleshooting

### Upload Fails:
- Check file size (limit is 100MB)
- Verify admin token is valid
- Check backend logs for errors
- Ensure `backend/uploads/` folder exists

### Template Not Showing:
- Refresh the store page
- Check database: `SELECT * FROM projects`
- Verify file exists in `backend/uploads/`

### Delete Not Working:
- Make sure you're logged in as admin
- Check backend logs for errors
- Verify template ID is correct

