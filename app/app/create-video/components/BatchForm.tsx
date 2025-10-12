"use client";

import { useState } from "react";
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
import { Layers, Plus, Trash2, Loader2, FolderOpen } from "lucide-react";
import { VideoApiClient } from "@/lib/video-api-client";
import { videosApi } from "@/lib/supabase";
import type { TrackedVideo, BatchVideoConfig } from "@/lib/video-api-types";

interface BatchFormProps {
  user: any;
  projects: Array<{ id: string; name: string }>;
  onStart: (videos: TrackedVideo[]) => void;
}

interface BatchVideoFormData extends BatchVideoConfig {
  title: string;
}

export function BatchForm({ user, projects, onStart }: BatchFormProps) {
  const [selectedProject, setSelectedProject] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Start with one empty video form
  const [videoForms, setVideoForms] = useState<BatchVideoFormData[]>([
    {
      title: "",
      prompt: "",
      model: "sora-2",
      size: "720x1280",
      seconds: "8",
    },
  ]);

  const addVideoForm = () => {
    if (videoForms.length >= 3) {
      alert("Maximum 3 videos per batch");
      return;
    }

    setVideoForms([
      ...videoForms,
      {
        title: "",
        prompt: "",
        model: "sora-2",
        size: "720x1280",
        seconds: "8",
      },
    ]);
  };

  const removeVideoForm = (index: number) => {
    if (videoForms.length <= 1) {
      alert("Need at least 1 video");
      return;
    }
    setVideoForms(videoForms.filter((_, i) => i !== index));
  };

  const updateVideoForm = (
    index: number,
    field: keyof BatchVideoFormData,
    value: string
  ) => {
    const updated = [...videoForms];
    updated[index] = { ...updated[index], [field]: value };
    setVideoForms(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all prompts are filled
    const invalidForms = videoForms.filter((form) => !form.prompt.trim());
    if (invalidForms.length > 0) {
      alert("All videos must have a prompt");
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare batch config (without titles)
      const batchConfig: BatchVideoConfig[] = videoForms.map((form) => ({
        prompt: form.prompt,
        model: form.model,
        size: form.size,
        seconds: form.seconds,
      }));

      // Create batch via API
      const result = await VideoApiClient.createBatch(batchConfig);

      // Create tracked videos
      const trackedVideos: TrackedVideo[] = await Promise.all(
        result.videos.map(async (video, index) => {
          const formData = videoForms[index];

          // Create database record if user is logged in
          let dbId: string | undefined;
          if (user) {
            const title =
              formData.title || `Video ${index + 1} - ${new Date().toLocaleDateString()}`;
            const { data: videoData } = await videosApi.create(user.id, {
              title,
              video_url: "",
              prompt: formData.prompt,
              model: formData.model || "sora-2",
              size: formData.size || "720x1280",
              duration_seconds: parseInt(formData.seconds || "8"),
              status: "processing",
              project_id: selectedProject || undefined,
            });

            if (videoData) {
              dbId = (videoData as any).id;
            }
          }

          return {
            id: video.video_id,
            dbId,
            title:
              formData.title ||
              `Video ${index + 1} - ${new Date().toLocaleDateString()}`,
            prompt: formData.prompt,
            status: "processing" as const,
            progress: 0,
            model: formData.model || "sora-2",
            size: formData.size || "720x1280",
            seconds: formData.seconds || "8",
            createdAt: new Date(),
          };
        })
      );

      // Pass to parent to start tracking
      onStart(trackedVideos);

      // Reset form
      setVideoForms([
        {
          title: "",
          prompt: "",
          model: "sora-2",
          size: "720x1280",
          seconds: "8",
        },
      ]);
    } catch (error) {
      console.error("Batch creation error:", error);
      alert(error instanceof Error ? error.message : "Failed to create batch");
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Project Selection */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-primary" />
            Batch Settings
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Create up to 3 different videos with different prompts
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="project">Project (Optional)</Label>
            <Select
              value={selectedProject}
              onValueChange={setSelectedProject}
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a project for all videos" />
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
        </CardContent>
      </Card>

      {/* Video Forms */}
      {videoForms.map((video, index) => (
        <Card key={index} className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Video {index + 1}</CardTitle>
              {videoForms.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeVideoForm(index)}
                  disabled={isSubmitting}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Title */}
            <div className="space-y-2">
              <Label>Video Title (Optional)</Label>
              <Input
                placeholder={`Video ${index + 1} - ${new Date().toLocaleDateString()}`}
                value={video.title}
                onChange={(e) => updateVideoForm(index, "title", e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            {/* Prompt */}
            <div className="space-y-2">
              <Label>
                Prompt <span className="text-red-500">*</span>
              </Label>
              <Textarea
                placeholder="Describe this video..."
                value={video.prompt}
                onChange={(e) => updateVideoForm(index, "prompt", e.target.value)}
                required
                disabled={isSubmitting}
                className="min-h-[80px]"
              />
            </div>

            {/* Model, Size, Duration */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Model</Label>
                <Select
                  value={video.model}
                  onValueChange={(value) => updateVideoForm(index, "model", value)}
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
                <Label>Resolution</Label>
                <Select
                  value={video.size}
                  onValueChange={(value) => updateVideoForm(index, "size", value)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="720x1280">720x1280</SelectItem>
                    <SelectItem value="1280x720">1280x720</SelectItem>
                    <SelectItem value="1024x1792">1024x1792</SelectItem>
                    <SelectItem value="1792x1024">1792x1024</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Duration</Label>
                <Select
                  value={video.seconds}
                  onValueChange={(value) => updateVideoForm(index, "seconds", value)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="4">4s</SelectItem>
                    <SelectItem value="8">8s</SelectItem>
                    <SelectItem value="12">12s</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Add Video Button */}
      {videoForms.length < 3 && (
        <Button
          type="button"
          variant="outline"
          className="w-full border-dashed"
          onClick={addVideoForm}
          disabled={isSubmitting}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Another Video ({videoForms.length}/3)
        </Button>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-primary hover:bg-primary/90"
        size="lg"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Creating {videoForms.length} Video{videoForms.length !== 1 ? "s" : ""}...
          </>
        ) : (
          <>
            <Layers className="w-4 h-4 mr-2" />
            Create Batch ({videoForms.length} video{videoForms.length !== 1 ? "s" : ""})
          </>
        )}
      </Button>
    </form>
  );
}

