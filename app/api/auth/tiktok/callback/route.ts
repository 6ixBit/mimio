import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");
  const scopes = searchParams.get("scopes");

  console.log("TikTok Callback - Code:", code ? "Present" : "Missing");
  console.log("TikTok Callback - State:", state);
  console.log("TikTok Callback - Error:", error);
  console.log("TikTok Callback - Scopes:", scopes);

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
      new URL("/settings?error=tiktok_auth_failed&reason=no_code", request.url)
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

  console.log("✅ All OAuth checks passed, redirecting to client handler...");

  // Instead of handling auth server-side, redirect to a client page that will:
  // 1. Verify user is logged in (client-side)
  // 2. Exchange the code for tokens
  // 3. Save to database
  // This avoids the server-side cookie/session issues with Next.js App Router

  const callbackUrl = new URL("/auth/tiktok/process", request.url);
  callbackUrl.searchParams.set("code", code);
  callbackUrl.searchParams.set("state", state);
  if (scopes) callbackUrl.searchParams.set("scopes", scopes);

  const response = NextResponse.redirect(callbackUrl);
  
  // Keep the code verifier cookie for the client-side handler
  // Don't delete it yet - the client page will need it
  response.cookies.delete("tiktok_oauth_state"); // State is verified, safe to delete

  return response;
}
