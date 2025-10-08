# Environment Variables Required

Create a `.env.local` file in the root of your project with these variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Instagram OAuth (Meta for Developers)
# Get these from: https://developers.facebook.com/
NEXT_PUBLIC_INSTAGRAM_APP_ID=your_instagram_app_id
INSTAGRAM_APP_SECRET=your_instagram_app_secret
NEXT_PUBLIC_INSTAGRAM_REDIRECT_URI=http://localhost:3000/api/auth/instagram/callback

# TikTok OAuth (TikTok for Developers)
# Get these from: https://developers.tiktok.com/
NEXT_PUBLIC_TIKTOK_CLIENT_KEY=your_tiktok_client_key
TIKTOK_CLIENT_SECRET=your_tiktok_client_secret
NEXT_PUBLIC_TIKTOK_REDIRECT_URI=http://localhost:3000/api/auth/tiktok/callback

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8005
```

## Notes:

- **NEVER** commit `.env.local` to git
- Variables with `NEXT_PUBLIC_` are exposed to the browser
- Variables without the prefix are server-only (more secure)
- For production, update redirect URIs to your domain
