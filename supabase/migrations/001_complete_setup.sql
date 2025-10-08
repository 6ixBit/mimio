-- =====================================================
-- MIMIO - Complete Database Setup
-- =====================================================
-- This script sets up the complete database schema including:
-- - Projects table
-- - Ad Templates table
-- - Videos table
-- - Row Level Security (RLS) policies
-- - Sample data
--
-- Authentication is handled by Supabase Auth automatically.
-- Users can sign up with email/password, and OAuth can be added later.
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLES
-- =====================================================

-- -----------------------------------------------------
-- Table: projects
-- Stores user projects for organizing videos
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    system_prompt TEXT, -- Context about the app/product for Sora generation
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT name_not_empty CHECK (length(trim(name)) > 0)
);

-- -----------------------------------------------------
-- Table: ad_templates
-- Archive of viral video templates
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS ad_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    original_video_url TEXT NOT NULL, -- URL to the original viral video
    video_type TEXT NOT NULL, -- POV, Review, Unboxing, Tutorial, Showcase, Demo
    video_prompt TEXT NOT NULL, -- The prompt to send to Sora to recreate this
    thumbnail_url TEXT,
    duration TEXT, -- e.g., "8s", "15s"
    model TEXT DEFAULT 'sora-2', -- sora-2, sora-2-pro
    size TEXT DEFAULT '720x1280', -- video dimensions
    seconds TEXT DEFAULT '8', -- duration in seconds
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT title_not_empty CHECK (length(trim(title)) > 0),
    CONSTRAINT video_prompt_not_empty CHECK (length(trim(video_prompt)) > 0),
    CONSTRAINT valid_video_type CHECK (video_type IN ('POV', 'Review', 'Unboxing', 'Tutorial', 'Showcase', 'Demo'))
);

-- -----------------------------------------------------
-- Table: videos
-- User-generated videos
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS videos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    template_id UUID REFERENCES ad_templates(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    video_url TEXT NOT NULL, -- URL to the generated video
    thumbnail_url TEXT,
    prompt TEXT NOT NULL, -- The actual prompt used for generation
    model TEXT NOT NULL, -- sora-2, sora-2-pro
    size TEXT NOT NULL, -- video dimensions
    duration_seconds INTEGER,
    status TEXT DEFAULT 'processing', -- processing, completed, failed
    views INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT title_not_empty CHECK (length(trim(title)) > 0),
    CONSTRAINT valid_status CHECK (status IN ('processing', 'completed', 'failed')),
    CONSTRAINT views_non_negative CHECK (views >= 0)
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Projects indexes
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC);

-- Videos indexes
CREATE INDEX IF NOT EXISTS idx_videos_user_id ON videos(user_id);
CREATE INDEX IF NOT EXISTS idx_videos_project_id ON videos(project_id);
CREATE INDEX IF NOT EXISTS idx_videos_template_id ON videos(template_id);
CREATE INDEX IF NOT EXISTS idx_videos_status ON videos(status);
CREATE INDEX IF NOT EXISTS idx_videos_created_at ON videos(created_at DESC);

-- Ad Templates indexes
CREATE INDEX IF NOT EXISTS idx_ad_templates_video_type ON ad_templates(video_type);
CREATE INDEX IF NOT EXISTS idx_ad_templates_is_active ON ad_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_ad_templates_created_at ON ad_templates(created_at DESC);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to all tables
DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at 
    BEFORE UPDATE ON projects
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_ad_templates_updated_at ON ad_templates;
CREATE TRIGGER update_ad_templates_updated_at 
    BEFORE UPDATE ON ad_templates
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_videos_updated_at ON videos;
CREATE TRIGGER update_videos_updated_at 
    BEFORE UPDATE ON videos
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_templates ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------
-- Projects RLS Policies
-- -----------------------------------------------------

-- Users can view their own projects
DROP POLICY IF EXISTS "Users can view their own projects" ON projects;
CREATE POLICY "Users can view their own projects"
    ON projects FOR SELECT
    USING (auth.uid() = user_id);

-- Users can create their own projects
DROP POLICY IF EXISTS "Users can create their own projects" ON projects;
CREATE POLICY "Users can create their own projects"
    ON projects FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own projects
DROP POLICY IF EXISTS "Users can update their own projects" ON projects;
CREATE POLICY "Users can update their own projects"
    ON projects FOR UPDATE
    USING (auth.uid() = user_id);

