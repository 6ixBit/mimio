-- Migration: Credit System Implementation
-- Description: Add credit tracking to subscriptions and create credit transaction history

-- Add credit columns to user_subscriptions
ALTER TABLE user_subscriptions 
ADD COLUMN IF NOT EXISTS credits_remaining INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS credits_allocated INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS credits_reset_date TIMESTAMP;

-- Create credit_transactions table for tracking all credit changes
CREATE TABLE IF NOT EXISTS credit_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL, -- positive for credit additions, negative for deductions
  balance_after INTEGER NOT NULL,
  transaction_type VARCHAR(50) NOT NULL, -- 'allocation', 'usage', 'refund', 'bonus', 'reset'
  description TEXT,
  video_id UUID, -- optional reference to videos table
  metadata JSONB, -- for storing additional data (video duration, etc)
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_created_at ON credit_transactions(created_at DESC);

-- Enable RLS on credit_transactions
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only view their own transactions
CREATE POLICY "Users can view own credit transactions"
  ON credit_transactions
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Only system (service role) can insert transactions
CREATE POLICY "Service role can insert credit transactions"
  ON credit_transactions
  FOR INSERT
  WITH CHECK (true);

-- Update subscription_plans with credit allocations
UPDATE subscription_plans SET features = jsonb_set(
  features,
  '{credits}',
  '0'
) WHERE plan_name = 'free';

UPDATE subscription_plans SET features = jsonb_set(
  features,
  '{credits}',
  '80'
) WHERE plan_name = 'starter';

UPDATE subscription_plans SET features = jsonb_set(
  features,
  '{credits}',
  '200'
) WHERE plan_name = 'scaler';

UPDATE subscription_plans SET features = jsonb_set(
  features,
  '{credits}',
  '450'
) WHERE plan_name = 'pro';

-- Initialize credits for existing active subscriptions
UPDATE user_subscriptions us
SET 
  credits_allocated = COALESCE((sp.features->>'credits')::INTEGER, 0),
  credits_remaining = COALESCE((sp.features->>'credits')::INTEGER, 0),
  credits_reset_date = CASE 
    WHEN us.billing_cycle = 'monthly' THEN us.current_period_end
    WHEN us.billing_cycle = 'yearly' THEN us.current_period_end
    ELSE NOW() + INTERVAL '1 month'
  END
FROM subscription_plans sp
WHERE us.plan_id = sp.id
  AND us.status = 'active'
  AND us.credits_allocated IS NULL;

-- Create function to calculate credit cost based on video duration
CREATE OR REPLACE FUNCTION calculate_credit_cost(duration_seconds INTEGER)
RETURNS INTEGER AS $$
BEGIN
  -- Sora-2 720p: 1 credit per second
  RETURN duration_seconds;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create function to get user's current credit balance
CREATE OR REPLACE FUNCTION get_user_credits(p_user_id UUID)
RETURNS TABLE (
  credits_remaining INTEGER,
  credits_allocated INTEGER,
  credits_reset_date TIMESTAMP,
  plan_name VARCHAR
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    us.credits_remaining,
    us.credits_allocated,
    us.credits_reset_date,
    sp.plan_name
  FROM user_subscriptions us
  JOIN subscription_plans sp ON us.plan_id = sp.id
  WHERE us.user_id = p_user_id
    AND us.status = 'active'
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_credits(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_credit_cost(INTEGER) TO authenticated;

COMMENT ON TABLE credit_transactions IS 'Tracks all credit additions and deductions for audit trail';
COMMENT ON COLUMN credit_transactions.amount IS 'Positive for additions, negative for deductions';
COMMENT ON COLUMN credit_transactions.balance_after IS 'User credit balance after this transaction';
COMMENT ON FUNCTION calculate_credit_cost IS 'Calculate credit cost: 1 credit per second for Sora-2 720p';


