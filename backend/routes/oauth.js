const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// Helper function to handle OAuth user creation/login
async function handleOAuthUser(provider, providerId, email, fullName, profilePicture, res) {
  try {
    // Check if user exists by email or provider ID
    const providerIdField = `${provider}_id`;
    const query = {};
    
    if (email) {
      query.$or = [{ email: email.toLowerCase() }];
    }
    query[providerIdField] = providerId;
    if (email) {
      query.$or.push({ [providerIdField]: providerId });
    }
    
    let existingUser = await User.findOne(query);

    if (existingUser) {
      // Update existing user with provider info if needed
      if (!existingUser[providerIdField]) {
        existingUser[providerIdField] = providerId;
        existingUser.auth_provider = provider;
        if (profilePicture) existingUser.profile_picture = profilePicture;
      } else if (profilePicture && !existingUser.profile_picture) {
        existingUser.profile_picture = profilePicture;
      }
      
      // Update last login
      existingUser.last_login = new Date();
      await existingUser.save();
      
      // Generate JWT token for existing user
      const token = jwt.sign(
        { userId: existingUser._id.toString(), email: existingUser.email || email, authProvider: provider },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      );

      // Redirect to frontend with token
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/store.html?token=${token}&email=${encodeURIComponent(existingUser.email || email || '')}&name=${encodeURIComponent(existingUser.full_name || existingUser.username || existingUser.email || fullName || 'User')}&provider=${provider}`);
    } else {
      // Create new user
      const username = email ? email.split('@')[0] : `${provider}_${providerId.substring(0, 8)}`;
      const userEmail = email || `${username}@${provider}.oauth`;
      
      const newUser = await User.create({
        email: userEmail.toLowerCase(),
        username,
        full_name: fullName || username,
        auth_provider: provider,
        [providerIdField]: providerId,
        profile_picture: profilePicture || null,
        is_verified: true,
        last_login: new Date()
      });
      
      // Generate JWT token
      const token = jwt.sign(
        { userId: newUser._id.toString(), email: userEmail, authProvider: provider },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      );

      // Redirect to frontend with token
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/store.html?token=${token}&email=${encodeURIComponent(userEmail)}&name=${encodeURIComponent(fullName || username)}&provider=${provider}`);
    }
  } catch (error) {
    console.error('OAuth user handling error:', error);
    return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/store.html?error=database_error`);
  }
}

// ==================== FACEBOOK OAUTH ====================

// Facebook OAuth - Get authentication URL
router.get('/facebook', (req, res) => {
  try {
    if (!process.env.FACEBOOK_APP_ID || !process.env.FACEBOOK_APP_SECRET) {
      return res.status(503).json({ 
        success: false,
        message: 'Facebook OAuth is not configured. Please set FACEBOOK_APP_ID and FACEBOOK_APP_SECRET in your environment variables.',
        configured: false
      });
    }

    const redirectUri = encodeURIComponent(process.env.FACEBOOK_REDIRECT_URI || `http://localhost:5050/api/auth/facebook/callback`);
    const scope = 'email,public_profile';
    const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${process.env.FACEBOOK_APP_ID}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code`;

    res.json({ 
      success: true,
      authUrl,
      configured: true
    });
  } catch (error) {
    console.error('Facebook OAuth URL generation error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error generating Facebook OAuth URL',
      error: error.message
    });
  }
});

// Check Facebook OAuth configuration status
router.get('/facebook/status', (req, res) => {
  const isConfigured = !!(process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET);
  res.json({
    configured: isConfigured,
    hasAppId: !!process.env.FACEBOOK_APP_ID,
    hasAppSecret: !!process.env.FACEBOOK_APP_SECRET,
    redirectUri: process.env.FACEBOOK_REDIRECT_URI || `http://localhost:5050/api/auth/facebook/callback`
  });
});