-- Users can delete their own projects
DROP POLICY IF EXISTS "Users can delete their own projects" ON projects;
CREATE POLICY "Users can delete their own projects"
    ON projects FOR DELETE
    USING (auth.uid() = user_id);

-- -----------------------------------------------------
-- Videos RLS Policies
-- -----------------------------------------------------

-- Users can view their own videos
DROP POLICY IF EXISTS "Users can view their own videos" ON videos;
CREATE POLICY "Users can view their own videos"
    ON videos FOR SELECT
    USING (auth.uid() = user_id);

-- Users can create their own videos
DROP POLICY IF EXISTS "Users can create their own videos" ON videos;
CREATE POLICY "Users can create their own videos"
    ON videos FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own videos
DROP POLICY IF EXISTS "Users can update their own videos" ON videos;
CREATE POLICY "Users can update their own videos"
    ON videos FOR UPDATE
    USING (auth.uid() = user_id);

-- Users can delete their own videos
DROP POLICY IF EXISTS "Users can delete their own videos" ON videos;
CREATE POLICY "Users can delete their own videos"
    ON videos FOR DELETE
    USING (auth.uid() = user_id);

-- -----------------------------------------------------
-- Ad Templates RLS Policies
-- -----------------------------------------------------

-- Anyone (authenticated users) can view active ad templates
DROP POLICY IF EXISTS "Anyone can view active ad templates" ON ad_templates;
CREATE POLICY "Anyone can view active ad templates"
    ON ad_templates FOR SELECT
    USING (is_active = TRUE);

-- Note: Only database admins can insert/update/delete ad templates
-- This is intentional - templates are managed by you, not by users

-- =====================================================
-- SAMPLE DATA - Ad Templates
-- =====================================================

-- Clear existing sample data if re-running
DELETE FROM ad_templates;

-- Insert 12 sample viral ad templates
INSERT INTO ad_templates (title, description, original_video_url, video_type, video_prompt, duration, model, size, seconds) VALUES

('Product Showcase - Modern Tech', 'Sleek product reveal with dynamic camera movements', 'https://www.tiktok.com/@example/video/123', 'POV', 'A sleek modern smartphone floating in a minimalist white space, slowly rotating to show all angles. Soft studio lighting creates elegant reflections on the glass surface. Camera slowly zooms in on the device as holographic UI elements appear around it. Professional product photography style.', '8s', 'sora-2', '720x1280', '8'),

('Fashion Brand - Urban Style', 'Dynamic fashion ad with urban energy', 'https://www.instagram.com/p/example123', 'Review', 'A confident model walking down a vibrant city street at golden hour, wearing trendy streetwear. Dynamic camera follows alongside as they move with purpose. Neon signs and traffic blur in the background. Urban fashion editorial style with cinematic color grading.', '15s', 'sora-2-pro', '720x1280', '15'),

('Food & Beverage - Appetizing', 'Mouth-watering food presentation', 'https://www.youtube.com/shorts/example', 'Unboxing', 'Close-up of a gourmet burger being assembled in slow motion. Each layer drops perfectly - fresh lettuce, juicy tomatoes, melted cheese, and a perfectly cooked patty. Ingredients are vibrant and fresh. Steam rises from the hot patty. Professional food photography with dramatic lighting.', '8s', 'sora-2', '1280x720', '8'),

('Fitness Motivation', 'High-energy workout inspiration', 'https://www.tiktok.com/@fitness/video/456', 'Tutorial', 'Athletic person doing intense workout in a modern gym. Quick cuts between different exercises - push-ups, weights, running. Sweat droplets fly in slow motion. Dramatic lighting with strong contrast. Motivational and energetic atmosphere. Sports commercial style.', '12s', 'sora-2', '720x1280', '12'),

('Real Estate - Luxury Home', 'Elegant property tour', 'https://www.instagram.com/p/realestate789', 'Showcase', 'Smooth cinematic walkthrough of a luxurious modern home. Sunlight streams through floor-to-ceiling windows. Camera glides through open-concept living spaces showcasing high-end finishes and minimalist design. Peaceful and aspirational atmosphere. Architectural videography style.', '15s', 'sora-2-pro', '1280x720', '15'),

