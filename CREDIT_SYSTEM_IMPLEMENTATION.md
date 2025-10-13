# Credit System Implementation Summary

## ✅ Completed

### 1. Database Schema (Migration 010)

- Added credit tracking columns to `user_subscriptions`
- Created `credit_transactions` table for audit trail
- Updated subscription plans with credit allocations:
  - **Free**: 0 credits
  - **Basic** (Starter): 80 credits/month
  - **Pro** (Scaler): 200 credits/month
  - **Premium**: 450 credits/month
- Created helper functions for credit calculations

### 2. Credit Service (`lib/credit-service.ts`)

- `getUserCredits()` - Get current balance
- `hasEnoughCredits()` - Check if sufficient credits
- `deductCredits()` - Deduct with transaction record
- `addCredits()` - Add credits (refunds/bonuses)
- `getCreditTransactions()` - Get usage history
- `resetCreditsForRenewal()` - Monthly reset
- `calculateCreditCost()` - 1 credit per second

### 3. Pricing Updates

- Updated `lib/stripe.ts` with credit-based plans
- Renamed plans: Starter→Basic, Scaler→Pro, Pro→Premium
- Updated `PricingPlans` component to show credits prominently

## 🚧 In Progress / To Do

### 4. Credit Balance Display

- [ ] Add credit balance to dashboard header
- [ ] Show credits remaining in user menu
- [ ] Create credit usage progress bar

### 5. Video Generation Integration

- [ ] Check credits before video generation
- [ ] Deduct credits after successful generation
- [ ] Show credit cost before generation
- [ ] Handle insufficient credit errors

### 6. Stripe Webhook Updates

- [ ] Reset credits on subscription renewal
- [ ] Allocate credits on new subscription
- [ ] Handle failed payments (preserve credits?)

### 7. Credit History/Transactions

- [ ] Add transactions page to settings
- [ ] Show credit usage breakdown
- [ ] Export transaction history

### 8. Low Credit Alerts

- [ ] Warning at 20% remaining
- [ ] Critical alert at 10% remaining
- [ ] Email notifications for low credits

## Credit Costs

### OpenAI Sora API Pricing

- **sora-2** (720x1280 or 1280x720): **$0.10/second**
- **sora-2-pro** (720x1280 or 1280x720): $0.30/second ❌ Not offered (unprofitable)
- **sora-2-pro** (1024x1792 or 1792x1024): $0.50/second ❌ Not offered (unprofitable)

### Our Credit System (Sora-2 720p Only)

- **1 credit = 1 second** of Sora-2 720p video
- 4 seconds = 4 credits ($0.40 API cost)
- 8 seconds = 8 credits ($0.80 API cost)
- 12 seconds = 12 credits ($1.20 API cost)

### Pricing Breakdown & Margins

- **Basic ($19.99)**: 80 credits = ~10× 8sec videos
  - Max API cost: $8.00
  - Margin: **60%** ✅
- **Pro ($44.99)**: 200 credits = ~25× 8sec videos
  - Max API cost: $20.00
  - Margin: **56%** ✅
- **Premium ($89.99)**: 450 credits = ~56× 8sec videos
  - Max API cost: $45.00
  - Margin: **50%** ✅

### Why No Sora-2-Pro?

At 3-5x the cost per second, Sora-2-Pro would make our margins negative:

- 8sec video on sora-2-pro (720p): $2.40 API cost
- 8sec video on sora-2-pro (1024p): $4.00 API cost
- On our Basic plan: Would use 80 credits for only 3-8 videos ❌

## Usage

### To Run Migration

```sql
-- Run in Supabase SQL Editor
\i supabase/migrations/010_credit_system.sql
```

### Credit Service Examples

```typescript
import {
  getUserCredits,
  deductCredits,
  hasEnoughCredits,
} from "@/lib/credit-service";

// Check balance
const balance = await getUserCredits(userId);

// Check if enough credits
const check = await hasEnoughCredits(userId, 8); // 8 second video

// Deduct credits
const result = await deductCredits(
  userId,
  8,
  "Video generation: 8 seconds",
  videoId
);
```

## Next Steps

1. ✅ Run migration in Supabase
2. ✅ Update Stripe products with credit metadata
3. ⏳ Add credit display to UI
4. ⏳ Integrate with video generation
5. ⏳ Update Stripe webhooks
6. ⏳ Add credit alerts
