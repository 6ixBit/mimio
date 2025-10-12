"use client";

import { useState } from "react";
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
import { Video, Upload, FolderOpen, X, ImageIcon, Loader2 } from "lucide-react";
import { VideoApiClient } from "@/lib/video-api-client";
import { videosApi } from "@/lib/supabase";
import type { TrackedVideo } from "@/lib/video-api-types";

interface SingleVideoFormProps {
  user: any;
  projects: Array<{ id: string; name: string }>;
  defaultValues?: {
    prompt?: string;
    model?: string;
    size?: string;
    seconds?: string;
    template_id?: string;
  };
  onStart: (videos: TrackedVideo[]) => void;
}

export function SingleVideoForm({
  user,
  projects,
  defaultValues = {},
  onStart,
}: SingleVideoFormProps) {
  // Form state
  const [videoTitle, setVideoTitle] = useState("");
  const [prompt, setPrompt] = useState(defaultValues.prompt || "");
  const [model, setModel] = useState(defaultValues.model || "sora-2");
  const [size, setSize] = useState(defaultValues.size || "720x1280");
  const [seconds, setSeconds] = useState(defaultValues.seconds || "8");
  const [selectedProject, setSelectedProject] = useState("");
  const [imageReference, setImageReference] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dropzone for image reference
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/webp": [".webp"],
      "video/mp4": [".mp4"],
    },
    maxFiles: 1,
    disabled: isSubmitting,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setImageReference(acceptedFiles[0]);
      }
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Create database record first (if user is logged in)
      let dbId: string | undefined;
      if (user) {
        const title =
          videoTitle || `Video - ${new Date().toLocaleDateString()}`;
        const { data: videoData, error: dbError } = await videosApi.create(
          user.id,
          {
            title,
            video_url: "",
            prompt,
            model,
            size,
            duration_seconds: parseInt(seconds),
            status: "processing",
            project_id: selectedProject || undefined,
            template_id: defaultValues?.template_id || undefined,
          }
        );

        if (!dbError && videoData) {
          dbId = (videoData as any).id;
        }
      }

      // Call API to create video
      const result = await VideoApiClient.createSingle({
        prompt,
        model,
        size,
        seconds,
        imageReference: imageReference || undefined,
        project_id: selectedProject || undefined,
      });

      // Update database with external video ID for polling
      if (user && dbId) {
        await videosApi.update(dbId, {
          external_video_id: result.video_id,
        });
      }

      // Create tracked video
      const trackedVideo: TrackedVideo = {
        id: result.video_id,
        dbId,
        title: videoTitle || `Video - ${new Date().toLocaleDateString()}`,
        prompt,
        status: "processing",
        progress: 0,
        model,
        size,
        seconds,
        createdAt: new Date(),
        result,
      };

      // Pass to parent to start tracking
      onStart([trackedVideo]);

      // Reset form
      setVideoTitle("");
      setPrompt("");
      setImageReference(null);
    } catch (error) {
      console.error("Creation error:", error);
      alert(error instanceof Error ? error.message : "Failed to create video");
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="w-5 h-5 text-primary" />
          Single Video Configuration
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title and Project */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Video Title</Label>
              <Input
                id="title"
                placeholder="Enter a title (optional)"
                value={videoTitle}
                onChange={(e) => setVideoTitle(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="project">Project (Optional)</Label>
              <Select
                value={selectedProject}
                onValueChange={setSelectedProject}
                disabled={isSubmitting}
              >
                <SelectTrigger>
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
              disabled={isSubmitting}
              className="h-[400px] resize-y text-lg leading-loose font-mono"
              style={{ height: "400px" }}
            />
            <p className="text-xs text-muted-foreground">
              Be specific and descriptive for best results
            </p>
          </div>

          {/* Model and Duration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Select
                value={model}
                onValueChange={setModel}
                disabled={isSubmitting}
              >
                <SelectTrigger>
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
                disabled={isSubmitting}
              >
                <SelectTrigger>
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

          {/* Resolution */}
          <div className="space-y-2">
            <Label htmlFor="size">Resolution</Label>
            <Select
              value={size}
              onValueChange={setSize}
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="720x1280">
                  720x1280 - Vertical (TikTok, Reels, Shorts)
                </SelectItem>
                <SelectItem value="1280x720">
                  1280x720 - Horizontal (YouTube, Twitter/X)
                </SelectItem>
                <SelectItem value="1024x1792">
                  1024x1792 - Portrait (Instagram Stories)
                </SelectItem>
                <SelectItem value="1792x1024">
                  1792x1024 - Landscape (Facebook, LinkedIn)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Image Reference */}
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
                ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}
              `}
            >
              <input {...getInputProps()} />

              {imageReference ? (
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
                      <p className="text-sm font-medium">
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
                    onClick={(e) => {
                      e.stopPropagation();
                      setImageReference(null);
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                    <Upload className="w-6 h-6 text-primary" />
                  </div>
                  <p className="text-sm font-medium mb-1">
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
                    PNG, JPEG, WebP images and MP4 videos
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={!prompt || isSubmitting}
            className="w-full bg-primary hover:bg-primary/90"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating Video...
              </>
            ) : (
              <>
                <Video className="w-4 h-4 mr-2" />
                Generate Video
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
