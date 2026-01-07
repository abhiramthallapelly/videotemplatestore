# Social Login Setup Guide - Google, Facebook, Instagram

This guide will help you set up social login (OAuth) for Google, Facebook, and Instagram.

## 📋 Prerequisites

- Backend server running
- Access to Google Cloud Console, Facebook Developers, and Instagram API

## 🔵 Google OAuth Setup

### Step 1: Create Google OAuth Credentials

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

### Step 2: Add to Environment File

Add to `backend/env.development`:

```env
GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret-here
GOOGLE_REDIRECT_URI=http://localhost:5050/api/auth/google/callback
```

## 🔵 Facebook OAuth Setup

### Step 1: Create Facebook App

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click **My Apps** → **Create App**
3. Choose **Consumer** app type
4. Fill in app details:
   - App Name: "ABHIRAM CREATIONS Store"
   - Contact Email: Your email
5. Go to **Settings** → **Basic**
6. Add **Facebook Login** product
7. Go to **Facebook Login** → **Settings**
8. Add Valid OAuth Redirect URIs:
   - `http://localhost:5050/api/auth/facebook/callback`
9. Go to **Settings** → **Basic** and copy:
   - **App ID**
   - **App Secret** (click Show)

### Step 2: Add to Environment File

Add to `backend/env.development`:

```env
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
FACEBOOK_REDIRECT_URI=http://localhost:5050/api/auth/facebook/callback
```

## 📸 Instagram OAuth Setup

### Step 1: Create Instagram App

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app or use existing Facebook app
3. Add **Instagram Basic Display** product
4. Go to **Instagram Basic Display** → **Basic Display**
5. Create a new Instagram App:
   - App name: "ABHIRAM CREATIONS Store"
   - Valid OAuth Redirect URIs: `http://localhost:5050/api/auth/instagram/callback`
6. Copy:
   - **Instagram App ID**
   - **Instagram App Secret**

### Step 2: Add to Environment File

Add to `backend/env.development`:

```env
INSTAGRAM_APP_ID=your-instagram-app-id
INSTAGRAM_APP_SECRET=your-instagram-app-secret
INSTAGRAM_REDIRECT_URI=http://localhost:5050/api/auth/instagram/callback
```

## 🚀 Testing

### 1. Restart Backend Server

```bash
cd backend
npm start
```

### 2. Check OAuth Status

Visit: `http://localhost:5050/api/auth/status`

You should see which providers are configured:

```json
{
  "google": {
    "configured": true,
    "hasClientId": true,
    "hasClientSecret": true
  },
  "facebook": {
    "configured": true,
    "hasAppId": true,
    "hasAppSecret": true
  },
  "instagram": {
    "configured": true,
    "hasAppId": true,
    "hasAppSecret": true
  }
}
```

### 3. Test Login

1. Open `store.html` in your browser
2. Click **Login** or **Register**
3. You should see social login buttons for configured providers
4. Click a button to test the OAuth flow

## 🔧 Troubleshooting

### Google OAuth

**Button doesn't appear:**
- Check backend console for "Google OAuth initialized successfully"
- Verify credentials in `env.development`
- Restart backend server

**"redirect_uri_mismatch" error:**
   - Ensure redirect URI in Google Console exactly matches: `http://localhost:5050/api/auth/google/callback`
- No trailing slashes
- Check protocol (http vs https)

### Facebook OAuth

**Button doesn't appear:**
- Verify `FACEBOOK_APP_ID` and `FACEBOOK_APP_SECRET` are set
- Check Facebook App is in Development mode (for testing)
- Ensure redirect URI is added in Facebook App settings

**"Invalid OAuth access token" error:**
- Verify App ID and App Secret are correct
- Check redirect URI matches exactly
- Ensure Facebook Login product is added

### Instagram OAuth

**Button doesn't appear:**
- Verify `INSTAGRAM_APP_ID` and `INSTAGRAM_APP_SECRET` are set
- Check Instagram Basic Display product is added
- Ensure redirect URI is added in Instagram App settings

**"Invalid client_id" error:**
- Verify Instagram App ID is correct
- Check redirect URI matches exactly
- Ensure Instagram Basic Display is properly configured

## 📝 Production Setup

For production, update:

1. **Redirect URIs** to your production domain:
   ```
   https://yourdomain.com/api/auth/google/callback
   https://yourdomain.com/api/auth/facebook/callback
   https://yourdomain.com/api/auth/instagram/callback
   ```

2. **Authorized JavaScript origins** in Google Console:
   ```
   https://yourdomain.com
   ```

3. **Valid OAuth Redirect URIs** in Facebook/Instagram apps:
   ```
   https://yourdomain.com/api/auth/facebook/callback
   https://yourdomain.com/api/auth/instagram/callback
   ```

4. **Environment variables** in `backend/env.production`

## ✅ Verification Checklist

- [ ] Google OAuth credentials added
- [ ] Facebook OAuth credentials added
- [ ] Instagram OAuth credentials added
- [ ] Backend server restarted
- [ ] OAuth status endpoint shows all providers configured
- [ ] Social login buttons appear in login/register modals
- [ ] Can successfully login with Google
- [ ] Can successfully login with Facebook
- [ ] Can successfully login with Instagram

## 🎉 Success!

Once all providers are configured, users can sign in with:
- ✅ Google
- ✅ Facebook
- ✅ Instagram
- ✅ Email/Password (existing)

All authentication methods create accounts in the same database and work seamlessly together!

