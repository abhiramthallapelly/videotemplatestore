# Quick Google OAuth Setup Guide

## Step 1: Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Go to **APIs & Services** → **Credentials**
4. Click **+ CREATE CREDENTIALS** → **OAuth client ID**
5. Configure OAuth consent screen (if first time):
   - Choose **External**
   - App name: "ABHIRAM CREATIONS Store"
   - Support email: Your email
   - Developer contact: Your email
   - Click **Save and Continue** through all steps
6. Create OAuth client:
   - Application type: **Web application**
   - Name: "Store Web Client"
   - Authorized JavaScript origins: `http://localhost:3000`, `http://localhost:5050`
   - Authorized redirect URIs: `http://localhost:5050/api/auth/google/callback`
   - Click **Create**
7. **Copy the Client ID and Client Secret**

## Step 2: Add Credentials to Backend

1. Open `backend/env.development`
2. Add these lines (replace with your actual credentials):

```env
GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret-here
GOOGLE_REDIRECT_URI=http://localhost:5050/api/auth/google/callback
FRONTEND_URL=http://localhost:3000
```

## Step 3: Restart Backend Server

```bash
cd backend
# Stop the server (Ctrl+C if running)
npm start
```

## Step 4: Test

1. Open `store.html` in your browser
2. Click **Login** or **Register**
3. You should see **"Sign in with Google"** button
4. Click it and test the login flow

## Troubleshooting

### Button doesn't appear
- Check backend console for "Google OAuth initialized successfully"
- Verify credentials are in `env.development` (not just `env.example`)
- Restart backend server after adding credentials

### "redirect_uri_mismatch" error
 - Make sure redirect URI in Google Console exactly matches: `http://localhost:5050/api/auth/google/callback`
- No trailing slashes
- Check protocol (http vs https)

### "invalid_client" error
- Double-check Client ID and Client Secret
- Make sure no extra spaces or quotes
- Verify credentials are correct in `env.development`

## Production Setup

When deploying:
1. Update Google Console with production URLs
2. Update `env.production` with production credentials
3. Use HTTPS URLs in production

