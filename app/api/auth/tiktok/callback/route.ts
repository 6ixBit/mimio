import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { socialMediaApi } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  const { searchParams } = new URL(request.url);

  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  // Handle user denial
  if (error === "access_denied") {
    return NextResponse.redirect(
      new URL("/settings?error=tiktok_denied", request.url)
    );
  }

  // Verify state to prevent CSRF
  const storedState = request.cookies.get("tiktok_oauth_state")?.value;
  if (!state || state !== storedState) {
    return NextResponse.redirect(
      new URL("/settings?error=tiktok_invalid_state", request.url)
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL("/settings?error=tiktok_auth_failed", request.url)
    );
  }

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch(
      "https://open.tiktokapis.com/v2/oauth/token/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_key: process.env.NEXT_PUBLIC_TIKTOK_CLIENT_KEY!,
          client_secret: process.env.TIKTOK_CLIENT_SECRET!,
          code: code,
          grant_type: "authorization_code",
          redirect_uri: process.env.NEXT_PUBLIC_TIKTOK_REDIRECT_URI!,
        }),
      }
    );

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error("TikTok token exchange error:", errorData);
      throw new Error("Failed to exchange code for token");
    }

    const tokenData = await tokenResponse.json();
    const { access_token, refresh_token, expires_in, open_id } = tokenData;

    // Get user info
    const userResponse = await fetch(
      "https://open.tiktokapis.com/v2/user/info/?fields=open_id,union_id,avatar_url,display_name",
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    if (!userResponse.ok) {
      throw new Error("Failed to fetch user profile");
    }

    const userData = await userResponse.json();
    const userInfo = userData.data?.user || {};

    // Save to database
    const { error: dbError } = await socialMediaApi.create(user.id, {
      platform: "tiktok",
      platform_user_id: open_id,
      username: userInfo.display_name || `user_${open_id.substring(0, 8)}`,
      display_name: userInfo.display_name,
      profile_picture_url: userInfo.avatar_url,
      access_token: access_token,
      refresh_token: refresh_token,
      token_expires_at: new Date(Date.now() + expires_in * 1000).toISOString(),
    });

    if (dbError) {
      console.error("Database error:", dbError);
      throw new Error("Failed to save account to database");
    }

    // Clear the state cookie
    const response = NextResponse.redirect(
      new URL("/settings?success=tiktok_connected", request.url)
    );
    response.cookies.delete("tiktok_oauth_state");

    return response;
  } catch (error) {
    console.error("TikTok OAuth error:", error);
    return NextResponse.redirect(
      new URL(
        `/settings?error=tiktok_auth_failed&message=${encodeURIComponent(
          error instanceof Error ? error.message : "Unknown error"
        )}`,
        request.url
      )
    );
  }
}
