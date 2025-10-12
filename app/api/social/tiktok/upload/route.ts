import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
  try {
    const { video_url, caption, account_id, post_id, user_id } =
      await request.json();

    console.log("TikTok Upload Request:", {
      video_url,
      account_id,
      post_id,
      user_id,
    });

    if (!video_url || !account_id || !post_id || !user_id) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Create Supabase client with service role for server-side operations
    // This bypasses RLS policies to access the data directly
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Get the social media account to retrieve access token
    console.log("Fetching accounts for user:", user_id);
    const { data: accounts, error: accountError } = await supabase
      .from("social_media_accounts")
      .select("*")
      .eq("user_id", user_id);

    if (accountError) {
      console.error("Error fetching accounts:", accountError);
      throw accountError;
    }

    console.log("Found accounts:", accounts?.length || 0);

    if (accounts && accounts.length > 0) {
      console.log(
        "Account IDs:",
        accounts.map((acc: any) => acc.id)
      );
    }

    const account: any = accounts?.find((acc: any) => acc.id === account_id);

    console.log("Looking for account_id:", account_id);
    console.log("Matched account:", account ? "Found" : "Not found");

    if (!account) {
      return NextResponse.json(
        {
          error: "Social media account not found",
          debug: {
            account_id_received: account_id,
            available_account_ids: accounts?.map((acc: any) => acc.id) || [],
            user_id: user_id,
          },
        },
        { status: 404 }
      );
    }

    if (!account.access_token) {
      return NextResponse.json(
        { error: "Account not authenticated" },
        { status: 401 }
      );
    }

    // Step 1: Download the video from Supabase
    console.log("Downloading video from:", video_url);
    const videoResponse = await fetch(video_url);

    if (!videoResponse.ok) {
      throw new Error("Failed to download video from storage");
    }

    const videoBlob = await videoResponse.blob();
    const videoSize = videoBlob.size;

    console.log("Video downloaded, size:", videoSize, "bytes");

    // Step 2: Initialize the upload (using FILE_UPLOAD for inbox/draft mode)
    console.log("Initializing TikTok file upload...");
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
            source: "FILE_UPLOAD",
            video_size: videoSize,
            chunk_size: videoSize, // Upload in one chunk
            total_chunk_count: 1,
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

    // Step 3: Upload the video file to TikTok's upload URL
    const uploadUrl = initData.data?.upload_url;

    if (!uploadUrl) {
      throw new Error("No upload URL received from TikTok");
    }

    console.log("Uploading video to TikTok...");

    // Convert blob to buffer for upload
    const videoBuffer = await videoBlob.arrayBuffer();

    const uploadResponse = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "video/mp4",
        "Content-Range": `bytes 0-${videoSize - 1}/${videoSize}`,
      },
      body: videoBuffer,
    });

    if (!uploadResponse.ok) {
      const uploadError = await uploadResponse.text();
      console.error("TikTok upload error:", uploadError);
      throw new Error(
        `Failed to upload video to TikTok: ${uploadResponse.status}`
      );
    }

    console.log("✅ Video uploaded successfully to TikTok");

    // TikTok will process the video and send it to user's inbox
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
