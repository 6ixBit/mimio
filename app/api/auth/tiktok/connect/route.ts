import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

// Generate code verifier for PKCE
function generateCodeVerifier(): string {
  return crypto.randomBytes(32).toString("base64url");
}

// Generate code challenge from verifier
function generateCodeChallenge(verifier: string): string {
  return crypto.createHash("sha256").update(verifier).digest("base64url");
}

export async function GET(request: NextRequest) {
  // Note: We skip server-side auth check here because Supabase cookies aren't
  // reliably passed from client to server in Next.js App Router with client-side auth.
  // The client-side ensures user is logged in before calling this route,
  // and we'll verify the user again in the callback when storing tokens.

  // Generate a random state for CSRF protection
  const state = crypto.randomBytes(16).toString("hex");

  // Generate PKCE code verifier and challenge (required by TikTok)
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(codeVerifier);

  // Build TikTok OAuth URL with PKCE parameters
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

  // Add PKCE parameters (required by TikTok)
  authUrl.searchParams.set("code_challenge", codeChallenge);
  authUrl.searchParams.set("code_challenge_method", "S256");

  console.log("TikTok OAuth - Redirecting with PKCE to:", authUrl.toString());

  // Store state and code verifier in cookies for verification later
  const response = NextResponse.redirect(authUrl.toString());

  response.cookies.set("tiktok_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600, // 10 minutes
  });

  response.cookies.set("tiktok_code_verifier", codeVerifier, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600, // 10 minutes
  });

  return response;
}
