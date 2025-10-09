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
import {
  Copy,
  Upload,
  FolderOpen,
  X,
  ImageIcon,
  Video,
  Loader2,
} from "lucide-react";
import { VideoApiClient } from "@/lib/video-api-client";
import { videosApi } from "@/lib/supabase";
import type { TrackedVideo } from "@/lib/video-api-types";

interface VariationsFormProps {
  user: any;
  projects: Array<{ id: string; name: string }>;
  defaultValues?: {
    model?: string;
    size?: string;
    seconds?: string;
    template_id?: string;
  };
  onStart: (videos: TrackedVideo[]) => void;
}

export function VariationsForm({
  user,
  projects,
  defaultValues = {},
  onStart,
}: VariationsFormProps) {
  // Form state
  const [videoTitle, setVideoTitle] = useState("");
  const [prompt, setPrompt] = useState("");
  const [variationCount, setVariationCount] = useState("3");
  const [model, setModel] = useState(defaultValues.model || "sora-2");
  const [size, setSize] = useState(defaultValues.size || "720x1280");
  const [seconds, setSeconds] = useState(defaultValues.seconds || "8");
  const [selectedProject, setSelectedProject] = useState("");
  const [imageReference, setImageReference] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dropzone
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
      const count = parseInt(variationCount);

      // Create variations via API
      const result = await VideoApiClient.createVariations({
        prompt,
        variations: count,
        model,
        size,
        seconds,
        image_reference: imageReference || undefined,
      });

      // Create tracked videos for each variation
      const trackedVideos: TrackedVideo[] = await Promise.all(
        result.videos.map(async (video, index) => {
          // Create database record if user is logged in
          let dbId: string | undefined;
          if (user) {
            const title =
              videoTitle ||
              `Variation ${index + 1} - ${new Date().toLocaleDateString()}`;
            const { data: videoData } = await videosApi.create(user.id, {
              title,
              video_url: "",
              prompt,
              model,
              size,
              duration_seconds: parseInt(seconds),
              status: "processing",
              project_id: selectedProject || undefined,
              template_id: defaultValues?.template_id || undefined,
            });

            if (videoData) {
              dbId = (videoData as any).id;
              // Update with external video ID for polling
              await videosApi.update(dbId, {
                external_video_id: video.video_id,
              });
            }
          }

          return {
            id: video.video_id,
            dbId,
            title:
              videoTitle ||
              `Variation ${index + 1} - ${new Date().toLocaleDateString()}`,
            prompt,
            status: "processing" as const,
            progress: 0,
            model,
            size,
            seconds,
            createdAt: new Date(),
          };
        })
      );

      // Pass to parent to start tracking
      onStart(trackedVideos);

      // Reset form
      setVideoTitle("");
      setPrompt("");
      setImageReference(null);
    } catch (error) {
      console.error("Creation error:", error);
      alert(
        error instanceof Error ? error.message : "Failed to create variations"
      );
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Copy className="w-5 h-5 text-primary" />
          Create Variations
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Generate multiple variations of the same video with one prompt
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Base Title and Project */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Base Title (Optional)</Label>
              <Input
                id="title"
                placeholder="e.g., Product Ad"
                value={videoTitle}
                onChange={(e) => setVideoTitle(e.target.value)}
                disabled={isSubmitting}
              />
              <p className="text-xs text-muted-foreground">
                Will be numbered: "Product Ad 1", "Product Ad 2", etc.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="variations">Number of Variations</Label>
              <Select
                value={variationCount}
                onValueChange={setVariationCount}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 variation</SelectItem>
                  <SelectItem value="2">2 variations</SelectItem>
                  <SelectItem value="3">3 variations</SelectItem>
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
              placeholder="Describe the video you want to create variations of..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              required
              disabled={isSubmitting}
              className="h-[400px] resize-y text-lg leading-loose font-mono"
              style={{ height: "400px" }}
            />
            <p className="text-xs text-muted-foreground">
              Each variation will use this same prompt but generate unique
              results
            </p>
          </div>

          {/* Project */}
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
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Variations limited to max 12 seconds
              </p>
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
                <SelectItem value="720x1280">720x1280 - Vertical</SelectItem>
                <SelectItem value="1280x720">1280x720 - Horizontal</SelectItem>
                <SelectItem value="1024x1792">1024x1792 - Portrait</SelectItem>
                <SelectItem value="1792x1024">1792x1024 - Landscape</SelectItem>
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
                    ? "border-primary bg-primary/5"
                    : "border-border bg-muted/30 hover:border-primary/50"
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
                  <Upload className="w-8 h-8 text-primary mb-2" />
                  <p className="text-sm font-medium mb-1">
                    {isDragActive
                      ? "Drop file here"
                      : "Drag & drop or click to browse"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPEG, WebP, MP4
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
                Creating {variationCount} Variations...
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                Create {variationCount} Variation
                {variationCount !== "1" ? "s" : ""}
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
