# Quick Fix for Google OAuth "invalid_client" Error

## ✅ Your Configuration is Correct!

The test script shows:
- ✅ Client ID is set and has valid format
- ✅ Client Secret is set
- ✅ Redirect URI is correct (port 5050)

## The Problem

The error "OAuth client was not found" (401: invalid_client) means Google can't find your OAuth client. This is usually because:

1. **The Client ID in your env file doesn't match what's in Google Cloud Console**
2. **The redirect URI in Google Cloud Console doesn't match your env file**
3. **The OAuth client was deleted or disabled in Google Cloud Console**

## Quick Fix Steps

### Step 1: Verify in Google Cloud Console

1. Go to: https://console.cloud.google.com/
2. Select your project
3. Navigate to: **APIs & Services** > **Credentials**
4. Find your OAuth 2.0 Client ID
5. Click on it to view details

### Step 2: Check These Settings

**A. Authorized redirect URIs must include:**
```
http://localhost:5050/api/auth/google/callback
```

**B. Client ID must match:**
- Check the Client ID shown in Google Cloud Console
- Compare it with what's in `backend/env.development`
- They must be EXACTLY the same

**C. OAuth consent screen:**
- Must be configured (even if in testing mode)
- Your email must be added as a test user (if app is in testing)

### Step 3: Common Issues

#### Issue 1: Redirect URI Mismatch
**Symptom:** Error 401: invalid_client

**Fix:**
- In Google Cloud Console, edit your OAuth client
- Under "Authorized redirect URIs", add:
  ```
  http://localhost:5050/api/auth/google/callback
  ```
- Make sure there are NO trailing slashes
- Make sure it's `http://` not `https://` for localhost
- Make sure port is 5050, not 5000

#### Issue 2: Wrong Client ID
**Symptom:** Error 401: invalid_client

**Fix:**
- Copy the Client ID directly from Google Cloud Console
- Update `backend/env.development`:
  ```bash
  GOOGLE_CLIENT_ID=copy-from-google-console.apps.googleusercontent.com
  ```
- Restart backend server

#### Issue 3: OAuth Consent Screen Not Configured
**Symptom:** Error 401: invalid_client or access denied

**Fix:**
1. Go to: **APIs & Services** > **OAuth consent screen**
2. Configure:
   - User Type: External (for testing)
   - App name: Your app name
   - User support email: Your email
   - Developer contact: Your email
   - Save and Continue
3. Add scopes:
   - `email`
   - `profile`
   - `openid`
4. Add test users:
   - Add your email: `abhiramdevops29@gmail.com`
5. Save and Continue

### Step 4: Test Again

After fixing in Google Cloud Console:

1. **Restart backend server:**
   ```bash
   cd backend
   npm start
   ```

2. **Test OAuth status:**
   ```bash
   curl http://localhost:5050/api/auth/google/status
   ```

3. **Try login again:**
   - Go to: http://localhost:3000/store.html
   - Click "Sign in with Google"
   - Should redirect to Google login

## Verification Checklist

- [ ] Client ID in `backend/env.development` matches Google Cloud Console
- [ ] Redirect URI `http://localhost:5050/api/auth/google/callback` is in Google Cloud Console
- [ ] OAuth consent screen is configured
- [ ] Your email is added as a test user (if app is in testing)
- [ ] Backend server restarted after any changes
- [ ] Port 5050 is correct (not 5000)

## Still Not Working?

1. **Check backend logs** for any error messages
2. **Verify the OAuth client is enabled** in Google Cloud Console
3. **Try creating a new OAuth client** if the old one seems corrupted
4. **Check if you're using the correct Google account** (the one that created the OAuth client)

## Need Help?

Run the diagnostic:
```bash
node test-google-oauth.js
```

This will show you exactly what's configured and what might be missing.

