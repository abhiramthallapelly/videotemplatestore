# Google OAuth Login Setup Guide

This guide will help you set up Google OAuth login so users can sign in with their Gmail accounts.

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top
3. Click **"New Project"**
4. Enter a project name (e.g., "Video Editing Store")
5. Click **"Create"**
6. Wait for the project to be created and select it

## Step 2: Enable Google+ API

1. In the Google Cloud Console, go to **"APIs & Services"** → **"Library"**
2. Search for **"Google+ API"** or **"People API"**
3. Click on it and click **"Enable"**

Note: Google+ API is deprecated, but we're using it for OAuth. Alternatively, you can enable **"Google Identity Services"** which is the newer API.

## Step 3: Create OAuth 2.0 Credentials

1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"+ CREATE CREDENTIALS"** at the top
3. Select **"OAuth client ID"**
4. If prompted, configure the OAuth consent screen first:
   - Choose **"External"** (unless you have a Google Workspace account)
   - Fill in the required fields:
     - App name: "ABHIRAM CREATIONS Store"
     - User support email: Your email
     - Developer contact information: Your email
   - Click **"Save and Continue"**
   - Add scopes: `userinfo.email` and `userinfo.profile`
   - Click **"Save and Continue"**
   - Add test users (optional for development)
   - Click **"Save and Continue"**
   - Review and click **"Back to Dashboard"**

5. Now create the OAuth client ID:
   - Application type: **"Web application"**
   - Name: "Store Web Client"
    - Authorized JavaScript origins:
       - `http://localhost:3000`
       - `http://localhost:5050`
     - Add your production domain when deploying
    - Authorized redirect URIs:
          - `http://localhost:5050/api/auth/google/callback`
     - Add your production callback URL when deploying
   - Click **"Create"**

6. **Copy the Client ID and Client Secret** - you'll need these!

## Step 4: Configure Backend Environment Variables

1. Open `backend/env.development` (or create it from `backend/env.example`)
2. Add/update these variables:

```env
# Google OAuth 2.0 Configuration
GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret-here
GOOGLE_REDIRECT_URI=http://localhost:5050/api/auth/google/callback
FRONTEND_URL=http://localhost:3000
```

Replace:
- `your-client-id-here.apps.googleusercontent.com` with your actual Client ID
- `your-client-secret-here` with your actual Client Secret

## Step 5: Update Database Schema

The database schema has been updated to support OAuth users. When you restart the backend server, the new columns will be added automatically:
- `google_id` - Stores Google user ID
- `auth_provider` - Stores authentication provider ('local' or 'google')
- `profile_picture` - Stores Google profile picture URL
- `password` - Now optional (NULL for OAuth users)
- `username` - Now optional (auto-generated for OAuth users)

## Step 6: Restart Backend Server

1. Stop your backend server (Ctrl+C)
2. Start it again:
   ```bash
   cd backend
   npm start
   ```

## Step 7: Test Google Sign-In

1. Open `store.html` in your browser
2. Click **"Login"** or **"Register"**
3. Click **"Sign in with Google"** button
4. You should be redirected to Google's login page
5. Sign in with your Google account
6. Authorize the application
7. You should be redirected back and logged in!

## Troubleshooting

### Error: "Google OAuth is not configured"
- Make sure `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set in your `.env` file
- Restart the backend server after adding environment variables

### Error: "redirect_uri_mismatch"
- Make sure the redirect URI in Google Cloud Console exactly matches:
  - `http://localhost:5000/api/auth/google/callback`
- Check that there are no trailing slashes
- Make sure the protocol (http/https) matches

### Error: "invalid_client"
- Double-check your Client ID and Client Secret
- Make sure there are no extra spaces or quotes
- Regenerate credentials if needed

### Error: "access_denied"
- Check your OAuth consent screen configuration
- If in testing mode, make sure you've added your email as a test user
- Wait a few minutes after making changes to the consent screen

### Users can't log in after Google OAuth
- Check backend logs for errors
- Verify the database was updated correctly
- Make sure `FRONTEND_URL` matches your frontend URL

## Production Deployment

When deploying to production:

1. Update Google Cloud Console:
   - Add production domain to Authorized JavaScript origins
   - Add production callback URL to Authorized redirect URIs
   - Update OAuth consent screen with production app URL

2. Update environment variables:
   ```env
   GOOGLE_CLIENT_ID=your-production-client-id
   GOOGLE_CLIENT_SECRET=your-production-client-secret
   GOOGLE_REDIRECT_URI=https://yourdomain.com/api/auth/google/callback
   FRONTEND_URL=https://yourdomain.com
   ```

3. Submit OAuth consent screen for verification (if using external users)

## Security Notes

- Never commit `.env` files to version control
- Keep your Client Secret secure
- Use HTTPS in production
- Regularly rotate your OAuth credentials
- Monitor OAuth usage in Google Cloud Console

## How It Works

1. User clicks "Sign in with Google"
2. Frontend requests OAuth URL from backend
3. User is redirected to Google login page
4. User authorizes the application
5. Google redirects back to `/api/auth/google/callback` with authorization code
6. Backend exchanges code for user info
7. Backend creates or updates user in database
8. Backend generates JWT token
9. User is redirected to frontend with token in URL
10. Frontend stores token and user is logged in

## Support

If you encounter issues:
1. Check backend console logs
2. Check browser console for errors
3. Verify all environment variables are set
4. Verify Google Cloud Console configuration
5. Check that ports 3000 and 5050 are accessible

