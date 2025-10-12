-- Subscriptions and payments schema for Stripe integration

-- Create subscription plans table
CREATE TABLE subscription_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE, -- 'free', 'starter', 'pro', 'enterprise'
    display_name TEXT NOT NULL, -- 'Free', 'Starter', 'Pro', 'Enterprise'
    price_monthly DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    stripe_price_id TEXT, -- Stripe price ID for paid plans
    stripe_product_id TEXT, -- Stripe product ID
    features JSONB NOT NULL DEFAULT '{}', -- Plan features as JSON
    limits JSONB NOT NULL DEFAULT '{}', -- Usage limits as JSON
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user subscriptions table
CREATE TABLE user_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    plan_id UUID NOT NULL REFERENCES subscription_plans(id),
    stripe_customer_id TEXT, -- Stripe customer ID
    stripe_subscription_id TEXT, -- Stripe subscription ID
    status TEXT NOT NULL DEFAULT 'active', -- active, canceled, past_due, incomplete, etc.
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create usage tracking table
CREATE TABLE user_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    resource_type TEXT NOT NULL, -- 'video_generation', 'api_call', etc.
    count INTEGER NOT NULL DEFAULT 0,
    period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one usage record per user per resource per period
    UNIQUE(user_id, resource_type, period_start)
);

-- Create payment history table
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    subscription_id UUID REFERENCES user_subscriptions(id),
    stripe_payment_intent_id TEXT,
    stripe_invoice_id TEXT,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'usd',
    status TEXT NOT NULL, -- succeeded, failed, pending, etc.
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default subscription plans
INSERT INTO subscription_plans (name, display_name, price_monthly, features, limits) VALUES
('free', 'Free', 0.00, 
 '{"watermark": true, "support": "community", "analytics": "basic"}',
 '{"video_generations": 3, "templates": "basic", "processing": "standard"}'
),
('starter', 'Starter', 19.99,
 '{"watermark": true, "support": "email", "analytics": "basic", "processing": "standard"}',
 '{"video_generations": 25, "templates": "all", "processing": "standard"}'
),
('scaler', 'Scaler', 44.99,
 '{"watermark": false, "support": "priority", "analytics": "advanced", "processing": "priority", "sora_pro": true}',
 '{"video_generations": 100, "templates": "all", "processing": "priority"}'
),
('pro', 'Pro', 89.99,
 '{"watermark": false, "support": "dedicated", "analytics": "advanced", "processing": "priority", "sora_pro": true, "api_access": true, "white_label": true, "custom_templates": true}',
 '{"video_generations": -1, "templates": "all", "processing": "priority"}'
);

-- Create partial unique constraint to ensure one active subscription per user
CREATE UNIQUE INDEX idx_user_subscriptions_active_unique 
ON user_subscriptions(user_id) 
WHERE status = 'active';

-- Create indexes for better performance
CREATE INDEX idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_stripe_customer ON user_subscriptions(stripe_customer_id);
CREATE INDEX idx_user_subscriptions_stripe_subscription ON user_subscriptions(stripe_subscription_id);
CREATE INDEX idx_user_usage_user_resource ON user_usage(user_id, resource_type);
CREATE INDEX idx_user_usage_period ON user_usage(period_start, period_end);
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_stripe_payment_intent ON payments(stripe_payment_intent_id);

-- Enable Row Level Security (RLS)
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Subscription plans are readable by everyone (for pricing page)
CREATE POLICY "Subscription plans are viewable by everyone" ON subscription_plans
    FOR SELECT USING (is_active = true);

-- Users can only see their own subscriptions
CREATE POLICY "Users can view own subscriptions" ON user_subscriptions
    FOR SELECT USING (auth.uid()::text = user_id::text);

-- Users can only see their own usage
CREATE POLICY "Users can view own usage" ON user_usage
    FOR SELECT USING (auth.uid()::text = user_id::text);

-- Users can only see their own payments
CREATE POLICY "Users can view own payments" ON payments
    FOR SELECT USING (auth.uid()::text = user_id::text);

-- Service role can manage all records (for webhooks and admin operations)
CREATE POLICY "Service role can manage subscription plans" ON subscription_plans
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role can manage user subscriptions" ON user_subscriptions
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role can manage user usage" ON user_usage
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role can manage payments" ON payments
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');
