import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Generate a random state for CSRF protection
  const state = Math.random().toString(36).substring(7);

  // Build TikTok OAuth URL
  const authUrl = new URL("https://www.tiktok.com/v2/auth/authorize/");
  authUrl.searchParams.set(
    "client_key",
    process.env.NEXT_PUBLIC_TIKTOK_CLIENT_KEY!
  );
  authUrl.searchParams.set(
    "scope",
    "user.info.basic,video.upload,video.publish"
  );
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set(
    "redirect_uri",
    process.env.NEXT_PUBLIC_TIKTOK_REDIRECT_URI!
  );
  authUrl.searchParams.set("state", state);

  // Store state in a cookie for verification later
  const response = NextResponse.redirect(authUrl.toString());

  response.cookies.set("tiktok_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600, // 10 minutes
  });

  return response;
}