// Facebook OAuth - Callback handler
router.get('/facebook/callback', async (req, res) => {
  try {
    if (!process.env.FACEBOOK_APP_ID || !process.env.FACEBOOK_APP_SECRET) {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/store.html?error=oauth_not_configured`);
    }

    const { code, error } = req.query;

    if (error) {
      console.error('Facebook OAuth error:', error);
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/store.html?error=oauth_failed`);
    }

    if (!code) {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/store.html?error=oauth_failed`);
    }

    const redirectUri = process.env.FACEBOOK_REDIRECT_URI || `http://localhost:5050/api/auth/facebook/callback`;

    // Exchange code for access token
    try {
      const tokenResponse = await axios.get('https://graph.facebook.com/v18.0/oauth/access_token', {
        params: {
          client_id: process.env.FACEBOOK_APP_ID,
          client_secret: process.env.FACEBOOK_APP_SECRET,
          redirect_uri: redirectUri,
          code: code
        }
      });

      const accessToken = tokenResponse.data.access_token;

      // Get user info from Facebook
      const userResponse = await axios.get('https://graph.facebook.com/me', {
        params: {
          fields: 'id,name,email,picture',
          access_token: accessToken
        }
      });

      const userData = userResponse.data;
      const facebookId = userData.id;
      const email = userData.email ? userData.email.toLowerCase() : null;
      const fullName = userData.name;
      const profilePicture = userData.picture?.data?.url;

      if (!facebookId) {
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/store.html?error=oauth_failed`);
      }

      // Handle user creation/login
      await handleOAuthUser('facebook', facebookId, email, fullName, profilePicture, res);

    } catch (error) {
      console.error('Facebook OAuth token exchange error:', error.response?.data || error.message);
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/store.html?error=oauth_failed`);
    }

  } catch (error) {
    console.error('Facebook OAuth callback error:', error);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/store.html?error=oauth_error`);
  }
});

// ==================== INSTAGRAM OAUTH ====================

// Instagram OAuth - Get authentication URL
// Note: Instagram uses Facebook OAuth system
router.get('/instagram', (req, res) => {
  try {
    if (!process.env.INSTAGRAM_APP_ID || !process.env.INSTAGRAM_APP_SECRET) {
      return res.status(503).json({ 
        success: false,
        message: 'Instagram OAuth is not configured. Please set INSTAGRAM_APP_ID and INSTAGRAM_APP_SECRET in your environment variables.',
        configured: false
      });
    }

    const redirectUri = encodeURIComponent(process.env.INSTAGRAM_REDIRECT_URI || `http://localhost:5050/api/auth/instagram/callback`);
    const scope = 'user_profile,user_media';
    const authUrl = `https://api.instagram.com/oauth/authorize?client_id=${process.env.INSTAGRAM_APP_ID}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code`;

    res.json({ 
      success: true,
      authUrl,
      configured: true
    });
  } catch (error) {
    console.error('Instagram OAuth URL generation error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error generating Instagram OAuth URL',
      error: error.message
    });
  }
});

// Check Instagram OAuth configuration status
router.get('/instagram/status', (req, res) => {
  const isConfigured = !!(process.env.INSTAGRAM_APP_ID && process.env.INSTAGRAM_APP_SECRET);
  res.json({
    configured: isConfigured,
    hasAppId: !!process.env.INSTAGRAM_APP_ID,
    hasAppSecret: !!process.env.INSTAGRAM_APP_SECRET,
    redirectUri: process.env.INSTAGRAM_REDIRECT_URI || `http://localhost:5050/api/auth/instagram/callback`
  });
});

// Instagram OAuth - Callback handler
router.get('/instagram/callback', async (req, res) => {
  try {
    if (!process.env.INSTAGRAM_APP_ID || !process.env.INSTAGRAM_APP_SECRET) {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/store.html?error=oauth_not_configured`);
    }

    const { code, error } = req.query;

    if (error) {
      console.error('Instagram OAuth error:', error);
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/store.html?error=oauth_failed`);
    }

    if (!code) {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/store.html?error=oauth_failed`);
    }

    const redirectUri = process.env.INSTAGRAM_REDIRECT_URI || `http://localhost:5050/api/auth/instagram/callback`;

    // Exchange code for access token
    try {
      const tokenResponse = await axios.post('https://api.instagram.com/oauth/access_token', null, {
        params: {
          client_id: process.env.INSTAGRAM_APP_ID,
          client_secret: process.env.INSTAGRAM_APP_SECRET,
          grant_type: 'authorization_code',
          redirect_uri: redirectUri,
          code: code
        }
      });

      const accessToken = tokenResponse.data.access_token;
      const instagramId = tokenResponse.data.user_id;

      if (!accessToken || !instagramId) {
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/store.html?error=oauth_failed`);
      }

      // Get user info from Instagram
      try {
        const userResponse = await axios.get('https://graph.instagram.com/me', {
          params: {
            fields: 'id,username',
            access_token: accessToken
          }
        });

        const userData = userResponse.data;
        const username = userData.username;
        const fullName = username || `Instagram User ${instagramId.substring(0, 8)}`;

        // Instagram doesn't provide email, so we'll use a placeholder
        const email = null;

        // Handle user creation/login
        await handleOAuthUser('instagram', instagramId, email, fullName, null, res);

      } catch (userError) {
        console.error('Instagram user info error:', userError.response?.data || userError.message);
        // Still proceed with basic info
        const fullName = `Instagram User ${instagramId.substring(0, 8)}`;
        await handleOAuthUser('instagram', instagramId, null, fullName, null, res);
      }

    } catch (error) {
      console.error('Instagram OAuth token exchange error:', error.response?.data || error.message);
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/store.html?error=oauth_failed`);
    }

  } catch (error) {
    console.error('Instagram OAuth callback error:', error);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/store.html?error=oauth_error`);
  }
});

// ==================== UNIFIED OAUTH STATUS ====================

// Get status of all OAuth providers
router.get('/status', (req, res) => {
  res.json({
    google: {
      configured: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
      hasClientId: !!process.env.GOOGLE_CLIENT_ID,
      hasClientSecret: !!process.env.GOOGLE_CLIENT_SECRET
    },
    facebook: {
      configured: !!(process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET),
      hasAppId: !!process.env.FACEBOOK_APP_ID,
      hasAppSecret: !!process.env.FACEBOOK_APP_SECRET
    },
    instagram: {
      configured: !!(process.env.INSTAGRAM_APP_ID && process.env.INSTAGRAM_APP_SECRET),
      hasAppId: !!process.env.INSTAGRAM_APP_ID,
      hasAppSecret: !!process.env.INSTAGRAM_APP_SECRET
    }
  });
});

module.exports = router;

