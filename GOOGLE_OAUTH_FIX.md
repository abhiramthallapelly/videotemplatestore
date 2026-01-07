# Google OAuth "invalid_client" Error Fix

## Error Message
```
Access blocked: Authorization Error
Error 401: invalid_client
The OAuth client was not found.
```

## Common Causes

1. **Client ID doesn't exist** - The client ID was deleted or never created
2. **Incorrect Client ID** - Typo or wrong client ID copied
3. **Redirect URI mismatch** - The redirect URI in your code doesn't match Google Cloud Console
4. **Environment variables not set** - GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET not configured
5. **Wrong OAuth consent screen** - App not properly configured in Google Cloud Console

## Step-by-Step Fix

### Step 1: Verify Environment Variables

Check your `backend/env.development` file has:
```bash
GOOGLE_CLIENT_ID=your-actual-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-actual-client-secret
GOOGLE_REDIRECT_URI=http://localhost:5050/api/auth/google/callback
```

**Important:** Replace `your-actual-client-id` and `your-actual-client-secret` with real values from Google Cloud Console.

### Step 2: Create/Verify Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create a new one)
3. Navigate to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth client ID**
5. If prompted, configure the OAuth consent screen first:
   - User Type: **External** (for testing) or **Internal** (for Google Workspace)
   - App name: Your app name
   - User support email: Your email
   - Developer contact: Your email
   - Click **Save and Continue**
   - Add scopes: `email`, `profile`, `openid`
   - Add test users (if external): Your email address
   - Click **Save and Continue**

6. Create OAuth Client ID:
   - Application type: **Web application**
   - Name: `Video Editing Store` (or any name)
   - Authorized redirect URIs: 
     - `http://localhost:5050/api/auth/google/callback`
     - `http://localhost:3000/store.html` (if needed)
   - Click **Create**

7. **Copy the Client ID and Client Secret** immediately (you can't see the secret again!)

### Step 3: Update Environment Variables

Edit `backend/env.development`:
```bash
GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abcdefghijklmnopqrstuvwxyz
GOOGLE_REDIRECT_URI=http://localhost:5050/api/auth/google/callback
FRONTEND_URL=http://localhost:3000
```

**Note:** 
- Client ID format: `xxxxx-xxxxx.apps.googleusercontent.com`
- Client Secret format: `GOCSPX-xxxxx` (new format) or `xxxxx` (old format)

### Step 4: Verify Redirect URI Match

**Critical:** The redirect URI in your environment variable MUST exactly match what's in Google Cloud Console:

✅ **Correct:**
- Google Console: `http://localhost:5050/api/auth/google/callback`
- env.development: `http://localhost:5050/api/auth/google/callback`

❌ **Wrong:**
- Google Console: `http://localhost:5050/api/auth/google/callback`
- env.development: `http://localhost:5000/api/auth/google/callback` (wrong port)
- Google Console: `http://localhost:5050/api/auth/google/callback`
- env.development: `http://localhost:5050/api/auth/google/callback/` (trailing slash)

### Step 5: Restart Backend Server

After updating environment variables:
```bash
cd backend
# Stop the server (Ctrl+C)
npm start
```

### Step 6: Test OAuth Configuration

Check if OAuth is configured:
```bash
curl http://localhost:5050/api/auth/google/status
```

Should return:
```json
{
  "configured": true,
  "hasClientId": true,
  "hasClientSecret": true,
  "redirectUri": "http://localhost:5050/api/auth/google/callback"
}
```

### Step 7: Test OAuth Flow

1. Visit: `http://localhost:3000/store.html`
2. Click "Sign in with Google"
3. Should redirect to Google login page
4. After login, should redirect back to store

## Troubleshooting

### Still Getting "invalid_client" Error?

1. **Double-check Client ID format:**
   - Should end with `.apps.googleusercontent.com`
   - Should not have spaces or extra characters

2. **Verify Redirect URI:**
   - Must be EXACTLY the same in both places
   - No trailing slashes
   - Correct port (5050, not 5000)
   - Use `http://` not `https://` for localhost

3. **Check OAuth Consent Screen:**
   - App must be published (or you must be a test user)
   - Scopes must include `email` and `profile`

4. **Verify Environment Variables Loaded:**
   ```bash
   # In backend directory
   node -e "require('dotenv').config({path:'./env.development'}); console.log('Client ID:', process.env.GOOGLE_CLIENT_ID ? 'SET' : 'NOT SET')"
   ```

5. **Check Server Logs:**
   - Look for "Google OAuth initialized successfully" message
   - Check for any error messages on startup

### Common Mistakes

❌ **Using wrong port:**
- Backend on 5050, but redirect URI says 5000

❌ **Missing redirect URI in Google Console:**
- Must add `http://localhost:5050/api/auth/google/callback` to authorized redirect URIs

❌ **Using production client ID for localhost:**
- Create separate OAuth client for development

❌ **Client ID/Secret in wrong file:**
- Must be in `backend/env.development` (not `env.production`)

## Production Setup

For production, create a separate OAuth client:
1. Add production redirect URI: `https://yourdomain.com/api/auth/google/callback`
2. Update `backend/env.production` with production credentials
3. Never use localhost credentials in production

## Quick Test Script

Create `test-google-oauth.js`:
```javascript
require('dotenv').config({ path: './backend/env.development' });

console.log('Google OAuth Configuration Check:');
console.log('Client ID:', process.env.GOOGLE_CLIENT_ID ? '✅ SET' : '❌ NOT SET');
console.log('Client Secret:', process.env.GOOGLE_CLIENT_SECRET ? '✅ SET' : '❌ NOT SET');
console.log('Redirect URI:', process.env.GOOGLE_REDIRECT_URI || '❌ NOT SET');

if (process.env.GOOGLE_CLIENT_ID && !process.env.GOOGLE_CLIENT_ID.includes('.apps.googleusercontent.com')) {
  console.log('⚠️  WARNING: Client ID format looks incorrect');
}
```

Run: `node test-google-oauth.js`

