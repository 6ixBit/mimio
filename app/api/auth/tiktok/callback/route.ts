import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { socialMediaApi } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  console.log("TikTok Callback - Code:", code ? "Present" : "Missing");
  console.log("TikTok Callback - State:", state);
  console.log("TikTok Callback - Error:", error);

  // Handle user denial
  if (error === "access_denied") {
    return NextResponse.redirect(
      new URL("/settings?error=tiktok_denied", request.url)
    );
  }

  // Verify state to prevent CSRF
  const storedState = request.cookies.get("tiktok_oauth_state")?.value;
  console.log("TikTok Callback - Stored State:", storedState);

  if (!state || state !== storedState) {
    console.log("State mismatch - CSRF check failed");
    return NextResponse.redirect(
      new URL("/settings?error=tiktok_invalid_state", request.url)
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL("/settings?error=tiktok_auth_failed", request.url)
    );
  }

  // Get code verifier from cookie (required for PKCE)
  const codeVerifier = request.cookies.get("tiktok_code_verifier")?.value;
  if (!codeVerifier) {
    console.log("Code verifier missing - PKCE check failed");
    return NextResponse.redirect(
      new URL("/settings?error=tiktok_missing_verifier", request.url)
    );
  }

  // Get user ID from cookies (we'll use a different approach)
  // Instead of checking auth here, we'll pass the user context via session
  const cookieStore = await cookies();
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
            // Ignore
          }
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  console.log(
    "TikTok Callback - User:",
    user ? `Found: ${user.id}` : "No user found"
  );

  if (!user) {
    console.log("No user session - redirecting to login");
    // Save the authorization code in a cookie and redirect to a client-side handler
    const response = NextResponse.redirect(
      new URL("/login?from=tiktok_callback", request.url)
    );
    response.cookies.set("tiktok_pending_code", code, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 300, // 5 minutes
    });
    return response;
  }

  try {
    console.log("Exchanging code for access token...");

    // Exchange code for access token with PKCE
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
          code_verifier: codeVerifier, // Required for PKCE
        }),
      }
    );

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error("TikTok token exchange error:", errorData);
      throw new Error(`Token exchange failed: ${JSON.stringify(errorData)}`);
    }

    const tokenData = await tokenResponse.json();
    console.log("Token data received:", {
      has_access_token: !!tokenData.access_token,
      has_refresh: !!tokenData.refresh_token,
    });

    const { access_token, refresh_token, expires_in, open_id } = tokenData;

    // Get user info
    console.log("Fetching TikTok user info...");
    const userResponse = await fetch(
      "https://open.tiktokapis.com/v2/user/info/?fields=open_id,union_id,avatar_url,display_name",
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    if (!userResponse.ok) {
      const errorText = await userResponse.text();
      console.error("User info fetch error:", errorText);
      throw new Error("Failed to fetch user profile");
    }

    const userData = await userResponse.json();
    const userInfo = userData.data?.user || {};
    console.log("TikTok user info:", {
      display_name: userInfo.display_name,
      open_id,
    });

    // Save to database
    console.log("Saving to database...");
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
      throw new Error(`Failed to save account to database: ${dbError.message}`);
    }

    console.log("✅ TikTok account connected successfully!");

    // Clear the cookies and redirect to settings with success message
    const response = NextResponse.redirect(
      new URL("/settings?success=tiktok_connected", request.url)
    );
    response.cookies.delete("tiktok_oauth_state");
    response.cookies.delete("tiktok_code_verifier");

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
