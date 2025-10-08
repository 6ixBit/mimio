# Social Media Integration Guide
## TikTok & Instagram OAuth Setup

This guide explains how to integrate TikTok and Instagram posting functionality into your app, allowing users to connect multiple accounts per platform.

---

## 📋 Overview

### What's Already Done
✅ Database schema for storing social media accounts (`social_media_accounts` table)  
✅ Database schema for tracking video posts (`video_posts` table)  
✅ API wrappers in `lib/supabase.ts` for managing accounts  
✅ Settings page UI for connecting/disconnecting accounts  
✅ Support for multiple accounts per platform  
✅ Row-level security (RLS) policies  

### What You Need to Implement
- [ ] OAuth 2.0 flow for TikTok
- [ ] OAuth 2.0 flow for Instagram  
- [ ] API routes for handling OAuth callbacks
- [ ] Video posting logic for each platform
- [ ] Token refresh mechanism

---

## 🎯 Step-by-Step Implementation

### 1. TikTok Integration

#### A. Register Your App
1. Go to [TikTok for Developers](https://developers.tiktok.com/)
2. Create a new app
3. Note down your **Client Key** and **Client Secret**
4. Add redirect URI: `https://yourdomain.com/api/auth/tiktok/callback`

#### B. Required Scopes
```
user.info.basic       - Get user profile info
video.upload          - Upload videos
video.publish         - Publish videos
```

#### C. Environment Variables
Add to `.env.local`:
```env
TIKTOK_CLIENT_KEY=your_client_key_here
TIKTOK_CLIENT_SECRET=your_client_secret_here
TIKTOK_REDIRECT_URI=https://yourdomain.com/api/auth/tiktok/callback
```

#### D. OAuth Flow Implementation

**Create `/app/api/auth/tiktok/connect/route.ts`:**
```typescript
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // Build TikTok OAuth URL
  const authUrl = new URL("https://www.tiktok.com/v2/auth/authorize/");
  authUrl.searchParams.set("client_key", process.env.TIKTOK_CLIENT_KEY!);
  authUrl.searchParams.set("scope", "user.info.basic,video.upload,video.publish");
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("redirect_uri", process.env.TIKTOK_REDIRECT_URI!);
  authUrl.searchParams.set("state", "random_state_string"); // Use a secure random state

  return NextResponse.redirect(authUrl.toString());
}
```

**Create `/app/api/auth/tiktok/callback/route.ts`:**
```typescript
import { NextRequest, NextResponse } from "next/server";
import { socialMediaApi } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  if (!code) {
    return NextResponse.redirect("/settings?error=tiktok_auth_failed");
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_key: process.env.TIKTOK_CLIENT_KEY!,
        client_secret: process.env.TIKTOK_CLIENT_SECRET!,
        code: code,
        grant_type: "authorization_code",
        redirect_uri: process.env.TIKTOK_REDIRECT_URI!,
      }),
    });

    const tokenData = await tokenResponse.json();
    const { access_token, refresh_token, expires_in, open_id } = tokenData;

    // Get user info
    const userResponse = await fetch("https://open.tiktokapis.com/v2/user/info/", {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    const userData = await userResponse.json();
    const { username, display_name, avatar_url } = userData.data.user;

    // Save to database
    const { data: user } = await supabase.auth.getUser(); // Get current user
    
    await socialMediaApi.create(user.id, {
      platform: "tiktok",
      platform_user_id: open_id,
      username: username,
      display_name: display_name,
      profile_picture_url: avatar_url,
      access_token: access_token,
      refresh_token: refresh_token,
      token_expires_at: new Date(Date.now() + expires_in * 1000).toISOString(),
    });

    return NextResponse.redirect("/settings?success=tiktok_connected");
  } catch (error) {
    console.error("TikTok OAuth error:", error);
    return NextResponse.redirect("/settings?error=tiktok_auth_failed");
  }
}
```

#### E. Update Settings Page
In `/app/(dashboard)/settings/page.tsx`, update `handleConnectTikTok`:
```typescript
const handleConnectTikTok = () => {
  window.location.href = "/api/auth/tiktok/connect";
};
```

---

### 2. Instagram Integration

#### A. Register Your App
1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Create a new app (choose "Business" type)
3. Add Instagram Basic Display or Instagram Graph API
4. Note down your **App ID** and **App Secret**
5. Add OAuth redirect URI: `https://yourdomain.com/api/auth/instagram/callback`

#### B. Required Permissions
```
instagram_basic
instagram_content_publish
```

#### C. Environment Variables
Add to `.env.local`:
```env
INSTAGRAM_APP_ID=your_app_id_here
INSTAGRAM_APP_SECRET=your_app_secret_here
INSTAGRAM_REDIRECT_URI=https://yourdomain.com/api/auth/instagram/callback
```

#### D. OAuth Flow Implementation

**Create `/app/api/auth/instagram/connect/route.ts`:**
```typescript
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const authUrl = new URL("https://api.instagram.com/oauth/authorize");
  authUrl.searchParams.set("client_id", process.env.INSTAGRAM_APP_ID!);
  authUrl.searchParams.set("redirect_uri", process.env.INSTAGRAM_REDIRECT_URI!);
  authUrl.searchParams.set("scope", "instagram_basic,instagram_content_publish");
  authUrl.searchParams.set("response_type", "code");

  return NextResponse.redirect(authUrl.toString());
}
```

**Create `/app/api/auth/instagram/callback/route.ts`:**
```typescript
import { NextRequest, NextResponse } from "next/server";
import { socialMediaApi } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect("/settings?error=instagram_auth_failed");
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch("https://api.instagram.com/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: process.env.INSTAGRAM_APP_ID!,
        client_secret: process.env.INSTAGRAM_APP_SECRET!,
        grant_type: "authorization_code",
        redirect_uri: process.env.INSTAGRAM_REDIRECT_URI!,
        code: code,
      }),
    });

    const tokenData = await tokenResponse.json();
    const { access_token, user_id } = tokenData;

    // Get user info
    const userResponse = await fetch(
      `https://graph.instagram.com/me?fields=id,username&access_token=${access_token}`
    );

    const userData = await userResponse.json();

    // Save to database
    const { data: user } = await supabase.auth.getUser();
    
    await socialMediaApi.create(user.id, {
      platform: "instagram",
      platform_user_id: user_id,
      username: userData.username,
      access_token: access_token,
      // Instagram access tokens don't expire (long-lived tokens)
    });

    return NextResponse.redirect("/settings?success=instagram_connected");
  } catch (error) {
    console.error("Instagram OAuth error:", error);
    return NextResponse.redirect("/settings?error=instagram_auth_failed");
  }
}
```

#### E. Update Settings Page
In `/app/(dashboard)/settings/page.tsx`, update `handleConnectInstagram`:
```typescript
const handleConnectInstagram = () => {
  window.location.href = "/api/auth/instagram/connect";
};
```

---

### 3. Posting Videos

#### A. Create Video Posting API

**Create `/app/api/social-media/post/route.ts`:**
```typescript
import { NextRequest, NextResponse } from "next/server";
import { socialMediaApi, videoPostsApi } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  const { videoId, accountIds, caption } = await request.json();
  const { data: user } = await supabase.auth.getUser();

  const results = [];

  for (const accountId of accountIds) {
    // Get account details
    const { data: account } = await socialMediaApi.getById(accountId);
    
    if (!account) continue;

    // Create post record
    const { data: post } = await videoPostsApi.create(user.id, {
      video_id: videoId,
      social_media_account_id: accountId,
      platform: account.platform,
      caption: caption || "",
    });

    // Post to platform
    try {
      if (account.platform === "tiktok") {
        const result = await postToTikTok(account, videoUrl, caption);
        await videoPostsApi.update(post.id, {
          status: "published",
          platform_post_id: result.video_id,
          post_url: result.share_url,
          posted_at: new Date().toISOString(),
        });
      } else if (account.platform === "instagram") {
        const result = await postToInstagram(account, videoUrl, caption);
        await videoPostsApi.update(post.id, {
          status: "published",
          platform_post_id: result.media_id,
          posted_at: new Date().toISOString(),
        });
      }
      results.push({ success: true, accountId });
    } catch (error) {
      await videoPostsApi.update(post.id, {
        status: "failed",
        error_message: error.message,
      });
      results.push({ success: false, accountId, error: error.message });
    }
  }

  return NextResponse.json({ results });
}

