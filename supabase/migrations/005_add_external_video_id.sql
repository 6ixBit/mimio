-- Add external_video_id field to track the Sora API video ID for polling
ALTER TABLE videos 
ADD COLUMN IF NOT EXISTS external_video_id TEXT;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_videos_external_id ON videos(external_video_id);

-- Add progress field to track video generation progress (0-100)
ALTER TABLE videos 
ADD COLUMN IF NOT EXISTS progress INTEGER DEFAULT 0;

COMMENT ON COLUMN videos.external_video_id IS 'External video ID from Sora API for polling status';
COMMENT ON COLUMN videos.progress IS 'Video generation progress percentage (0-100)';

