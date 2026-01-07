# Video Editing Store - Modules Documentation

This document describes all the modules and features available in the Video Editing Store application.

## 📦 Available Modules

### 1. **Analytics Module** (`/api/analytics`)
Track and analyze store performance, user behavior, and sales metrics.

**Endpoints:**
- `GET /api/analytics/dashboard` - Get dashboard statistics (admin only)
- `POST /api/analytics/track` - Track custom events (public)
- `GET /api/analytics/user-stats` - Get user statistics (authenticated)

**Features:**
- Total users, projects, downloads, purchases
- Revenue tracking
- Recent activity feed
- Top products by downloads and sales
- User-specific statistics

### 2. **Wishlist Module** (`/api/wishlist`)
Allow users to save favorite items for later purchase.

**Endpoints:**
- `GET /api/wishlist` - Get user's wishlist (authenticated)
- `POST /api/wishlist/add/:projectId` - Add item to wishlist (authenticated)
- `DELETE /api/wishlist/remove/:projectId` - Remove item from wishlist (authenticated)
- `GET /api/wishlist/check/:projectId` - Check if item is in wishlist (authenticated)

**Features:**
- Save favorite templates and projects
- Quick access to saved items
- Remove items from wishlist

### 3. **Newsletter Module** (`/api/newsletter`)
Manage email subscriptions for marketing and updates.

**Endpoints:**
- `POST /api/newsletter/subscribe` - Subscribe to newsletter (public)
- `POST /api/newsletter/unsubscribe` - Unsubscribe from newsletter (public)
- `GET /api/newsletter/subscribers` - Get all subscribers (admin)

**Features:**
- Email subscription management
- Subscription status tracking
- Unsubscribe functionality

### 4. **Coupons Module** (`/api/coupons`)
Create and manage discount codes for promotions.

**Endpoints:**
- `POST /api/coupons/validate` - Validate coupon code (public)
- `POST /api/coupons/apply` - Apply coupon to purchase (authenticated)
- `GET /api/coupons` - Get all coupons (admin)
- `POST /api/coupons` - Create new coupon (admin)
- `PUT /api/coupons/:id` - Update coupon (admin)
- `DELETE /api/coupons/:id` - Delete coupon (admin)

**Features:**
- Percentage or fixed amount discounts
- Usage limits
- Validity dates
- Minimum purchase requirements
- Maximum discount caps

### 5. **User Dashboard Module** (`/api/user`)
User profile and account management.

**Endpoints:**
- `GET /api/user/dashboard` - Get user dashboard data (authenticated)
- `GET /api/user/notifications` - Get user notifications (authenticated)
- `PUT /api/user/notifications/:id/read` - Mark notification as read (authenticated)
- `PUT /api/user/notifications/read-all` - Mark all notifications as read (authenticated)

**Features:**
- Purchase history
- Download history
- Wishlist count
- User statistics
- Notification management

### 6. **Email Notification Module** (`backend/utils/email.js`)
Send automated emails for various events.

**Functions:**
- `sendWelcomeEmail()` - Welcome new users
- `sendPurchaseConfirmationEmail()` - Confirm purchases
- `sendNewsletterEmail()` - Send newsletter updates

**Configuration:**
Set `EMAIL_USER` and `EMAIL_PASS` in environment variables.

## 🗄️ Database Schema

### New Tables Added:

1. **wishlist** - User favorite items
2. **newsletter** - Email subscriptions
3. **coupons** - Discount codes
4. **coupon_usage** - Coupon usage tracking
5. **analytics** - Event tracking
6. **contacts** - Contact form submissions
7. **notifications** - User notifications

### Enhanced Tables:

1. **projects** - Added `view_count` and `updated_at`
2. **users** - Added `is_active` and `last_login`
3. **purchases** - Added `stripe_session_id`
4. **reviews** - Added `project_id` and `user_id` foreign keys

## 🚀 Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

This will install `nodemailer` and other required packages.

### 2. Database Setup

The database is automatically initialized when the server starts. All tables are created automatically.

To manually set up the database:

```bash
node backend/scripts/setup-database.js
```

### 3. Environment Variables

Update `backend/env.development` or `backend/env.production`:

```env
# Email Configuration (optional)
EMAIL_USER=your-email@example.com
EMAIL_PASS=your-app-password

# Server Configuration
PORT=5050
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key
STRIPE_SECRET_KEY=your-stripe-secret-key

# Database
DB_PATH=./database.sqlite

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### 4. Start the Server

```bash
cd backend
npm start
```

## 📝 API Usage Examples

### Add Item to Wishlist

```javascript
fetch('http://localhost:5050/api/wishlist/add/1', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### Validate Coupon

```javascript
fetch('http://localhost:5050/api/coupons/validate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    code: 'SAVE20',
    amount: 100
  })
});
```

### Subscribe to Newsletter

```javascript
fetch('http://localhost:5050/api/newsletter/subscribe', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'user@example.com',
    name: 'John Doe'
  })
});
```

### Get User Dashboard

```javascript
fetch('http://localhost:5050/api/user/dashboard', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### Track Analytics Event

```javascript
fetch('http://localhost:5050/api/analytics/track', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}` // Optional
  },
  body: JSON.stringify({
    eventType: 'page_view',
    eventData: { page: 'store' },
    projectId: 1
  })
});
```

## 🔒 Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## 📊 Features Summary

✅ **Analytics & Statistics** - Track sales, downloads, and user behavior  
✅ **Wishlist** - Save favorite items  
✅ **Newsletter** - Email subscription management  
✅ **Coupons** - Discount code system  
✅ **User Dashboard** - Profile and order history  
✅ **Email Notifications** - Automated email sending  
✅ **Enhanced Search** - Advanced filtering and sorting  
✅ **Contact Management** - Store contact form submissions  
✅ **Notifications** - User notification system  

## 🎯 Next Steps

1. Integrate wishlist UI in the store frontend
2. Add coupon code input in checkout
3. Create user dashboard page
4. Add newsletter subscription form
5. Implement analytics dashboard in admin panel

## 📞 Support

For issues or questions, check the main README.md or review the code comments in each module.