async function postToTikTok(account: any, videoUrl: string, caption: string) {
  // TikTok Content Posting API
  // https://developers.tiktok.com/doc/content-posting-api-get-started/
  
  const response = await fetch("https://open.tiktokapis.com/v2/post/publish/video/init/", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${account.access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      post_info: {
        title: caption,
        privacy_level: "SELF_ONLY", // or PUBLIC_TO_EVERYONE
        disable_duet: false,
        disable_comment: false,
        disable_stitch: false,
        video_cover_timestamp_ms: 1000,
      },
      source_info: {
        source: "FILE_URL",
        video_url: videoUrl,
      },
    }),
  });

  return await response.json();
}

async function postToInstagram(account: any, videoUrl: string, caption: string) {
  // Instagram Graph API for Reels
  // https://developers.facebook.com/docs/instagram-api/guides/content-publishing
  
  // Step 1: Create container
  const containerResponse = await fetch(
    `https://graph.instagram.com/v18.0/${account.platform_user_id}/media`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        media_type: "REELS",
        video_url: videoUrl,
        caption: caption,
        access_token: account.access_token,
      }),
    }
  );

  const containerData = await containerResponse.json();

  // Step 2: Publish container
  const publishResponse = await fetch(
    `https://graph.instagram.com/v18.0/${account.platform_user_id}/media_publish`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        creation_id: containerData.id,
        access_token: account.access_token,
      }),
    }
  );

  return await publishResponse.json();
}
```

---

### 4. Token Refresh (Important!)

#### Create Token Refresh Cron Job

**Create `/app/api/cron/refresh-tokens/route.ts`:**
```typescript
import { NextResponse } from "next/server";
import { supabase, socialMediaApi } from "@/lib/supabase";

