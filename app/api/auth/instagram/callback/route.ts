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
      new URL("/settings?error=instagram_denied", request.url)
    );
  }

  // Verify state to prevent CSRF
  const storedState = request.cookies.get("instagram_oauth_state")?.value;
  if (!state || state !== storedState) {
    return NextResponse.redirect(
      new URL("/settings?error=instagram_invalid_state", request.url)
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL("/settings?error=instagram_auth_failed", request.url)
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
    // Exchange code for short-lived access token
    const tokenResponse = await fetch(
      "https://api.instagram.com/oauth/access_token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: process.env.NEXT_PUBLIC_INSTAGRAM_APP_ID!,
          client_secret: process.env.INSTAGRAM_APP_SECRET!,
          grant_type: "authorization_code",
          redirect_uri: process.env.NEXT_PUBLIC_INSTAGRAM_REDIRECT_URI!,
          code: code,
        }),
      }
    );

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error("Instagram token exchange error:", errorData);
      throw new Error("Failed to exchange code for token");
    }

    const tokenData = await tokenResponse.json();
    const { access_token, user_id } = tokenData;

    // Exchange short-lived token for long-lived token (60 days)
    const longLivedResponse = await fetch(
      `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${process.env.INSTAGRAM_APP_SECRET}&access_token=${access_token}`
    );

    if (!longLivedResponse.ok) {
      console.error("Failed to get long-lived token, using short-lived token");
    }

    const longLivedData = await longLivedResponse.json();
    const finalAccessToken = longLivedData.access_token || access_token;
    const expiresIn = longLivedData.expires_in || 3600; // Default 1 hour for short-lived

    // Get user profile info
    const userResponse = await fetch(
      `https://graph.instagram.com/me?fields=id,username,account_type&access_token=${finalAccessToken}`
    );

    if (!userResponse.ok) {
      throw new Error("Failed to fetch user profile");
    }

    const userData = await userResponse.json();

    // Save to database
    const { error: dbError } = await socialMediaApi.create(user.id, {
      platform: "instagram",
      platform_user_id: user_id.toString(),
      username: userData.username,
      display_name: userData.username,
      access_token: finalAccessToken,
      token_expires_at: new Date(Date.now() + expiresIn * 1000).toISOString(),
    });

    if (dbError) {
      console.error("Database error:", dbError);
      throw new Error("Failed to save account to database");
    }

    // Clear the state cookie
    const response = NextResponse.redirect(
      new URL("/settings?success=instagram_connected", request.url)
    );
    response.cookies.delete("instagram_oauth_state");

    return response;
  } catch (error) {
    console.error("Instagram OAuth error:", error);
    return NextResponse.redirect(
      new URL(
        `/settings?error=instagram_auth_failed&message=${encodeURIComponent(
          error instanceof Error ? error.message : "Unknown error"
        )}`,
        request.url
      )
    );
  }
}
