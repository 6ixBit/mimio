import { NextRequest, NextResponse } from "next/server";
import { socialMediaApi } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const { video_url, caption, account_id, post_id, user_id } =
      await request.json();

    if (!video_url || !account_id || !post_id || !user_id) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Get the social media account to retrieve access token
    const { data: accounts, error: accountError } = await socialMediaApi.getAll(
      user_id
    );

    if (accountError) throw accountError;

    const account: any = accounts?.find((acc: any) => acc.id === account_id);

    if (!account) {
      return NextResponse.json(
        { error: "Social media account not found" },
        { status: 404 }
      );
    }

    if (!account.access_token) {
      return NextResponse.json(
        { error: "Account not authenticated" },
        { status: 401 }
      );
    }

    // Step 1: Initialize the upload (using INBOX for draft mode)
    // Note: This sends the video to user's inbox for them to review and post
    console.log("Initializing TikTok upload to inbox...");
    const initResponse = await fetch(
      "https://open.tiktokapis.com/v2/post/publish/inbox/video/init/",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${account.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          source_info: {
            source: "PULL_FROM_URL",
            video_url: video_url,
          },
        }),
      }
    );

    const initData = await initResponse.json();

    if (!initResponse.ok) {
      console.error("TikTok init error:", initData);
      return NextResponse.json(
        {
          error: "tiktok_init_failed",
          message:
            initData.error?.message ||
            initData.error?.code ||
            "Failed to initialize upload",
          details: initData,
        },
        { status: initResponse.status }
      );
    }

    console.log("✅ TikTok upload initialized:", initData.data?.publish_id);

    // TikTok will pull the video from the URL and send it to user's inbox
    // User will get a notification to review and post the video
    return NextResponse.json({
      success: true,
      post_id: initData.data?.publish_id,
      post_url: null,
      message:
        "Video uploaded to TikTok! Check your TikTok notifications to review and post.",
    });
  } catch (error) {
    console.error("TikTok upload error:", error);
    return NextResponse.json(
      {
        error: "upload_failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
