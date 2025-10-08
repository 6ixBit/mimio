import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });

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
