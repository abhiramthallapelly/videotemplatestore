# Google Sheets Integration Setup Guide

This guide will help you set up Google Sheets integration for the reviews/feedback system.

## Prerequisites

- **Node.js 18+** is required for Google Sheets integration (uses native `fetch` API)
- For Node.js 14-17, reviews will still save to the database, but Google Sheets sync won't work
- The database is the primary storage - Google Sheets is optional for backup/export

## Method 1: Using Google Apps Script (Recommended - Easiest)

### Step 1: Create a Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Name it "Store Reviews" or similar
4. In the first row, add these column headers:
   - Column A: `Timestamp`
   - Column B: `Name`
   - Column C: `Email`
   - Column D: `Rating`
   - Column E: `Message`

### Step 2: Create Google Apps Script

1. In your Google Sheet, go to **Extensions** → **Apps Script**
2. Delete the default code and paste this code:

```javascript
function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const data = JSON.parse(e.postData.contents);
    
    if (data.action === 'append') {
      const row = [
        new Date(),
        data.data.name || '',
        data.data.email || '',
        data.data.rating || 0,
        data.data.message || ''
      ];
      sheet.appendRow(row);
      
      return ContentService
        .createTextOutput(JSON.stringify({ success: true, message: 'Review saved successfully' }))
        .setMimeType(ContentService.MimeType.JSON);
    } else if (data.action === 'get') {
      // Get all reviews (skip header row)
      const lastRow = sheet.getLastRow();
      if (lastRow <= 1) {
        return ContentService
          .createTextOutput(JSON.stringify({ reviews: [] }))
          .setMimeType(ContentService.MimeType.JSON);
      }
      
      const dataRange = sheet.getRange(2, 1, lastRow - 1, 5);
      const values = dataRange.getValues();
      
      const reviews = values.map(row => ({
        timestamp: row[0],
        name: row[1],
        email: row[2],
        rating: row[3],
        message: row[4]
      }));
      
      return ContentService
        .createTextOutput(JSON.stringify({ reviews: reviews }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, message: 'Invalid action' }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const lastRow = sheet.getLastRow();
    
    if (lastRow <= 1) {
      return ContentService
        .createTextOutput(JSON.stringify({ reviews: [] }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    const dataRange = sheet.getRange(2, 1, lastRow - 1, 5);
    const values = dataRange.getValues();
    
    const reviews = values.map(row => ({
      timestamp: row[0],
      name: row[1],
      email: row[2],
      rating: row[3],
      message: row[4]
    }));
    
    return ContentService
      .createTextOutput(JSON.stringify({ reviews: reviews }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

3. Click **Save** (floppy disk icon) or press `Ctrl+S`
4. Give your script a name like "Reviews Handler"

### Step 3: Deploy as Web App

1. Click **Deploy** → **New deployment**
2. Click the gear icon ⚙️ next to "Select type" and choose **Web app**
3. Fill in the deployment settings:
   - **Description**: "Reviews API v1" (optional)
   - **Execute as**: "Me"
   - **Who has access**: "Anyone" (important!)
4. Click **Deploy**
5. You'll be asked to authorize the app:
   - Click **Authorize access**
   - Choose your Google account
   - Click **Advanced** → **Go to [Your Project Name] (unsafe)**
   - Click **Allow**
6. Copy the **Web App URL** (it looks like: `https://script.google.com/macros/s/.../exec`)

### Step 4: Configure Backend

1. Open `backend/env.development` (or create it from `backend/env.example`)
2. Add this line:
   ```
   GOOGLE_SHEETS_WEB_APP_URL=https://script.google.com/macros/s/YOUR_WEB_APP_ID/exec
   ```
   Replace `YOUR_WEB_APP_ID` with the actual URL from Step 3

3. Restart your backend server

### Step 5: Test the Integration

1. Submit a review through the store.html page
2. Check your Google Sheet - the review should appear
3. Check the browser console and backend logs for any errors

## Method 2: Using Google Sheets API (Advanced)

If you prefer direct API access, you can use the `googleapis` npm package. This requires:
- Google Cloud Project setup
- Service account credentials
- More complex configuration

For most use cases, Method 1 (Google Apps Script) is recommended as it's simpler and doesn't require additional dependencies.

## Troubleshooting

### Reviews not saving to Google Sheets
- Check that `GOOGLE_SHEETS_WEB_APP_URL` is set correctly in your `.env` file
- Verify the Web App is deployed with "Anyone" access
- Check backend logs for errors
- Test the Web App URL directly in a browser (should return JSON)

### CORS Errors
- Google Apps Script Web Apps handle CORS automatically, but make sure the deployment has "Anyone" access

### Permission Errors
- Make sure you authorized the Apps Script when deploying
- Check that the script has permission to access your Google Sheet

## Notes

- Reviews are saved to both SQLite database (primary) and Google Sheets (optional backup/export)
- If Google Sheets URL is not configured, reviews will still save to the database
- The database is the primary source for displaying reviews on the website
- Google Sheets can be used for easy export, backup, or analysis in Excel/Google Sheets

