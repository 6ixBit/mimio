"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useDropzone } from "react-dropzone";
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
import {
  Video,
  Upload,
  Loader2,
  CheckCircle,
  XCircle,
  FolderOpen,
  X,
  ImageIcon,
} from "lucide-react";
import { getApiUrl, API_ENDPOINTS } from "@/lib/api-config";
import { useAuth } from "@/lib/auth-context";
import { videosApi, storageApi, projectsApi } from "@/lib/supabase";

type VideoStatus = "idle" | "uploading" | "processing" | "completed" | "error";

interface VideoCreationResult {
  video_id: string;
  status: string;
  message?: string;
  download_url?: string;
}

export default function CreateVideoPage() {
  const searchParams = useSearchParams();
  const { user } = useAuth();

  // Form state - initialize from URL params if available
  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState("sora-2");
  const [size, setSize] = useState("720x1280");
  const [seconds, setSeconds] = useState("8");
  const [imageReference, setImageReference] = useState<File | null>(null);
  const [videoTitle, setVideoTitle] = useState("");
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [projects, setProjects] = useState<Array<{ id: string; name: string }>>(
    []
  );

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

  // UI state
  const [status, setStatus] = useState<VideoStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [videoResult, setVideoResult] = useState<VideoCreationResult | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [isSavingToDatabase, setIsSavingToDatabase] = useState(false);
  const [databaseVideoId, setDatabaseVideoId] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageReference(e.target.files[0]);
    }
  };

  // Dropzone configuration - only accept API-supported formats
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/webp": [".webp"],
      "video/mp4": [".mp4"],
    },
    maxFiles: 1,
    disabled: status !== "idle",
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setImageReference(acceptedFiles[0]);
      }
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("uploading");
    setError(null);
    setProgress(0);

    try {
      // Save to database immediately if user is logged in
      let dbVideoId: string | null = null;
      if (user) {
        const title =
          videoTitle || `Video - ${new Date().toLocaleDateString()}`;
        const { data: videoData, error: dbError } = await videosApi.create(
          user.id,
          {
            title: title,
            video_url: "", // Will be updated when complete
            prompt: prompt,
            model: model,
            size: size,
            duration_seconds: parseInt(seconds),
            status: "processing",
            project_id: selectedProject || undefined,
          }
        );

        if (!dbError && videoData) {
          dbVideoId = (videoData as any).id;
          setDatabaseVideoId(dbVideoId);
          console.log("Video record created in database:", dbVideoId);
        }
      }

      // Prepare form data
      const formData = new FormData();
      formData.append("prompt", prompt);
      formData.append("model", model);
      formData.append("size", size);
      formData.append("seconds", seconds);
      if (imageReference) {
        // If MIME type is missing, infer it from file extension
        let mimeType = imageReference.type;
        if (!mimeType || mimeType === "application/octet-stream") {
          const ext = imageReference.name.toLowerCase().split(".").pop();
          const mimeMap: Record<string, string> = {
            png: "image/png",
            jpg: "image/jpeg",
            jpeg: "image/jpeg",
            webp: "image/webp",
            mp4: "video/mp4",
          };
          mimeType = mimeMap[ext || ""] || "application/octet-stream";
        }

        // Create a new File object with the correct MIME type
        const correctedFile = new File([imageReference], imageReference.name, {
          type: mimeType,
          lastModified: imageReference.lastModified,
        });

        formData.append("image_reference", correctedFile);
      }

      // Call API
      const response = await fetch(getApiUrl(API_ENDPOINTS.CREATE_VIDEO), {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        // Update database to failed status if we created a record
        if (dbVideoId) {
          await videosApi.update(dbVideoId, { status: "failed" });
        }
        throw new Error(errorData.detail || "Failed to create video");
      }

      const result: VideoCreationResult = await response.json();
      setVideoResult(result);
      setStatus("processing");

      // Start polling for status
      pollVideoStatus(result.video_id, dbVideoId);
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  const pollVideoStatus = async (
    videoId: string,
    dbVideoId: string | null = null
  ) => {
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

          // Update database with video URL
          if (dbVideoId) {
            await updateVideoInDatabase(videoId, dbVideoId);
          } else {
            // Fallback: save to Supabase if not already saved
            await saveVideoToSupabase(videoId);
          }
        } else if (
          statusData.status === "failed" ||
          statusData.status === "error"
        ) {
          setStatus("error");
          setError(
            statusData.message || statusData.error || "Video generation failed"
          );
          clearInterval(interval);

          // Update database to failed status
          if (dbVideoId) {
            await videosApi.update(dbVideoId, { status: "failed" });
          }
        } else if (statusData.status === "in_progress") {
          // Keep status as processing while in progress
          setStatus("processing");
        }
      } catch (err) {
        setStatus("error");
        setError(err instanceof Error ? err.message : "Status check failed");
        clearInterval(interval);

        // Update database to failed status
        if (dbVideoId) {
          await videosApi.update(dbVideoId, { status: "failed" });
        }
      }
    }, 3000); // Poll every 3 seconds

    // Cleanup after 5 minutes
    setTimeout(() => clearInterval(interval), 300000);
  };

  const updateVideoInDatabase = async (videoId: string, dbVideoId: string) => {
    if (!user) return;

    try {
      setIsSavingToDatabase(true);

      // Download the video from the API
      const response = await fetch(
        getApiUrl(API_ENDPOINTS.VIDEO_DOWNLOAD(videoId))
      );

      if (!response.ok) {
        throw new Error("Failed to fetch video for upload");
      }

      const videoBlob = await response.blob();

      // Generate a unique filename
      const timestamp = Date.now();
      const fileName = `video_${videoId}_${timestamp}.mp4`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } =
        await storageApi.uploadVideo(user.id, videoBlob, fileName);

      if (uploadError || !uploadData) {
        throw new Error(
          uploadError?.message || "Failed to upload video to storage"
        );
      }

      // Update the existing database record with video URL
      const { error: dbError } = await videosApi.update(dbVideoId, {
        video_url: uploadData.publicUrl,
        status: "completed",
      });

      if (dbError) {
        throw new Error(
          dbError.message || "Failed to update video in database"
        );
      }

      console.log("Video updated in database successfully!");
    } catch (err) {
      console.error("Error updating video in database:", err);
      // Mark as failed if upload fails
      await videosApi.update(dbVideoId, { status: "failed" });
    } finally {
      setIsSavingToDatabase(false);
    }
  };

  const saveVideoToSupabase = async (videoId: string) => {
    if (!user) {
      console.log("User not logged in, skipping save to database");
      return;
    }

    try {
      setIsSavingToDatabase(true);

      // Download the video from the API
      const response = await fetch(
        getApiUrl(API_ENDPOINTS.VIDEO_DOWNLOAD(videoId))
      );

      if (!response.ok) {
        throw new Error("Failed to fetch video for upload");
      }

      const videoBlob = await response.blob();

      // Generate a unique filename
      const timestamp = Date.now();
      const fileName = `video_${videoId}_${timestamp}.mp4`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } =
        await storageApi.uploadVideo(user.id, videoBlob, fileName);

      if (uploadError || !uploadData) {
        throw new Error(
          uploadError?.message || "Failed to upload video to storage"
        );
      }

      // Save metadata to database
      const title = videoTitle || `Video - ${new Date().toLocaleDateString()}`;
      const { error: dbError } = await videosApi.create(user.id, {
        title: title,
        video_url: uploadData.publicUrl,
        prompt: prompt,
        model: model,
        size: size,
        duration_seconds: parseInt(seconds),
        status: "completed",
      });

      if (dbError) {
        throw new Error(dbError.message || "Failed to save video to database");
      }

      console.log("Video saved to Supabase successfully!");
    } catch (err) {
      console.error("Error saving video to Supabase:", err);
      // Don't show error to user as download still works
    } finally {
      setIsSavingToDatabase(false);
    }
  };

  const handleReset = () => {
    setStatus("idle");
    setProgress(0);
    setVideoResult(null);
    setError(null);
    setPrompt("");
    setVideoTitle("");
    setImageReference(null);
    setIsSavingToDatabase(false);
    setDatabaseVideoId(null);
    setSelectedProject("");
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
            {/* Video Title and Project */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Video Title</Label>
                <Input
                  id="title"
                  placeholder="Enter a title for your video (optional)"
                  value={videoTitle}
                  onChange={(e) => setVideoTitle(e.target.value)}
                  disabled={status !== "idle"}
                  className="bg-background border-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="project">Project (Optional)</Label>
                <Select
                  value={selectedProject}
                  onValueChange={setSelectedProject}
                  disabled={status !== "idle"}
                >
                  <SelectTrigger className="bg-background border-border">
                    <SelectValue placeholder="Select a project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        <div className="flex items-center gap-2">
                          <FolderOpen className="w-3 h-3" />
                          {project.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

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

            {/* Model and Duration Selection */}
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

            {/* Image Reference (Optional) - Drag and Drop */}
            <div className="space-y-2">
              <Label htmlFor="image">Reference Image (Optional)</Label>
              <div
                {...getRootProps()}
                className={`
                  relative border-2 border-dashed rounded-lg p-6 transition-all cursor-pointer
                  ${
                    isDragActive
                      ? "border-primary bg-primary/5 scale-[1.02]"
                      : "border-border bg-muted/30 hover:border-primary/50 hover:bg-muted/50"
                  }
                  ${status !== "idle" ? "opacity-50 cursor-not-allowed" : ""}
                `}
              >
                <input {...getInputProps()} />

                {imageReference ? (
                  // File selected state
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        {imageReference.type.startsWith("image/") ? (
                          <ImageIcon className="w-6 h-6 text-primary" />
                        ) : (
                          <Video className="w-6 h-6 text-primary" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {imageReference.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {(imageReference.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="hover:bg-red-500/10 hover:text-red-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        setImageReference(null);
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  // Empty/drag state
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                      <Upload className="w-6 h-6 text-primary" />
                    </div>
                    <p className="text-sm font-medium text-foreground mb-1">
                      {isDragActive ? (
                        "Drop your file here"
                      ) : (
                        <>
                          Drag & drop or{" "}
                          <span className="text-primary">click to browse</span>
                        </>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Supports PNG, JPEG, WebP images and MP4 videos
                    </p>
                  </div>
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
                    {isSavingToDatabase && " Saving to your library..."}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Video ID: {videoResult.video_id}
                  </p>
                  {user && !isSavingToDatabase && (
                    <p className="text-xs text-green-600 mt-1">
                      ✓ Saved to your video library
                    </p>
                  )}
                  {!user && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Sign in to save videos to your library
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleDownload}
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                    disabled={isSavingToDatabase}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Download Video
                  </Button>
                  <Button
                    onClick={handleReset}
                    variant="outline"
                    className="flex-1 border-border"
                    disabled={isSavingToDatabase}
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