export async function GET() {
  // Fetch accounts with expiring tokens (within next 24 hours)
  const { data: accounts } = await supabase
    .from("social_media_accounts")
    .select("*")
    .lt("token_expires_at", new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString())
    .eq("is_active", true);

  for (const account of accounts || []) {
    try {
      if (account.platform === "tiktok") {
        const response = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            client_key: process.env.TIKTOK_CLIENT_KEY!,
            client_secret: process.env.TIKTOK_CLIENT_SECRET!,
            grant_type: "refresh_token",
            refresh_token: account.refresh_token!,
          }),
        });

        const data = await response.json();

        await socialMediaApi.update(account.id, {
          access_token: data.access_token,
          refresh_token: data.refresh_token,
          token_expires_at: new Date(Date.now() + data.expires_in * 1000).toISOString(),
          connection_status: "connected",
        });
      }
      // Instagram tokens are long-lived, no refresh needed usually
    } catch (error) {
      await socialMediaApi.update(account.id, {
        connection_status: "expired",
        error_message: "Token refresh failed",
      });
    }
  }

  return NextResponse.json({ success: true });
}
```

Set up a cron job (using Vercel Cron or similar) to run this daily.

---

## 🔐 Security Best Practices

1. **Encrypt Access Tokens**: Use Supabase's `pgcrypto` extension to encrypt tokens at rest
2. **Use HTTPS Only**: Never expose OAuth flows over HTTP
3. **Validate State Parameter**: Prevent CSRF attacks in OAuth flow
4. **Rotate Secrets**: Regularly rotate client secrets
5. **Rate Limiting**: Implement rate limiting for API endpoints
6. **Token Storage**: Never expose tokens to client-side code

---

## 📱 UI Flow

1. User goes to **Settings** → **Social Media Integrations**
2. Clicks **"Add Account"** for TikTok or Instagram
3. Redirected to platform's OAuth page
4. Authorizes the app
5. Redirected back to Settings with account connected
6. Can repeat to add more accounts
7. Click **trash icon** to disconnect any account

---

## 🎨 Next Steps

1. Run the database migration:
   ```sql
   -- Execute /supabase/migrations/004_social_media_accounts.sql in Supabase SQL Editor
   ```

2. Add environment variables to `.env.local`

3. Implement OAuth routes as described above

4. Test the flow in development

5. Add posting functionality to your videos page

6. Set up token refresh cron job

---

## 📚 Resources

- [TikTok for Developers](https://developers.tiktok.com/)
- [TikTok Content Posting API](https://developers.tiktok.com/doc/content-posting-api-get-started/)
- [Meta for Developers](https://developers.facebook.com/)
- [Instagram Graph API](https://developers.facebook.com/docs/instagram-api/)
- [Instagram Content Publishing](https://developers.facebook.com/docs/instagram-api/guides/content-publishing)

---

**Need Help?** Check the platform documentation or reach out to their developer support!

