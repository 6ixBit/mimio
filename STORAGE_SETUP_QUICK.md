# Quick Storage Setup Guide

## ⚠️ Important: Use Dashboard, Not SQL

Storage buckets cannot be created via SQL in Supabase - you must use the Dashboard UI.

## Setup Steps (2 minutes)

### 1. Create Storage Bucket

1. Go to your Supabase Dashboard: https://app.supabase.com
2. Select your project
3. Click **Storage** in the left sidebar
4. Click **"New bucket"** button (or "Create a new bucket")
5. Configure the bucket:
   - **Name**: `videos`
   - **Public bucket**: ✅ **YES** (check this box)
   - **File size limit**: Leave default (50MB) or increase if needed
   - **Allowed MIME types**: Leave empty (allow all) or set to `video/mp4`
6. Click **"Create bucket"**

### 2. Configure Policies (Optional - Recommended)

For better security, add these policies:

1. In the Storage page, click on the **videos** bucket
2. Click the **Policies** tab
3. Click **"New Policy"**

#### Policy 1: Users can upload to own folder
- **Policy name**: `Users can upload videos`
- **Allowed operation**: `INSERT`
- **Target roles**: `authenticated`
- **Policy definition**: 
  ```sql
  (bucket_id = 'videos'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)
  ```

#### Policy 2: Users can read own videos
- **Policy name**: `Users can read own videos`
- **Allowed operation**: `SELECT`
- **Target roles**: `authenticated`
- **Policy definition**:
  ```sql
  (bucket_id = 'videos'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)
  ```

#### Policy 3: Anyone can read public videos
- **Policy name**: `Public videos are readable`
- **Allowed operation**: `SELECT`
- **Target roles**: `public`
- **Policy definition**:
  ```sql
  bucket_id = 'videos'::text
  ```

#### Policy 4: Users can delete own videos
- **Policy name**: `Users can delete own videos`
- **Allowed operation**: `DELETE`
- **Target roles**: `authenticated`
- **Policy definition**:
  ```sql
  (bucket_id = 'videos'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)
  ```

### 3. Verify Setup

1. Go to **Storage > videos** bucket
2. You should see an empty bucket
3. The bucket icon should show a globe (🌐) indicating it's public

## ✅ That's It!

Your storage is now ready. The app will automatically:
- Upload videos to `videos/{user_id}/video_xxx.mp4`
- Save video metadata to the database
- Display videos in "My Videos" page

## Testing

1. Log in to your app
2. Create a video
3. Wait for it to complete
4. Check Supabase Dashboard > Storage > videos bucket
5. You should see a folder with your user ID containing the video
6. Check "My Videos" page in the app - video should appear

## Troubleshooting

**Can't create bucket?**
- Make sure you're on the correct project
- Check you have admin permissions

**Videos not uploading?**
- Check browser console for errors
- Verify bucket name is exactly `videos`
- Ensure bucket is marked as public
- Check policies if you added them

**Permission denied errors?**
- Verify policies are set correctly
- Check that bucket is public
- Ensure user is authenticated