('App Launch - Tech Innovation', 'Modern app demonstration', 'https://www.tiktok.com/@tech/video/789', 'Demo', 'Hands interacting with a smartphone showing a sleek mobile app interface. Smooth transitions between different app screens with animated UI elements. Modern tech aesthetic with glowing accents. Close-up shots of fingers swiping and tapping. Tech commercial style with futuristic vibe.', '12s', 'sora-2', '720x1280', '12'),

('Travel & Tourism - Adventure', 'Epic travel destination showcase', 'https://www.youtube.com/shorts/travel456', 'POV', 'Breathtaking aerial drone shot soaring over tropical paradise. Crystal clear turquoise water, white sand beaches, and lush green mountains. Camera sweeps dramatically through the landscape. Golden hour lighting creates warm, inviting atmosphere. Travel documentary cinematography style.', '15s', 'sora-2-pro', '1792x1024', '15'),

('Skincare Brand - Clean Beauty', 'Elegant beauty product showcase', 'https://www.instagram.com/p/beauty101', 'Review', 'Minimal beauty product sitting on a clean white surface surrounded by natural elements - water droplets, green leaves, soft light. Product slowly rotates as water droplets fall in slow motion. Fresh, clean, and organic aesthetic. High-end beauty commercial style.', '8s', 'sora-2', '720x1280', '8'),

('Car Commercial - Speed', 'Dynamic automotive showcase', 'https://www.youtube.com/shorts/cars789', 'Showcase', 'Sleek sports car speeding down a winding mountain road at sunset. Dynamic camera angles capture the car''s curves and power. Motion blur emphasizes speed. Dramatic lighting highlights the vehicle''s design. Automotive commercial cinematography with cinematic color grading.', '12s', 'sora-2-pro', '1792x1024', '12'),

('Coffee Shop - Cozy Vibe', 'Warm and inviting cafe atmosphere', 'https://www.tiktok.com/@coffee/video/321', 'Tutorial', 'Steam rising from a perfectly made latte with intricate foam art. Cozy coffee shop background with warm lighting and bokeh effect. Barista''s hands carefully pouring milk. Close-up shots of coffee beans and brewing process. Warm, inviting, and artisanal feel.', '8s', 'sora-2', '720x1280', '8'),

('Gaming - Epic Action', 'High-energy gaming showcase', 'https://www.youtube.com/shorts/gaming999', 'POV', 'First-person perspective of intense gaming action. Quick cuts between epic game moments - explosions, character abilities, dramatic victories. RGB lighting reflects on player''s face. Controller in hands with rapid button presses. Gaming content creator style with vibrant colors.', '12s', 'sora-2', '1280x720', '12'),

('Jewelry - Elegant Luxury', 'Sophisticated jewelry presentation', 'https://www.instagram.com/p/jewelry555', 'Unboxing', 'Sparkling diamond necklace rotating on a black velvet surface. Dramatic lighting creates brilliant light reflections through the gemstones. Macro close-up reveals intricate details. Elegant and luxurious atmosphere. High-end jewelry commercial style.', '8s', 'sora-2-pro', '720x1280', '8');

-- =====================================================
-- HELPFUL QUERIES
-- =====================================================

-- View all templates by type
-- SELECT * FROM ad_templates WHERE video_type = 'POV' ORDER BY created_at DESC;

-- Get user's projects with video count
-- SELECT 
--   p.*,
--   COUNT(v.id) as video_count
-- FROM projects p
-- LEFT JOIN videos v ON p.id = v.project_id
-- WHERE p.user_id = auth.uid()
-- GROUP BY p.id
-- ORDER BY p.created_at DESC;

-- Get videos with project and template info
-- SELECT 
--   v.*,
--   p.name as project_name,
--   t.title as template_title,
--   t.video_type as template_type
-- FROM videos v
-- LEFT JOIN projects p ON v.project_id = p.id
-- LEFT JOIN ad_templates t ON v.template_id = t.id
-- WHERE v.user_id = auth.uid()
-- ORDER BY v.created_at DESC;

-- =====================================================
-- SETUP COMPLETE!
-- =====================================================
-- Next steps:
-- 1. Go to Authentication > Settings in Supabase dashboard
-- 2. Enable Email authentication (already enabled by default)
-- 3. Configure email templates if needed
-- 4. Add your site URL in Authentication > URL Configuration
-- 5. For OAuth: Enable providers in Authentication > Providers
--
-- Then in your .env.local file, add:
-- NEXT_PUBLIC_SUPABASE_URL=your_project_url
-- NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
-- =====================================================

