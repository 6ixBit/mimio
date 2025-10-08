"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Video, Copy } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { videosApi, storageApi, projectsApi } from "@/lib/supabase";
import { VideoApiClient } from "@/lib/video-api-client";
import type { TrackedVideo, VideoStatusResponse } from "@/lib/video-api-types";

// Import creation mode components
import { SingleVideoForm } from "./components/SingleVideoForm";
import { VariationsForm } from "./components/VariationsForm";
import { BatchVideoProgress } from "@/components/video-creation/BatchVideoProgress";

export default function CreateVideoPage() {
  const searchParams = useSearchParams();
  const { user } = useAuth();

  // Shared state
  const [projects, setProjects] = useState<Array<{ id: string; name: string }>>(
    []
  );

  // Get initial tab from URL params
  const urlMode = searchParams.get("mode") || "single";
  const initialTab = urlMode === "variations" ? "variations" : "single";
  const [activeTab, setActiveTab] = useState(initialTab);

  // Video tracking state
  const [trackedVideos, setTrackedVideos] = useState<TrackedVideo[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Update tab when URL mode changes
  useEffect(() => {
    const urlMode = searchParams.get("mode") || "single";
    const newTab = urlMode === "variations" ? "variations" : "single";
    setActiveTab(newTab);
  }, [searchParams]);

  // Fetch user's projects
  useEffect(() => {
    async function fetchProjects() {
      if (!user) return;

      try {
        const { data, error } = await projectsApi.getAll(user.id);
        if (!error && data) {
          setProjects(data);
        }
      } catch (err) {
        console.error("Error fetching projects:", err);
      }
    }

    fetchProjects();
  }, [user]);

  // Pre-fill from URL params (e.g., from templates)
  const urlPrompt = searchParams.get("prompt") || "";
  const urlModel = searchParams.get("model") || "sora-2";
  const urlSize = searchParams.get("size") || "720x1280";
  const urlSeconds = searchParams.get("seconds") || "8";

  /**
   * Handle video download
   */
  const handleDownload = async (videoId: string, title: string) => {
    try {
      const videoBlob = await VideoApiClient.downloadVideo(videoId);
      const url = window.URL.createObjectURL(videoBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${title || `video_${videoId}`}.mp4`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Download error:", error);
      alert("Failed to download video");
    }
  };

  /**
   * Poll for video status updates
   */
  const pollVideoStatus = async (video: TrackedVideo) => {
    const interval = setInterval(async () => {
      try {
        const status = await VideoApiClient.getStatus(video.id);

        // Update tracked video
        setTrackedVideos((prev) =>
          prev.map((v) =>
            v.id === video.id
              ? {
                  ...v,
                  progress: status.progress || 0,
                  status:
                    status.status === "completed"
                      ? "completed"
                      : status.status === "failed"
                      ? "error"
                      : "processing",
                  error: status.error || status.message,
                }
              : v
          )
        );

        // Check if completed
        if (status.status === "completed" && status.progress === 100) {
          clearInterval(interval);

          // Upload to Supabase Storage and update database
          if (video.dbId) {
            await saveVideoToSupabase(video.id, video.dbId);
          }
        } else if (status.status === "failed" || status.status === "error") {
          clearInterval(interval);

          // Mark as failed in database
          if (video.dbId) {
            await videosApi.update(video.dbId, { status: "failed" });
          }
        }
      } catch (error) {
        console.error("Polling error:", error);
        clearInterval(interval);

        // Mark as failed
        setTrackedVideos((prev) =>
          prev.map((v) =>
            v.id === video.id
              ? { ...v, status: "error", error: "Failed to fetch status" }
              : v
          )
        );

        if (video.dbId) {
          await videosApi.update(video.dbId, { status: "failed" });
        }
      }
    }, 3000);

    // Cleanup after 5 minutes
    setTimeout(() => clearInterval(interval), 300000);
  };

  /**
   * Save completed video to Supabase
   */
  const saveVideoToSupabase = async (videoId: string, dbId: string) => {
    if (!user) return;

    try {
      // Download video
      const videoBlob = await VideoApiClient.downloadVideo(videoId);

      // Upload to Supabase Storage
      const timestamp = Date.now();
      const fileName = `video_${videoId}_${timestamp}.mp4`;
      const { data: uploadData, error: uploadError } =
        await storageApi.uploadVideo(user.id, videoBlob, fileName);

      if (uploadError || !uploadData) {
        throw new Error("Failed to upload video");
      }

      // Update database record
      await videosApi.update(dbId, {
        video_url: uploadData.publicUrl,
        status: "completed",
      });

      console.log("Video saved to Supabase:", dbId);
    } catch (error) {
      console.error("Error saving to Supabase:", error);
      // Mark as failed
      await videosApi.update(dbId, { status: "failed" });
    }
  };

  /**
   * Reset all tracked videos
   */
  const handleReset = () => {
    setTrackedVideos([]);
    setIsProcessing(false);
  };

  /**
   * Handle starting video creation (called from child forms)
   */
  const handleStartVideos = (videos: TrackedVideo[]) => {
    setTrackedVideos(videos);
    setIsProcessing(true);

    // Start polling for each video
    videos.forEach((video) => {
      pollVideoStatus(video);
    });
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Create Videos
        </h1>
        <p className="text-muted-foreground">
          Generate professional AI videos with Sora
        </p>
      </div>

      {/* Show progress if videos are being tracked */}
      {trackedVideos.length > 0 ? (
        <BatchVideoProgress
          videos={trackedVideos}
          onDownload={handleDownload}
          onReset={handleReset}
        />
      ) : (
        /* Creation Forms */
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="single" className="flex items-center gap-2">
              <Video className="w-4 h-4" />
              <span>Single Video</span>
            </TabsTrigger>
            <TabsTrigger value="variations" className="flex items-center gap-2">
              <Copy className="w-4 h-4" />
              <span>Variations</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="single">
            <SingleVideoForm
              user={user}
              projects={projects}
              defaultValues={{
                prompt: urlPrompt,
                model: urlModel,
                size: urlSize,
                seconds: urlSeconds,
              }}
              onStart={handleStartVideos}
            />
          </TabsContent>

          <TabsContent value="variations">
            <VariationsForm
              user={user}
              projects={projects}
              defaultValues={{
                model: urlModel,
                size: urlSize,
                seconds: urlSeconds,
              }}
              onStart={handleStartVideos}
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
