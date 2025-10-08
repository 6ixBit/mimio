-- Migration: Social Media Accounts Integration
-- Stores connected Instagram and TikTok accounts for each user

-- =====================================================
-- Table: social_media_accounts
-- =====================================================
CREATE TABLE IF NOT EXISTS social_media_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
    -- Platform info
    platform TEXT NOT NULL CHECK (platform IN ('instagram', 'tiktok')),
    platform_user_id TEXT NOT NULL, -- The user's ID on the platform
    username TEXT NOT NULL,
    display_name TEXT,
    profile_picture_url TEXT,
    
    -- OAuth credentials (encrypted in production!)
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    token_expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Account status
    is_active BOOLEAN DEFAULT TRUE,
    connection_status TEXT DEFAULT 'connected' CHECK (connection_status IN ('connected', 'disconnected', 'expired', 'error')),
    last_used_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    
    -- Ensure one platform account can only be connected once per user
    UNIQUE(user_id, platform, platform_user_id)
);

-- Index for faster queries
CREATE INDEX idx_social_media_accounts_user_id ON social_media_accounts(user_id);
CREATE INDEX idx_social_media_accounts_platform ON social_media_accounts(platform);
CREATE INDEX idx_social_media_accounts_status ON social_media_accounts(connection_status);

-- =====================================================
-- Row Level Security (RLS)
-- =====================================================
ALTER TABLE social_media_accounts ENABLE ROW LEVEL SECURITY;

-- Users can view their own connected accounts
DROP POLICY IF EXISTS "Users can view their own social media accounts" ON social_media_accounts;
CREATE POLICY "Users can view their own social media accounts"
    ON social_media_accounts FOR SELECT
    USING (auth.uid() = user_id);

-- Users can create their own social media account connections
DROP POLICY IF EXISTS "Users can create social media connections" ON social_media_accounts;
CREATE POLICY "Users can create social media connections"
    ON social_media_accounts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own social media accounts
DROP POLICY IF EXISTS "Users can update their own social media accounts" ON social_media_accounts;
CREATE POLICY "Users can update their own social media accounts"
    ON social_media_accounts FOR UPDATE
    USING (auth.uid() = user_id);

-- Users can delete their own social media account connections
DROP POLICY IF EXISTS "Users can delete their own social media connections" ON social_media_accounts;
CREATE POLICY "Users can delete their own social media connections"
    ON social_media_accounts FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- Trigger for updated_at
-- =====================================================
DROP TRIGGER IF EXISTS update_social_media_accounts_updated_at ON social_media_accounts;
CREATE TRIGGER update_social_media_accounts_updated_at
    BEFORE UPDATE ON social_media_accounts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Table: video_posts
-- Track which videos were posted to which platforms
-- =====================================================
CREATE TABLE IF NOT EXISTS video_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    video_id UUID REFERENCES videos(id) ON DELETE CASCADE NOT NULL,
    social_media_account_id UUID REFERENCES social_media_accounts(id) ON DELETE CASCADE NOT NULL,
    
    -- Post details
    platform TEXT NOT NULL CHECK (platform IN ('instagram', 'tiktok')),
    platform_post_id TEXT, -- The ID of the post on the platform
    post_url TEXT,
    caption TEXT,
    
    -- Status
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'uploading', 'published', 'failed')),
    error_message TEXT,
    
    -- Metrics (can be updated via API)
    views_count INTEGER DEFAULT 0,
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0,
    
    -- Timestamps
    posted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Indexes
CREATE INDEX idx_video_posts_user_id ON video_posts(user_id);
CREATE INDEX idx_video_posts_video_id ON video_posts(video_id);
CREATE INDEX idx_video_posts_account_id ON video_posts(social_media_account_id);
CREATE INDEX idx_video_posts_status ON video_posts(status);

-- RLS
ALTER TABLE video_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own video posts" ON video_posts;
CREATE POLICY "Users can view their own video posts"
    ON video_posts FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create video posts" ON video_posts;
CREATE POLICY "Users can create video posts"
    ON video_posts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own video posts" ON video_posts;
CREATE POLICY "Users can update their own video posts"
    ON video_posts FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own video posts" ON video_posts;
CREATE POLICY "Users can delete their own video posts"
    ON video_posts FOR DELETE
    USING (auth.uid() = user_id);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_video_posts_updated_at ON video_posts;
CREATE TRIGGER update_video_posts_updated_at
    BEFORE UPDATE ON video_posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

