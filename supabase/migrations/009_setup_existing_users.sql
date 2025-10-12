-- Setup existing users with default subscriptions
-- This migration handles users who existed before the subscription system

-- First, get the free plan ID
DO $$
DECLARE
    free_plan_id UUID;
    pro_plan_id UUID;
BEGIN
    -- Get plan IDs
    SELECT id INTO free_plan_id FROM subscription_plans WHERE name = 'free';
    SELECT id INTO pro_plan_id FROM subscription_plans WHERE name = 'pro';
    
    -- Create free subscriptions for all existing users who don't have a subscription
    INSERT INTO user_subscriptions (user_id, plan_id, status, created_at, updated_at)
    SELECT 
        auth.users.id,
        free_plan_id,
        'active',
        NOW(),
        NOW()
    FROM auth.users
    WHERE auth.users.id NOT IN (
        SELECT user_id FROM user_subscriptions WHERE status = 'active'
    );
    
    -- Optional: Give specific users (like yourself) a Pro subscription
    -- Replace 'your-user-id-here' with your actual Supabase user ID
    -- You can find your user ID by running: SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';
    
    /*
    -- Uncomment and update this section with your user ID:
    UPDATE user_subscriptions 
    SET plan_id = pro_plan_id, updated_at = NOW()
    WHERE user_id = 'your-user-id-here' AND status = 'active';
    */
    
END $$;
