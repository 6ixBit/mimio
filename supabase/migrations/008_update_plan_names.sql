-- Update subscription plan names to match Stripe products
-- This updates the existing data to match: Starter, Scaler, Pro

-- Update the 'pro' plan to be 'scaler' (middle tier)
UPDATE subscription_plans 
SET 
  name = 'scaler',
  display_name = 'Scaler',
  price_monthly = 44.99,
  features = '{"watermark": false, "support": "priority", "analytics": "advanced", "processing": "priority", "sora_pro": true}',
  limits = '{"video_generations": 100, "templates": "all", "processing": "priority"}'
WHERE name = 'pro';

-- Update the 'enterprise' plan to be 'pro' (top tier)  
UPDATE subscription_plans 
SET 
  name = 'pro',
  display_name = 'Pro',
  price_monthly = 89.99,
  features = '{"watermark": false, "support": "dedicated", "analytics": "advanced", "processing": "priority", "sora_pro": true, "api_access": true, "white_label": true, "custom_templates": true}',
  limits = '{"video_generations": -1, "templates": "all", "processing": "priority"}'
WHERE name = 'enterprise';

-- Delete the old enterprise plan if it exists (since we renamed it to pro)
DELETE FROM subscription_plans WHERE name = 'enterprise';

-- Insert the new scaler plan if it doesn't exist
INSERT INTO subscription_plans (name, display_name, price_monthly, features, limits) 
SELECT 'scaler', 'Scaler', 44.99,
       '{"watermark": false, "support": "priority", "analytics": "advanced", "processing": "priority", "sora_pro": true}',
       '{"video_generations": 100, "templates": "all", "processing": "priority"}'
WHERE NOT EXISTS (SELECT 1 FROM subscription_plans WHERE name = 'scaler');
