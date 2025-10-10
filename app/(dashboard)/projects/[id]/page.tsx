"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  FolderKanban,
  Video,
  Calendar,
  Loader2,
  Play,
  Download,
  MoreVertical,
  Eye,
  Trash2,
  X,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/auth-context";
import { projectsApi, videosApi } from "@/lib/supabase";
import { Project, Video as VideoType } from "@/lib/database.types";
import { ConfirmationModal } from "@/components/confirmation-modal";

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [videos, setVideos] = useState<VideoType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [videoToDelete, setVideoToDelete] = useState<VideoType | null>(null);

  // Fetch project and videos
  useEffect(() => {
    async function fetchData() {
      if (!user || !projectId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Fetch project details
        const { data: projectData, error: projectError } =
          await projectsApi.getById(projectId);

        if (projectError) throw projectError;
        if (!projectData) throw new Error("Project not found");

        setProject(projectData);

        // Fetch videos for this project
        const { data: videosData, error: videosError } =
          await videosApi.getByProject(projectId);

        if (videosError) throw videosError;

        // Note: Unlike main videos page, we show all videos including failed ones
        // so users can clean them up from their projects
        setVideos(videosData || []);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err instanceof Error ? err.message : "Failed to load project");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user, projectId]);

  // Format date helper
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/20 text-green-700";
      case "processing":
        return "bg-primary/20 text-primary";
      case "failed":
        return "bg-red-500/20 text-red-700";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const handleDeleteVideo = (videoId: string) => {
    const video = videos.find((v) => v.id === videoId);
    if (video) {
      setVideoToDelete(video);
    }
  };

  const handleConfirmDelete = async () => {
    if (!videoToDelete || !user) {
      setError("You must be logged in to delete videos");
      return;
    }

    try {
      const { error } = await videosApi.delete(videoToDelete.id);

      if (error) {
        console.error("Supabase delete error:", error);
        setError(`Failed to delete video: ${error.message}`);
        return;
      }

      // Successfully deleted - update UI
      setVideos(videos.filter((v) => v.id !== videoToDelete.id));
      setVideoToDelete(null);
      setError(null); // Clear any previous errors
    } catch (err) {
      console.error("Error deleting video:", err);
      setError(err instanceof Error ? err.message : "Failed to delete video");
    }
  };

  const handleDownload = async (videoUrl: string, title: string) => {
    try {
      const response = await fetch(videoUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `${title}.mp4`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Error downloading video:", err);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <FolderKanban className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Please log in
          </h3>
          <p className="text-muted-foreground">
            You need to be logged in to view this project
          </p>
        </div>
      </div>
    );
  }

  // Error or project not found
  if (error || !project) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <FolderKanban className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {error || "Project not found"}
          </h3>
          <Button
            onClick={() => router.push("/projects")}
            className="mt-4 bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Projects
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Back Button */}
      <Button
        onClick={() => router.push("/projects")}
        variant="outline"
        className="border-border"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Projects
      </Button>

      {/* Project Header */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <FolderKanban className="w-8 h-8 text-primary" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-2xl font-bold text-foreground mb-2">
                {project.name}
              </CardTitle>
              {project.description && (
                <p className="text-muted-foreground">{project.description}</p>
              )}
              <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Created {formatDate(project.created_at)}
                </div>
                <div className="flex items-center gap-1">
                  <Video className="w-4 h-4" />
                  {videos.length} {videos.length === 1 ? "video" : "videos"}
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        {project.system_prompt && (
          <CardContent>
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm font-semibold text-foreground mb-2">
                System Prompt
              </p>
              <p className="text-sm text-muted-foreground">
                {project.system_prompt}
              </p>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Videos Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">Videos</h2>
          <p className="text-sm text-muted-foreground">
            {videos.length} {videos.length === 1 ? "video" : "videos"} in this
            project
          </p>
        </div>

        {/* Videos Grid */}
        {videos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {videos.map((video) => (
              <Card
                key={video.id}
                className="bg-card border-border hover:border-primary/50 transition-all duration-300 cursor-pointer group overflow-hidden"
              >
                <CardContent className="p-0">
                  {/* Thumbnail/Video Preview - Vertical/TikTok Style */}
                  <div
                    className="relative bg-muted overflow-hidden"
                    style={{ aspectRatio: "9/16" }}
                  >
                    {video.status === "processing" ? (
                      // Processing state - show loader with progress
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                        <p className="text-sm text-muted-foreground mb-2">
                          Generating...
                        </p>
                      </div>
                    ) : video.video_url ? (
                      // Completed - show video thumbnail
                      <video
                        src={video.video_url}
                        className="w-full h-full object-cover"
                        preload="metadata"
                        muted
                        playsInline
                      />
                    ) : video.thumbnail_url ? (
                      <img
                        src={video.thumbnail_url}
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                        <Video className="w-12 h-12 text-primary/50" />
                      </div>
                    )}
                    {video.status === "completed" && video.video_url && (
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                        <div className="w-14 h-14 rounded-full bg-primary/90 flex items-center justify-center">
                          <Play
                            className="w-6 h-6 text-white ml-1"
                            fill="white"
                          />
                        </div>
                      </div>
                    )}
                    {video.duration_seconds && (
                      <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        {video.duration_seconds}s
                      </div>
                    )}
                    <Badge
                      className={`absolute top-2 left-2 ${getStatusColor(
                        video.status || "completed"
                      )}`}
                    >
                      {(video.status || "completed").toUpperCase()}
                    </Badge>
                  </div>

                  {/* Content */}
                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="font-semibold text-foreground line-clamp-2 mb-1">
                        {video.title}
                      </h3>
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        <span>{video.views || 0} views</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(video.created_at)}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      {video.status === "completed" && video.video_url ? (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 border-border text-xs"
                            onClick={() =>
                              handleDownload(video.video_url, video.title)
                            }
                          >
                            <Download className="w-3 h-3 mr-1" />
                            Download
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="px-2"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleDeleteVideo(video.id)}
                                className="cursor-pointer text-red-600 focus:text-red-600"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </>
                      ) : video.status === "failed" ? (
                        <div className="flex gap-2 w-full">
                          <div className="flex-1 text-center py-2">
                            <p className="text-xs text-red-600">
                              Generation failed
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="px-3 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                            onClick={() => handleDeleteVideo(video.id)}
                            title="Delete Failed Video"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : video.status === "processing" ? (
                        <div className="flex gap-2 w-full">
                          <div className="flex-1 text-center py-2">
                            <p className="text-xs text-muted-foreground">
                              Video is being generated...
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="px-3 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                            onClick={() => handleDeleteVideo(video.id)}
                            title="Cancel Generation"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex-1 text-center py-2">
                          <p className="text-xs text-muted-foreground">
                            Video status unknown
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-card border-border">
            <CardContent className="p-12 text-center">
              <Video className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No videos yet
              </h3>
              <p className="text-muted-foreground mb-4">
                Create your first video for this project
              </p>
              <Button
                onClick={() => router.push("/create-video")}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Play className="w-4 h-4 mr-2" />
                Create Video
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        open={!!videoToDelete}
        onOpenChange={() => setVideoToDelete(null)}
        onConfirm={handleConfirmDelete}
        title={
          videoToDelete?.status === "processing"
            ? "Cancel Video Generation"
            : videoToDelete?.status === "failed"
            ? "Delete Failed Video"
            : "Delete Video"
        }
        description={
          videoToDelete?.status === "processing"
            ? "Are you sure you want to cancel this video generation? This action cannot be undone."
            : videoToDelete?.status === "failed"
            ? "Are you sure you want to delete this failed video? This action cannot be undone."
            : "Are you sure you want to delete this video? This action cannot be undone."
        }
        confirmText={
          videoToDelete?.status === "processing"
            ? "Cancel Generation"
            : "Delete"
        }
        variant="destructive"
      />
    </div>
  );
}
