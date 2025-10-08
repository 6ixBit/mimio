# Instagram Integration Setup - Step by Step

Follow these exact steps to get Instagram working with your app.

---

## 📱 Step 1: Create a Meta (Facebook) Developer Account

1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Click **"Get Started"** in the top right
3. Log in with your Facebook account (or create one)
4. Complete the developer registration

---

## 🔧 Step 2: Create a New App

1. Once logged in, click **"My Apps"** in the top right
2. Click **"Create App"**
3. Select use case: **"Other"** → Click **"Next"**
4. Select app type: **"Business"** → Click **"Next"**
5. Fill in app details:
   - **App Name**: `Mimio Video Generator` (or your app name)
   - **App Contact Email**: Your email
   - Click **"Create App"**

---

## 📸 Step 3: Add Instagram Basic Display

1. In your app dashboard, scroll down to **"Add Products"**
2. Find **"Instagram Basic Display"**
3. Click **"Set Up"**
4. Scroll down and click **"Create New App"**
5. Fill in:
   - **Display Name**: `Mimio`
   - **Privacy Policy URL**: `https://yourdomain.com/privacy` (can use placeholder for dev)
   - **Terms of Service URL**: `https://yourdomain.com/terms` (can use placeholder for dev)
   - Click **"Create App"**

---

## 🔐 Step 4: Configure OAuth Settings

1. In **Instagram Basic Display** → Click **"Basic Display"** in the left sidebar
2. Scroll to **"User Token Generator"** section
3. Click **"Add or Remove Instagram Testers"**
4. Click **"Add Instagram Testers"**
5. Enter your Instagram username
6. Go to your Instagram app and accept the tester invitation:
   - Open Instagram app
   - Go to Settings → Apps and Websites → Tester Invites
   - Accept the invitation

---

## 🌐 Step 5: Add OAuth Redirect URIs

1. Still in **Instagram Basic Display** → **"Basic Display"** tab
2. Scroll to **"Client OAuth Settings"** section
3. Add these redirect URIs:

   **For Development:**

   ```
   http://localhost:3000/api/auth/instagram/callback
   ```

   **For Production (when deploying):**

   ```
   https://yourdomain.com/api/auth/instagram/callback
   ```

4. Add the same URLs to **"Deauthorize Callback URL"**
5. Add the same URLs to **"Data Deletion Request URL"**
6. Click **"Save Changes"** at the bottom

---

## 🔑 Step 6: Get Your Credentials

1. Still in **Instagram Basic Display** → **"Basic Display"** tab
2. You'll see:
   - **Instagram App ID** - Copy this
   - **Instagram App Secret** - Click **"Show"** and copy this
   - **Client Token** - You don't need this

---

## 💻 Step 7: Add to Your `.env.local` File

1. Open your project in VS Code
2. Create or open `.env.local` in the root directory
3. Add these lines (replace with your actual values):

```env
# Instagram OAuth
NEXT_PUBLIC_INSTAGRAM_APP_ID=your_instagram_app_id_here
INSTAGRAM_APP_SECRET=your_instagram_app_secret_here
NEXT_PUBLIC_INSTAGRAM_REDIRECT_URI=http://localhost:3000/api/auth/instagram/callback
```

**Important:**

- `NEXT_PUBLIC_` prefix makes it available in the browser (needed for OAuth redirect)
- `INSTAGRAM_APP_SECRET` has NO prefix - it's server-only (more secure)

---

## 🗄️ Step 8: Run Database Migration

1. Open [Supabase Dashboard](https://supabase.com/dashboard)
2. Go to **SQL Editor**
3. Open the file: `/Users/hamza/Desktop/mimio/supabase/migrations/004_social_media_accounts.sql`
4. Copy ALL the contents
5. Paste into Supabase SQL Editor
6. Click **"Run"**
7. You should see: `Success. No rows returned`

---

## 🚀 Step 9: Restart Your Dev Server

```bash
# Stop your current dev server (Ctrl+C)
# Then restart it
yarn dev
```

---

## ✅ Step 10: Test the Integration

1. Go to `http://localhost:3000/settings`
2. Scroll to **"Social Media Integrations"**
3. Under **Instagram**, click **"Add Account"**
4. You'll be redirected to Instagram
5. Log in with your Instagram account (must be a tester account)
6. Click **"Allow"** to authorize
7. You'll be redirected back to Settings
8. You should see your Instagram account connected! 🎉

---

## 🔍 Troubleshooting

### "Invalid Redirect URI"

- Make sure the redirect URI in your app settings EXACTLY matches what's in your `.env.local`
- No trailing slash!
- Restart your dev server after changing `.env.local`

### "You need to add this account as a tester"

- Go to App Dashboard → Roles → Instagram Testers
- Add your Instagram username
- Accept the invitation in the Instagram app

### "App not approved for this permission"

- During development, you can only connect as a tester
- For production, you'll need to submit your app for review

### Connection shows but no username

- The user profile fetch might have failed
- Check the browser console and server logs
- The account is still saved, just missing profile info

### "Environment variable not found"

- Make sure your `.env.local` is in the root directory
- Restart your Next.js dev server
- Don't commit `.env.local` to git!

---

## 🎯 Next Steps

Once Instagram is working:

1. ✅ Test connecting multiple Instagram accounts
2. ✅ Test disconnecting accounts
3. 📱 Set up TikTok integration (similar process)
4. 🚀 Implement video posting functionality
5. 🌐 Deploy to production and update OAuth redirect URIs

---

## 📚 Useful Links

- [Meta for Developers Dashboard](https://developers.facebook.com/apps/)
- [Instagram Basic Display Docs](https://developers.facebook.com/docs/instagram-basic-display-api)
- [Instagram Graph API Docs](https://developers.facebook.com/docs/instagram-api/)
- [Supabase Dashboard](https://supabase.com/dashboard)

---

**Need help?** Check the error messages in:

- Browser console (F12 → Console tab)
- Terminal (where `yarn dev` is running)
- Network tab (F12 → Network tab)
