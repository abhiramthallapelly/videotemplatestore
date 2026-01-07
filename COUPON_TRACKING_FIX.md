# Coupon Usage Tracking Fix

## Issue
The coupon validation and apply endpoints were not tracking usage in the database. This meant:
- `used_count` in the `coupons` table was never incremented
- No records were created in the `coupon_usage` table for analytics
- Usage limits couldn't be properly enforced
- No way to track which users used which coupons

## Solution

### 1. Updated `/api/coupons/apply` Endpoint
- Added `recordCouponUsage()` helper function that:
  - Increments `used_count` in the `coupons` table
  - Records usage in the `coupon_usage` table with user_id, purchase_id, and discount_amount
- Usage is only recorded when `purchaseId` is provided (actual purchase, not just validation)
- Added duplicate usage check to prevent the same user from using a coupon multiple times

### 2. Updated `/api/store/purchase/:id` Endpoint
- Added support for `couponCode` parameter in purchase requests
- Validates and applies coupon before recording purchase
- Automatically records coupon usage when a purchase is completed with a coupon
- Returns discount information in the purchase response

### 3. New `/api/coupon-usage` Routes
Created new routes for coupon usage analytics:
- `GET /api/coupon-usage/stats` - Get overall coupon usage statistics (admin only)
- `GET /api/coupon-usage/my-usage` - Get user's own coupon usage history
- `GET /api/coupon-usage/coupon/:couponId` - Get usage details for a specific coupon (admin only)

## How It Works

### When a Coupon is Applied:
1. User calls `/api/coupons/apply` with `code`, `amount`, and optionally `purchaseId`
2. System validates the coupon (dates, limits, minimum purchase)
3. If `purchaseId` is provided, usage is recorded:
   - `coupons.used_count` is incremented
   - New record added to `coupon_usage` table

### When a Purchase is Made:
1. User calls `/api/store/purchase/:id` with optional `couponCode`
2. System validates and applies the coupon
3. Purchase is recorded with the discounted price
4. Coupon usage is automatically recorded:
   - `coupons.used_count` is incremented
   - New record added to `coupon_usage` table with purchase_id

## Database Schema

The `coupon_usage` table tracks:
- `coupon_id` - Which coupon was used
- `user_id` - Which user used it
- `purchase_id` - Which purchase it was applied to (nullable)
- `discount_amount` - How much discount was given
- `used_at` - Timestamp (auto-generated)

## Testing

### Test Coupon Application:
```bash
POST http://localhost:5050/api/coupons/apply
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "code": "SAVE20",
  "amount": 100,
  "purchaseId": 123
}
```

### Test Purchase with Coupon:
```bash
POST http://localhost:5050/api/store/purchase/1
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "couponCode": "SAVE20"
}
```

### Check Usage Statistics:
```bash
GET http://localhost:5050/api/coupon-usage/stats
Authorization: Bearer YOUR_ADMIN_TOKEN
```

## Benefits

✅ **Accurate Usage Tracking**: Every coupon application is now recorded
✅ **Usage Limit Enforcement**: System can properly check and enforce limits
✅ **Analytics**: Track which coupons are most popular and effective
✅ **User History**: Users can see their own coupon usage history
✅ **Admin Insights**: Admins can see detailed statistics and usage patterns

## Files Modified

- `backend/routes/coupons.js` - Added usage tracking to apply endpoint
- `backend/routes/store.js` - Added coupon support to purchase endpoint
- `backend/routes/couponUsage.js` - New file for usage analytics routes
- `backend/server.js` - Registered new coupon-usage routes

