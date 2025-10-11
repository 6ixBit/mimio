import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { code, code_verifier } = await request.json();

    if (!code || !code_verifier) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Exchange authorization code for access token
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
          code_verifier: code_verifier,
        }),
      }
    );

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error("TikTok token exchange error:", tokenData);
      return NextResponse.json(
        {
          error: tokenData.error || "token_exchange_failed",
          error_description:
            tokenData.error_description || "Failed to exchange token",
        },
        { status: tokenResponse.status }
      );
    }

    // Return the token data to the client
    return NextResponse.json(tokenData);
  } catch (error) {
    console.error("Token exchange server error:", error);
    return NextResponse.json(
      { error: "internal_server_error", error_description: "Server error" },
      { status: 500 }
    );
  }
}

