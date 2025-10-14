-- Migration: Fix Template Categories (Safe version)
-- Description: Add support for public templates (admin-curated) and user custom collections

-- Add columns to ad_templates for categorization (IF NOT EXISTS)
ALTER TABLE ad_templates 
ADD COLUMN IF NOT EXISTS category VARCHAR(20) DEFAULT 'public',
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false;

-- Update video_type constraint to include Memes
ALTER TABLE ad_templates
DROP CONSTRAINT IF EXISTS valid_video_type;

ALTER TABLE ad_templates
ADD CONSTRAINT valid_video_type
CHECK (video_type IN ('POV', 'Review', 'Unboxing', 'Tutorial', 'Showcase', 'Demo', 'UGC', 'Memes'));

-- Create user_saved_templates table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_saved_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES ad_templates(id) ON DELETE CASCADE,
  saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure a user can't save the same template twice
  UNIQUE(user_id, template_id)
);

-- Create indexes for better performance (IF NOT EXISTS)
CREATE INDEX IF NOT EXISTS idx_ad_templates_category ON ad_templates(category);
CREATE INDEX IF NOT EXISTS idx_ad_templates_is_public ON ad_templates(is_public);
CREATE INDEX IF NOT EXISTS idx_ad_templates_created_by ON ad_templates(created_by);
CREATE INDEX IF NOT EXISTS idx_user_saved_templates_user_id ON user_saved_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_user_saved_templates_template_id ON user_saved_templates(template_id);

-- Enable RLS on user_saved_templates
ALTER TABLE user_saved_templates ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist, then recreate them
DROP POLICY IF EXISTS "Users can view own saved templates" ON user_saved_templates;
DROP POLICY IF EXISTS "Users can save templates" ON user_saved_templates;
DROP POLICY IF EXISTS "Users can remove saved templates" ON user_saved_templates;

-- RLS Policy: Users can only view their own saved templates
CREATE POLICY "Users can view own saved templates"
  ON user_saved_templates
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Users can save templates to their collection
CREATE POLICY "Users can save templates"
  ON user_saved_templates
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can remove templates from their collection
CREATE POLICY "Users can remove saved templates"
  ON user_saved_templates
  FOR DELETE
  USING (auth.uid() = user_id);

-- Update existing templates to be public by default (only if is_public is null or false)
UPDATE ad_templates 
SET 
  is_public = true,
  category = 'public'
WHERE is_public IS NULL OR (is_public = false AND created_by IS NULL);

-- Drop and recreate the function to get user's custom templates
DROP FUNCTION IF EXISTS get_user_custom_templates(UUID);

CREATE FUNCTION get_user_custom_templates(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  original_video_url TEXT,
  video_type TEXT,
  video_prompt TEXT,
  thumbnail_url TEXT,
  duration_seconds INTEGER,
  model TEXT,
  size TEXT,
  is_active BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  category TEXT,
  created_by UUID,
  is_public BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  -- Templates created by user
  SELECT 
    t.id,
    t.title,
    t.description,
    t.original_video_url,
    t.video_type,
    t.video_prompt,
    t.thumbnail_url,
    t.duration_seconds,
    t.model,
    t.size,
    t.is_active,
    t.created_at,
    t.updated_at,
    t.category,
    t.created_by,
    t.is_public
  FROM ad_templates t
  WHERE t.created_by = p_user_id
    AND t.is_active = true
  
  UNION ALL
  
  -- Templates saved by user (but not created by them)
  SELECT 
    t.id,
    t.title,
    t.description,
    t.original_video_url,
    t.video_type,
    t.video_prompt,
    t.thumbnail_url,
    t.duration_seconds,
    t.model,
    t.size,
    t.is_active,
    t.created_at,
    t.updated_at,
    t.category,
    t.created_by,
    t.is_public
  FROM ad_templates t
  JOIN user_saved_templates ust ON t.id = ust.template_id
  WHERE ust.user_id = p_user_id
    AND t.is_active = true
    AND (t.created_by IS NULL OR t.created_by != p_user_id) -- Don't duplicate user's own templates
  
  ORDER BY created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_custom_templates(UUID) TO authenticated;

COMMENT ON TABLE user_saved_templates IS 'User collections of saved ad templates';
COMMENT ON COLUMN ad_templates.category IS 'Template category: public (admin-curated) or custom (user-created)';
COMMENT ON COLUMN ad_templates.is_public IS 'Whether template appears in public gallery';
COMMENT ON FUNCTION get_user_custom_templates IS 'Get all templates in user custom collection (created + saved)';

