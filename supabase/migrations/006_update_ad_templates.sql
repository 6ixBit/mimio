-- Update ad_templates table to match our needs
ALTER TABLE ad_templates
DROP COLUMN IF EXISTS duration; -- Remove unused column

ALTER TABLE ad_templates
ADD COLUMN IF NOT EXISTS duration_seconds INTEGER DEFAULT 8;

-- Update video_type constraint to allow more types
ALTER TABLE ad_templates
DROP CONSTRAINT IF EXISTS valid_video_type;

ALTER TABLE ad_templates
ADD CONSTRAINT valid_video_type 
CHECK (video_type IN ('POV', 'Review', 'Unboxing', 'Tutorial', 'Showcase', 'Demo', 'UGC'));

-- Add RLS policy to allow authenticated users to create templates
DROP POLICY IF EXISTS "Authenticated users can create templates" ON ad_templates;
CREATE POLICY "Authenticated users can create templates"
ON ad_templates FOR INSERT
WITH CHECK (auth.role() = 'authenticated');
