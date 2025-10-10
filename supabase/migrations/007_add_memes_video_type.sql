-- Add "Memes" to the valid video types
ALTER TABLE ad_templates
DROP CONSTRAINT IF EXISTS valid_video_type;

ALTER TABLE ad_templates
ADD CONSTRAINT valid_video_type
CHECK (video_type IN ('POV', 'Review', 'Unboxing', 'Tutorial', 'Showcase', 'Demo', 'UGC', 'Memes'));
