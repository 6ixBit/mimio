# Stripe Integration Setup Guide

## Required Environment Variables

Add these to your `.env.local` file:

```bash
# Stripe Keys (get from Stripe Dashboard)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Product Price IDs (create these in Stripe Dashboard)
STRIPE_STARTER_PRICE_ID=price_...
STRIPE_SCALER_PRICE_ID=price_...
STRIPE_PRO_PRICE_ID=price_...

# Supabase (you should already have these)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Stripe Dashboard Setup

### 1. Create Products and Prices

In your Stripe Dashboard:

1. Go to **Products** → **Add Product**

2. Create these 3 products:

   **Starter Plan**

   - Name: "Mimio Starter"
   - Price: $19.99/month (recurring)
   - Copy the Price ID to `STRIPE_STARTER_PRICE_ID`

   **Scaler Plan**

   - Name: "Mimio Scaler"
   - Price: $44.99/month (recurring)
   - Copy the Price ID to `STRIPE_SCALER_PRICE_ID`

   **Pro Plan**

   - Name: "Mimio Pro"
   - Price: $89.99/month (recurring)
   - Copy the Price ID to `STRIPE_PRO_PRICE_ID`

### 2. Configure Webhooks

1. Go to **Developers** → **Webhooks** → **Add endpoint**

2. Set endpoint URL to: `https://yourdomain.com/api/stripe/webhook`

3. Select these events:

   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

4. Copy the webhook signing secret to `STRIPE_WEBHOOK_SECRET`

### 3. Enable Customer Portal

1. Go to **Settings** → **Billing** → **Customer portal**
2. Enable the customer portal
3. Configure allowed actions:
   - Update payment method
   - View billing history
   - Cancel subscription

## Database Migration

Run the subscription schema migration:

```bash
# Apply the migration to your Supabase database
supabase db push
```

Or manually run the SQL from `supabase/migrations/007_subscriptions_schema.sql`

## Testing

### Test Mode

- Use Stripe test keys during development
- Test card: `4242 4242 4242 4242`
- Any future expiry date and CVC

### Production

- Switch to live keys when ready to accept real payments
- Update webhook endpoint to production URL
- Test the full flow before launch

## Features Implemented

✅ **Subscription Management**

- 4 tiers: Free, Starter ($19.99), Scaler ($44.99), Pro ($89.99)
- Stripe Checkout integration
- Customer portal for self-service
- Automatic plan upgrades/downgrades

✅ **Usage Tracking**

- Monthly usage limits per plan
- Automatic usage increment
- Usage-based feature gating

✅ **Webhook Handling**

- Real-time subscription updates
- Payment success/failure tracking
- Automatic plan changes

✅ **Security**

- Row Level Security (RLS) policies
- Service role for webhook operations
- Secure customer data handling

## Usage in Code

### Check if user can generate video:

```typescript
import { subscriptionApi } from "@/lib/subscription-api";

const canGenerate = await subscriptionApi.canUseResource(
  userId,
  "video_generations"
);
if (canGenerate) {
  // Allow video generation
  await subscriptionApi.incrementUsage(userId, "video_generations");
} else {
  // Show upgrade prompt
}
```

### Get current subscription:

```typescript
const subscription = await subscriptionApi.getCurrentSubscription(userId);
console.log("Current plan:", subscription?.subscription_plans?.name);
```

## Next Steps

1. Add environment variables to your deployment (Vercel/Netlify)
2. Create Stripe products and get Price IDs
3. Set up webhook endpoint
4. Test the complete flow
5. Add usage limits to video generation endpoints
6. Add subscription checks to premium features
