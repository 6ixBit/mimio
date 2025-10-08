# Mimio Database Setup Guide

This guide will help you set up the Supabase database for the Mimio project.

## Database Schema Overview

### Tables

#### 1. **projects**
Stores user projects for organizing videos.

- `id` (UUID, PK) - Unique identifier
- `user_id` (UUID) - User who owns the project
- `name` (TEXT) - Project name
- `description` (TEXT) - Project description
- `system_prompt` (TEXT) - Context about the app/product for Sora generation
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

#### 2. **ad_templates**
Archive of viral video templates.

- `id` (UUID, PK) - Unique identifier
- `title` (TEXT) - Template title
- `description` (TEXT) - Template description
- `original_video_url` (TEXT) - URL to the original viral video
- `video_type` (TEXT) - Type: POV, Review, Unboxing, Tutorial, Showcase, Demo
- `video_prompt` (TEXT) - Prompt to send to Sora
- `thumbnail_url` (TEXT) - Preview image
- `duration` (TEXT) - e.g., "8s", "15s"
- `model` (TEXT) - sora-2, sora-2-pro
- `size` (TEXT) - Video dimensions
- `seconds` (TEXT) - Duration in seconds
- `is_active` (BOOLEAN) - Template visibility
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

#### 3. **videos**
User-generated videos.

- `id` (UUID, PK) - Unique identifier
- `user_id` (UUID) - User who created the video
- `project_id` (UUID, FK) - Associated project
- `template_id` (UUID, FK) - Template used (if any)
- `title` (TEXT) - Video title
- `video_url` (TEXT) - URL to the generated video
- `thumbnail_url` (TEXT) - Video thumbnail
- `prompt` (TEXT) - Actual prompt used for generation
- `model` (TEXT) - Model used (sora-2, sora-2-pro)
- `size` (TEXT) - Video dimensions
- `duration_seconds` (INTEGER) - Duration in seconds
- `status` (TEXT) - processing, completed, failed
- `views` (INTEGER) - View count
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

## Setup Instructions

### Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in:
   - Project name: `mimio`
   - Database password: (create a strong password)
   - Region: (choose closest to you)
5. Click "Create new project"

### Step 2: Run the Migration

1. In your Supabase project, go to the SQL Editor
2. Click "New Query"
3. Copy the contents of `supabase/migrations/001_initial_schema.sql`
4. Paste into the SQL editor
5. Click "Run" to execute the migration

This will:
- Create all three tables
- Set up indexes for performance
- Enable Row Level Security (RLS)
- Create RLS policies for data access
- Insert 12 sample ad templates

### Step 3: Configure Environment Variables

1. In Supabase, go to Project Settings > API
2. Copy your project URL and anon/public key
3. Create a `.env.local` file in the project root:

```bash
cp .env.local.example .env.local
```

4. Update `.env.local` with your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### Step 4: Install Supabase Client

```bash
cd /Users/hamza/Desktop/mimio
npm install @supabase/supabase-js
# or
yarn add @supabase/supabase-js
# or
pnpm add @supabase/supabase-js
```

### Step 5: Verify Setup

You can verify the setup by:

1. Go to Supabase Table Editor
2. Check that all three tables exist
3. Check `ad_templates` table has 12 sample records
4. Try querying the tables

## Usage in Your App

### Import the Supabase client:

```typescript
import { supabase, projectsApi, templatesApi, videosApi } from "@/lib/supabase";
```

### Example: Get all templates

```typescript
const { data: templates, error } = await templatesApi.getAll();
```

### Example: Create a project

```typescript
const { data: project, error } = await projectsApi.create(userId, {
  name: "My Fitness App Campaign",
  description: "Viral ads for fitness app launch",
  system_prompt: "A revolutionary fitness app that uses AI to create personalized workout plans...",
});
```

### Example: Create a video

```typescript
const { data: video, error } = await videosApi.create(userId, {
  title: "Fitness App Demo",
  video_url: "https://storage.example.com/video.mp4",
  prompt: "Dynamic fitness app showcase...",
  model: "sora-2",
  size: "720x1280",
  project_id: projectId,
  template_id: templateId,
});
```

## Row Level Security (RLS)

The database has RLS enabled with these policies:

- **Projects & Videos**: Users can only see/edit their own
- **Ad Templates**: Everyone can view active templates (read-only for users)

## Next Steps

1. Set up authentication (Supabase Auth or your preferred method)
2. Update the templates page to fetch from database
3. Update the videos page to fetch from database
4. Add project management UI
5. Connect video generation to database storage

## Troubleshooting

### Can't see templates?
- Check that `is_active = true` in ad_templates
- Verify RLS policies are enabled
- Check browser console for errors

### Can't create projects/videos?
- Ensure you have a valid user_id (from auth)
- Check RLS policies allow INSERT
- Verify environment variables are correct

### Migration fails?
- Check for existing tables (drop them if testing)
- Verify UUID extension is enabled
- Check Supabase logs for detailed errors

