"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Video, Upload, Loader2, CheckCircle, XCircle } from "lucide-react";
import { getApiUrl, API_ENDPOINTS } from "@/lib/api-config";

type VideoStatus = "idle" | "uploading" | "processing" | "completed" | "error";

interface VideoCreationResult {
  video_id: string;
  status: string;
  message?: string;
  download_url?: string;
}

export default function CreateVideoPage() {
  const searchParams = useSearchParams();
  
  // Form state - initialize from URL params if available
  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState("sora-2");
  const [size, setSize] = useState("720x1280");
  const [seconds, setSeconds] = useState("8");
  const [imageReference, setImageReference] = useState<File | null>(null);

  // Pre-fill form from URL parameters (e.g., from templates)
  useEffect(() => {
    const urlPrompt = searchParams.get("prompt");
    const urlModel = searchParams.get("model");
    const urlSize = searchParams.get("size");
    const urlSeconds = searchParams.get("seconds");

    if (urlPrompt) setPrompt(urlPrompt);
    if (urlModel) setModel(urlModel);
    if (urlSize) setSize(urlSize);
    if (urlSeconds) setSeconds(urlSeconds);
  }, [searchParams]);

  // UI state
  const [status, setStatus] = useState<VideoStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [videoResult, setVideoResult] = useState<VideoCreationResult | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageReference(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("uploading");
    setError(null);
    setProgress(0);

    try {
      // Prepare form data
      const formData = new FormData();
      formData.append("prompt", prompt);
      formData.append("model", model);
      formData.append("size", size);
      formData.append("seconds", seconds);
      if (imageReference) {
        formData.append("image_reference", imageReference);
      }

      // Call API
      const response = await fetch(getApiUrl(API_ENDPOINTS.CREATE_VIDEO), {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to create video");
      }

      const result: VideoCreationResult = await response.json();
      setVideoResult(result);
      setStatus("processing");

      // Start polling for status
      pollVideoStatus(result.video_id);
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  const pollVideoStatus = async (videoId: string) => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(
          getApiUrl(API_ENDPOINTS.VIDEO_STATUS(videoId))
        );

        if (!response.ok) {
          throw new Error("Failed to fetch video status");
        }

        const statusData = await response.json();

        // Update progress using actual API progress value
        if (statusData.progress !== undefined) {
          setProgress(statusData.progress);
        }

        // Check if video is completed (status is "completed" and progress is 100)
        if (statusData.status === "completed" && statusData.progress === 100) {
          setStatus("completed");
          setProgress(100);
          clearInterval(interval);
          setVideoResult(statusData);
        } else if (
          statusData.status === "failed" ||
          statusData.status === "error"
        ) {
          setStatus("error");
          setError(
            statusData.message || statusData.error || "Video generation failed"
          );
          clearInterval(interval);
        } else if (statusData.status === "in_progress") {
          // Keep status as processing while in progress
          setStatus("processing");
        }
      } catch (err) {
        setStatus("error");
        setError(err instanceof Error ? err.message : "Status check failed");
        clearInterval(interval);
      }
    }, 3000); // Poll every 3 seconds

    // Cleanup after 5 minutes
    setTimeout(() => clearInterval(interval), 300000);
  };

  const handleReset = () => {
    setStatus("idle");
    setProgress(0);
    setVideoResult(null);
    setError(null);
    setPrompt("");
    setImageReference(null);
  };

  const handleDownload = async () => {
    if (!videoResult?.video_id) return;

    try {
      const response = await fetch(
        getApiUrl(API_ENDPOINTS.VIDEO_DOWNLOAD(videoResult.video_id))
      );

      if (!response.ok) {
        throw new Error("Failed to download video");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `video_${videoResult.video_id}.mp4`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Download failed");
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Main Form */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="w-5 h-5 text-primary" />
            Video Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Prompt */}
            <div className="space-y-2">
              <Label htmlFor="prompt">
                Prompt <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="prompt"
                placeholder="Describe the video you want to create..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                required
                disabled={status !== "idle"}
                className="min-h-[100px] bg-background border-border"
              />
              <p className="text-xs text-muted-foreground">
                Be specific and descriptive for best results
              </p>
            </div>

            {/* Model Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="model">Model</Label>
                <Select
                  value={model}
                  onValueChange={setModel}
                  disabled={status !== "idle"}
                >
                  <SelectTrigger className="bg-background border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sora-2">Sora 2</SelectItem>
                    <SelectItem value="sora-2-pro">Sora 2 Pro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duration</Label>
                <Select
                  value={seconds}
                  onValueChange={setSeconds}
                  disabled={status !== "idle"}
                >
                  <SelectTrigger className="bg-background border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="4">4 seconds</SelectItem>
                    <SelectItem value="8">8 seconds</SelectItem>
                    <SelectItem value="12">12 seconds</SelectItem>
                    <SelectItem value="15">15 seconds</SelectItem>
                    <SelectItem value="30">30 seconds</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Size/Resolution */}
            <div className="space-y-2">
              <Label htmlFor="size">Resolution</Label>
              <Select
                value={size}
                onValueChange={setSize}
                disabled={status !== "idle"}
              >
                <SelectTrigger className="bg-background border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="720x1280">
                    720x1280 - Vertical (TikTok, Instagram Reels, YouTube
                    Shorts)
                  </SelectItem>
                  <SelectItem value="1280x720">
                    1280x720 - Horizontal (YouTube, Twitter/X)
                  </SelectItem>
                  <SelectItem value="1024x1792">
                    1024x1792 - Portrait (Instagram Stories, Snapchat)
                  </SelectItem>
                  <SelectItem value="1792x1024">
                    1792x1024 - Landscape (Facebook, LinkedIn)
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Choose the format that matches your target platform
              </p>
            </div>

            {/* Image Reference (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="image">Reference Image (Optional)</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="image"
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileChange}
                  disabled={status !== "idle"}
                  className="bg-background border-border"
                />
                {imageReference && (
                  <Badge variant="outline" className="text-xs">
                    {imageReference.name}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Upload an image or video to guide the generation
              </p>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={!prompt || status !== "idle"}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {status === "idle" ? (
                <>
                  <Video className="w-4 h-4 mr-2" />
                  Generate Video
                </>
              ) : (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Status Card */}
      {(status === "uploading" ||
        status === "processing" ||
        status === "completed" ||
        status === "error") && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {status === "completed" && (
                <CheckCircle className="w-5 h-5 text-green-600" />
              )}
              {status === "error" && (
                <XCircle className="w-5 h-5 text-red-600" />
              )}
              {(status === "uploading" || status === "processing") && (
                <Loader2 className="w-5 h-5 text-primary animate-spin" />
              )}
              {status === "completed" && "Video Ready!"}
              {status === "error" && "Error"}
              {status === "uploading" && "Uploading..."}
              {status === "processing" && "Generating Video..."}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {(status === "uploading" || status === "processing") && (
              <>
                <Progress value={progress} className="h-2" />
                <p className="text-sm text-muted-foreground text-center">
                  {progress}% complete
                  {progress < 100 && " - This may take a few minutes"}
                  {progress === 100 && " - Finalizing your video..."}
                </p>
              </>
            )}

            {status === "completed" && videoResult && (
              <div className="space-y-4">
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <p className="text-sm text-green-700">
                    Your video has been generated successfully!
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Video ID: {videoResult.video_id}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleDownload}
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Download Video
                  </Button>
                  <Button
                    onClick={handleReset}
                    variant="outline"
                    className="flex-1 border-border"
                  >
                    Create Another
                  </Button>
                </div>
              </div>
            )}

            {status === "error" && error && (
              <div className="space-y-4">
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="w-full border-border"
                >
                  Try Again
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
