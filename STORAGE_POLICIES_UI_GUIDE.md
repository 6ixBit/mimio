# Storage Policies Setup - UI Method

## ⚠️ Important

Storage policies CANNOT be created via SQL Editor due to permission restrictions.
You must use the Supabase Dashboard UI.

## Step-by-Step Guide

### 1. Navigate to Storage Policies

1. Go to https://app.supabase.com
2. Select your project
3. Click **Storage** in the left sidebar
4. Click on the **videos** bucket
5. Click the **Policies** tab at the top

### 2. Create Policy #1: Users Can Upload Videos

1. Click **"New Policy"**
2. Click **"Create a policy from scratch"** (or "For full customization")
3. Fill in:
   - **Policy Name**: `Users can upload videos`
   - **Allowed operation**: Select **INSERT**
   - **Policy definition**: Click "Show custom SQL"
4. In the **WITH CHECK** field, paste:

```sql
bucket_id = 'videos' AND (storage.foldername(name))[1] = auth.uid()::text
```

5. **Target roles**: `authenticated`
6. Click **Review** then **Save policy**

---

### 3. Create Policy #2: Users Can Read Own Videos

1. Click **"New Policy"** again
2. Click **"Create a policy from scratch"**
3. Fill in:
   - **Policy Name**: `Users can read own videos`
   - **Allowed operation**: Select **SELECT**
   - **Policy definition**: Click "Show custom SQL"
4. In the **USING** field, paste:

```sql
bucket_id = 'videos' AND (storage.foldername(name))[1] = auth.uid()::text
```

5. **Target roles**: `authenticated`
6. Click **Review** then **Save policy**

---

### 4. Create Policy #3: Public Videos Are Readable

1. Click **"New Policy"**
2. Click **"Create a policy from scratch"**
3. Fill in:
   - **Policy Name**: `Public videos are readable`
   - **Allowed operation**: Select **SELECT**
   - **Policy definition**: Click "Show custom SQL"
4. In the **USING** field, paste:

```sql
bucket_id = 'videos'
```

5. **Target roles**: `public` (or `anon`)
6. Click **Review** then **Save policy**

---

### 5. Create Policy #4: Users Can Update Own Videos

1. Click **"New Policy"**
2. Click **"Create a policy from scratch"**
3. Fill in:
   - **Policy Name**: `Users can update own videos`
   - **Allowed operation**: Select **UPDATE**
   - **Policy definition**: Click "Show custom SQL"
4. In the **USING** field, paste:

```sql
bucket_id = 'videos' AND (storage.foldername(name))[1] = auth.uid()::text
```

5. In the **WITH CHECK** field, paste:

```sql
bucket_id = 'videos' AND (storage.foldername(name))[1] = auth.uid()::text
```

6. **Target roles**: `authenticated`
7. Click **Review** then **Save policy**

---

### 6. Create Policy #5: Users Can Delete Own Videos

1. Click **"New Policy"**
2. Click **"Create a policy from scratch"**
3. Fill in:
   - **Policy Name**: `Users can delete own videos`
   - **Allowed operation**: Select **DELETE**
   - **Policy definition**: Click "Show custom SQL"
4. In the **USING** field, paste:

```sql
bucket_id = 'videos' AND (storage.foldername(name))[1] = auth.uid()::text
```

5. **Target roles**: `authenticated`
6. Click **Review** then **Save policy**

---

## ✅ Verify Setup

After creating all 5 policies, you should see them listed in the Policies tab:

- ✅ Users can upload videos (INSERT)
- ✅ Users can read own videos (SELECT, authenticated)
- ✅ Public videos are readable (SELECT, public/anon)
- ✅ Users can update own videos (UPDATE)
- ✅ Users can delete own videos (DELETE)

## 🚀 You're Done!

Your storage is now fully secured. The app will work automatically.

## Alternative: Skip Policies (Quick & Easy)

**For development/testing**, you can skip all these policies and just:

1. Make sure the bucket is **Public**
2. Let it work without policies

The app will still function because:

- The bucket is public
- Files are organized by user ID
- Our app code handles permissions

You can add policies later when you're ready for production! 🎯
