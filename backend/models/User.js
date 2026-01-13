const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    trim: true,
    sparse: true // Allows multiple null values
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    // Password not required for OAuth users
  },
  full_name: {
    type: String,
    trim: true
  },
  auth_provider: {
    type: String,
    enum: ['local', 'google', 'facebook', 'instagram'],
    default: 'local'
  },
  google_id: {
    type: String,
    unique: true,
    sparse: true
  },
  facebook_id: {
    type: String,
    unique: true,
    sparse: true
  },
  instagram_id: {
    type: String,
    unique: true,
    sparse: true
  },
  profile_picture: {
    type: String
  },
  is_verified: {
    type: Boolean,
    default: false
  },
  is_active: {
    type: Boolean,
    default: true
  },
  last_login: {
    type: Date
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Removed duplicate indexes
// userSchema.index({ email: 1 });
// userSchema.index({ google_id: 1 });
// userSchema.index({ facebook_id: 1 });
// userSchema.index({ instagram_id: 1 });
// userSchema.index({ username: 1 });

// Virtual for formatted dates
userSchema.virtual('created_at').get(function() {
  return this.createdAt;
});

module.exports = mongoose.model('User', userSchema);

