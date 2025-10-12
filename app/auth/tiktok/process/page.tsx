"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { socialMediaApi } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

function TikTokProcessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(true);
  const [hasProcessed, setHasProcessed] = useState(false);

  useEffect(() => {
    async function processCallback() {
      // Prevent duplicate processing
      if (hasProcessed) return;

      // Wait for auth to load
      if (loading) return;

      // Check if user is logged in
      if (!user) {
        console.log("No user found, redirecting to login");
        router.push("/login?from=tiktok");
        return;
      }

      const code = searchParams.get("code");
      const state = searchParams.get("state");

      if (!code) {
        setError("No authorization code received");
        setTimeout(() => router.push("/settings?error=tiktok_no_code"), 2000);
        return;
      }

      // Mark as processed to prevent duplicate runs
      setHasProcessed(true);

      try {
        console.log("Processing TikTok OAuth for user:", user.id);

        // Get code verifier from cookie (client-side can read it)
        const codeVerifier = document.cookie
          .split("; ")
          .find((row) => row.startsWith("tiktok_code_verifier="))
          ?.split("=")[1];

        if (!codeVerifier) {
          throw new Error("Code verifier not found");
        }

        console.log("Exchanging code for access token...");

        // Call our server-side API to exchange the code for tokens
        // This keeps the client_secret secure on the server
        const tokenResponse = await fetch("/api/auth/tiktok/exchange", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            code: code,
            code_verifier: codeVerifier,
          }),
        });

        if (!tokenResponse.ok) {
          const errorData = await tokenResponse.json();
          console.error("Token exchange error:", errorData);
          throw new Error(
            `Token exchange failed: ${
              errorData.error_description || "Unknown error"
            }`
          );
        }

        const tokenData = await tokenResponse.json();
        console.log("Token response data:", tokenData);

        // Check if token exchange returned an error
        if (tokenData.error) {
          throw new Error(
            `Token exchange failed: ${tokenData.error} - ${
              tokenData.error_description || "Unknown error"
            }`
          );
        }

        const { access_token, refresh_token, expires_in, open_id } = tokenData;

        if (!access_token || !open_id) {
          throw new Error("Token response missing required fields");
        }

        console.log("✅ Access token received for open_id:", open_id);

        // Try to get user info (optional - if it fails, we'll use basic info)
        let userInfo: any = {};
        try {
          console.log("Fetching TikTok user info...");
          const userResponse = await fetch(
            "https://open.tiktokapis.com/v2/user/info/?fields=open_id,union_id,avatar_url,display_name,username,profile_deep_link",
            {
              headers: {
                Authorization: `Bearer ${access_token}`,
                "Content-Type": "application/json",
              },
            }
          );

          if (userResponse.ok) {
            const userData = await userResponse.json();
            userInfo = userData.data?.user || {};
            console.log(
              "✅ User info received:",
              userInfo.display_name,
              userInfo.username ? `(@${userInfo.username})` : ""
            );
          } else {
            const errorData = await userResponse.json().catch(() => ({}));
            console.warn(
              "⚠️ Could not fetch user profile (non-critical):",
              userResponse.status,
              errorData
            );
            console.log("Continuing with basic info from token response...");
          }
        } catch (userInfoError) {
          console.warn(
            "⚠️ User info fetch failed (non-critical):",
            userInfoError
          );
          console.log("Continuing with basic info from token response...");
        }

        // Save to database
        console.log("Saving to database...");
        const { error: dbError } = await socialMediaApi.create(user.id, {
          platform: "tiktok",
          platform_user_id: open_id,
          username:
            userInfo.username ||
            userInfo.display_name ||
            `user_${open_id.substring(0, 8)}`,
          display_name: userInfo.display_name,
          profile_picture_url: userInfo.avatar_url,
          access_token: access_token,
          refresh_token: refresh_token,
          token_expires_at: new Date(
            Date.now() + expires_in * 1000
          ).toISOString(),
        });

        if (dbError) {
          console.error("Database error:", dbError);
          throw new Error(`Database error: ${dbError.message}`);
        }

        console.log("✅ TikTok account connected successfully!");

        // Clear the code verifier cookie
        document.cookie =
          "tiktok_code_verifier=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC";

        // Redirect to settings with success message
        router.push("/settings?success=tiktok_connected");
      } catch (err) {
        console.error("TikTok OAuth processing error:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
        setTimeout(() => {
          router.push(
            `/settings?error=tiktok_processing_failed&message=${encodeURIComponent(
              err instanceof Error ? err.message : "Unknown error"
            )}`
          );
        }, 3000);
      } finally {
        setProcessing(false);
      }
    }

    processCallback();
  }, [user, loading, searchParams, router]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6 text-center">
        {processing && !error && (
          <>
            <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Connecting TikTok Account
              </h2>
              <p className="text-muted-foreground">
                Please wait while we complete the connection...
              </p>
            </div>
          </>
        )}

        {error && (
          <>
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
              <span className="text-destructive text-2xl">✗</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Connection Failed
              </h2>
              <p className="text-muted-foreground mb-4">{error}</p>
              <p className="text-sm text-muted-foreground">
                Redirecting back to settings...
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function TikTokProcessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="max-w-md w-full space-y-6 text-center">
            <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Loading...
              </h2>
              <p className="text-muted-foreground">
                Please wait while we prepare your connection...
              </p>
            </div>
          </div>
        </div>
      }
    >
      <TikTokProcessContent />
    </Suspense>
  );
}
