const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { OAuth2Client } = require('google-auth-library');
const { validateRegister, validateLogin } = require('../middleware/validator');
const { authLimiter } = require('../middleware/rateLimiter');
const router = express.Router();

// Initialize Google OAuth Client (only if credentials are provided)
let googleClient = null;
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  googleClient = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5050/api/auth/google/callback'
  );
  console.log('Google OAuth initialized successfully');
} else {
  console.warn('Google OAuth not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to enable Google Sign-In.');
}

// User Registration
router.post('/register', validateRegister, async (req, res) => {
  try {
    const { username, email, password, fullName } = req.body;

    // Validation
    if (!username || !email || !password || !fullName) {
      return res.status(400).json({ 
        message: 'All fields are required' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        message: 'Password must be at least 6 characters long' 
      });
    }

    // Check if user already exists
    db.get('SELECT id FROM users WHERE username = ? OR email = ?', [username, email], async (err, user) => {
      if (err) {
        return res.status(500).json({ message: 'Database error' });
      }

      if (user) {
        return res.status(400).json({ 
          message: 'Username or email already exists' 
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create user
      db.run('INSERT INTO users (username, email, password, full_name) VALUES (?, ?, ?, ?)', 
        [username, email, hashedPassword, fullName], function(err) {
        if (err) {
          return res.status(500).json({ message: 'Error creating user' });
        }

        // Generate JWT token
        const token = jwt.sign(
          { userId: this.lastID, username, email },
          process.env.JWT_SECRET || 'your-secret-key',
          { expiresIn: '7d' }
        );

        // Send welcome email
        const { sendWelcomeEmail } = require('../utils/email');
        sendWelcomeEmail(email, fullName || username).catch(err => {
          console.error('Error sending welcome email:', err);
        });

        res.status(201).json({
          message: 'User registered successfully',
          token,
          user: {
            id: this.lastID,
            username,
            email,
            fullName
          }
        });
      });
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// User Login
router.post('/login', validateLogin, async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validation
    if (!username || !password) {
      return res.status(400).json({ 
        message: 'Username and password are required' 
      });
    }

    // Find user
    db.get('SELECT * FROM users WHERE username = ? OR email = ?', [username, username], async (err, user) => {
      if (err) {
        return res.status(500).json({ message: 'Database error' });
      }

      if (!user) {
        return res.status(401).json({ 
          message: 'Invalid credentials' 
        });
      }

      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ 
          message: 'Invalid credentials' 
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, username: user.username, email: user.email },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      );

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          fullName: user.full_name
        }
      });
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current user profile
router.get('/profile', authenticateToken, (req, res) => {
  try {
    db.get('SELECT id, username, email, full_name, created_at FROM users WHERE id = ?', 
      [req.user.userId], (err, user) => {
      if (err) {
        return res.status(500).json({ message: 'Database error' });
      }

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json({ user });
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { fullName, email } = req.body;

    if (!fullName || !email) {
      return res.status(400).json({ 
        message: 'Full name and email are required' 
      });
    }

    db.run('UPDATE users SET full_name = ?, email = ? WHERE id = ?', 
      [fullName, email, req.user.userId], function(err) {
      if (err) {
        return res.status(500).json({ message: 'Error updating profile' });
      }

      res.json({ message: 'Profile updated successfully' });
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Change password
router.put('/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        message: 'Current and new password are required' 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        message: 'New password must be at least 6 characters long' 
      });
    }

    // Get current user
    db.get('SELECT password FROM users WHERE id = ?', [req.user.userId], async (err, user) => {
      if (err) {
        return res.status(500).json({ message: 'Database error' });
      }

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Verify current password
      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ 
          message: 'Current password is incorrect' 
        });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 12);

      // Update password
      db.run('UPDATE users SET password = ? WHERE id = ?', 
        [hashedPassword, req.user.userId], function(err) {
        if (err) {
          return res.status(500).json({ message: 'Error updating password' });
        }

        res.json({ message: 'Password changed successfully' });
      });
    });

  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Google OAuth - Get authentication URL
router.get('/google', (req, res) => {
  try {
    if (!googleClient || !process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      return res.status(503).json({ 
        success: false,
        message: 'Google OAuth is not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your environment variables.',
        configured: false
      });
    }

    const scopes = [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile'
    ];

    const authUrl = googleClient.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent'
    });

    res.json({ 
      success: true,
      authUrl,
      configured: true
    });
  } catch (error) {
    console.error('Google OAuth URL generation error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error generating Google OAuth URL',
      error: error.message
    });
  }
});

// Check Google OAuth configuration status
router.get('/google/status', (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5050/api/auth/google/callback';
  
  const isConfigured = !!(clientId && clientSecret);
  const isValidClientId = clientId && clientId.includes('.apps.googleusercontent.com');
  
  res.json({
    configured: isConfigured,
    hasClientId: !!clientId,
    hasClientSecret: !!clientSecret,
    isValidClientId: isValidClientId,
    redirectUri: redirectUri,
    clientIdFormat: clientId ? (isValidClientId ? 'valid' : 'invalid - should end with .apps.googleusercontent.com') : 'not set',
    message: !isConfigured 
      ? 'Google OAuth is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in environment variables.'
      : !isValidClientId
      ? 'Client ID format appears invalid. Should end with .apps.googleusercontent.com'
      : 'Google OAuth is configured correctly. Make sure redirect URI matches Google Cloud Console.'
  });
});

// Google OAuth - Callback handler
router.get('/google/callback', async (req, res) => {
  try {
    if (!googleClient || !process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/store.html?error=oauth_not_configured`);
    }

    const { code } = req.query;

    if (!code) {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/store.html?error=oauth_failed`);
    }

    // Exchange code for tokens
    let tokens;
    try {
      const tokenResponse = await googleClient.getToken(code);
      tokens = tokenResponse.tokens;
      googleClient.setCredentials(tokens);
    } catch (tokenError) {
      console.error('Error exchanging code for tokens:', tokenError.message);
      if (tokenError.message.includes('invalid_client')) {
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/store.html?error=oauth_invalid_client`);
      }
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/store.html?error=oauth_token_exchange_failed`);
    }

    // Get user info from Google using ID token
    if (!tokens.id_token) {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/store.html?error=oauth_failed`);
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const googleId = payload.sub;
    const email = payload.email;
    const fullName = payload.name;
    const profilePicture = payload.picture;

    if (!email) {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/store.html?error=no_email`);
    }

    // Check if user exists
    db.get('SELECT * FROM users WHERE email = ? OR google_id = ?', [email, googleId], async (err, existingUser) => {
      if (err) {
        console.error('Database error:', err);
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/store.html?error=database_error`);
      }

      if (existingUser) {
        // Update existing user with Google info if needed
        if (!existingUser.google_id) {
          db.run('UPDATE users SET google_id = ?, auth_provider = ?, profile_picture = ? WHERE id = ?',
            [googleId, 'google', profilePicture || null, existingUser.id]);
        } else if (profilePicture && !existingUser.profile_picture) {
          db.run('UPDATE users SET profile_picture = ? WHERE id = ?', [profilePicture, existingUser.id]);
        }
        
        // Generate JWT token for existing user
        const token = jwt.sign(
          { userId: existingUser.id, email: existingUser.email, authProvider: 'google' },
          process.env.JWT_SECRET || 'your-secret-key',
          { expiresIn: '7d' }
        );

        // Redirect to frontend with token
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/store.html?token=${token}&email=${encodeURIComponent(existingUser.email)}&name=${encodeURIComponent(existingUser.full_name || existingUser.username || existingUser.email)}`);
      } else {
        // Create new user
        const username = email.split('@')[0]; // Use email prefix as username
        db.run(
          'INSERT INTO users (email, username, full_name, auth_provider, google_id, profile_picture, is_verified) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [email, username, fullName || username, 'google', googleId, profilePicture || null, 1],
          function(insertErr) {
            if (insertErr) {
              console.error('Error creating user:', insertErr);
              return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/store.html?error=user_creation_failed`);
            }
            
            // Generate JWT token
            const token = jwt.sign(
              { userId: this.lastID, email, authProvider: 'google' },
              process.env.JWT_SECRET || 'your-secret-key',
              { expiresIn: '7d' }
            );

            // Redirect to frontend with token
            return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/store.html?token=${token}&email=${encodeURIComponent(email)}&name=${encodeURIComponent(fullName || username)}`);
          }
        );
      }
    });

  } catch (error) {
    console.error('Google OAuth callback error:', error);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/store.html?error=oauth_error`);
  }
});

// Middleware to authenticate JWT token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

module.exports = router;
