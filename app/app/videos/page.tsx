"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Play,
  Download,
  MoreVertical,
  Calendar,
  Video,
  Loader2,
  Trash2,
  X,
  Sparkles,
  Share2,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { videosApi, templatesApi } from "@/lib/supabase";
import { SaveTemplateModal } from "@/components/templates/save-template-modal";
import { ConfirmationModal } from "@/components/confirmation-modal";
import { VideoApiClient } from "@/lib/video-api-client";
import { PostToSocialModal } from "@/components/post-to-social-modal";

interface VideoWithProject {
  id: string;
  user_id: string;
  project_id: string | null;
  template_id: string | null;
  title: string;
  video_url: string;
  thumbnail_url: string | null;
  prompt: string;
  model: string;
  size: string;
  duration_seconds: number | null;
  status: string | null;
  external_video_id: string | null;
  progress: number | null;
  views: number | null;
  created_at: string;
  updated_at: string;
  project?: {
    name: string;
  } | null;
}

export default function VideosPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [videos, setVideos] = useState<VideoWithProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playingVideo, setPlayingVideo] = useState<VideoWithProject | null>(
    null
  );
  const [templateVideo, setTemplateVideo] = useState<VideoWithProject | null>(
    null
  );
  const [videoToDelete, setVideoToDelete] = useState<VideoWithProject | null>(
    null
  );
  const [videoToPost, setVideoToPost] = useState<VideoWithProject | null>(null);

  // Fetch videos from database
  useEffect(() => {
    async function fetchVideos() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { data, error } = await videosApi.getAll(user.id);

        if (error) throw error;

        // Filter out failed videos - only show processing or completed
        const filteredData = (data || []).filter(
          (video) => video.status !== "failed"
        );

        setVideos(filteredData);
      } catch (err) {
        console.error("Error fetching videos:", err);
        setError(err instanceof Error ? err.message : "Failed to load videos");
      } finally {
        setLoading(false);
      }
    }

    fetchVideos();
  }, [user]);

  // Poll processing videos for progress updates
  useEffect(() => {
    const processingVideos = videos.filter(
      (v) => v.status === "processing" && v.external_video_id
    );

    if (processingVideos.length === 0) return;

    const pollInterval = setInterval(async () => {
      for (const video of processingVideos) {
        try {
          const status = await VideoApiClient.checkStatus(
            video.external_video_id!
          );

          // Update video in state with new progress
          setVideos((prev) =>
            prev.map((v) =>
              v.id === video.id ? { ...v, progress: status.progress || 0 } : v
            )
          );

          // If completed, update database and refresh
          if (status.status === "completed" && status.video_url) {
            // Update database
            await videosApi.update(video.id, {
              status: "completed",
              video_url: status.video_url,
              progress: 100,
            });

            // Refresh videos list
            const { data } = await videosApi.getAll(user!.id);
            if (data) {
              setVideos(data.filter((video) => video.status !== "failed"));
            }
          }
        } catch (error) {
          console.error(`Error polling video ${video.id}:`, error);
        }
      }
    }, 3000); // Poll every 3 seconds

    return () => clearInterval(pollInterval);
  }, [videos, user]);

  const filteredVideos = videos.filter((video) =>
    video.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const handleDownload = async (videoUrl: string, title: string) => {
    try {
      const response = await fetch(videoUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
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

  const handleDeleteVideo = (videoId: string) => {
    const video = videos.find((v) => v.id === videoId);
    if (video) {
      setVideoToDelete(video);
    }
  };

  const handleConfirmDelete = async () => {
    if (!videoToDelete) return;

    try {
      await videosApi.delete(videoToDelete.id);
      setVideos(videos.filter((v) => v.id !== videoToDelete.id));
    } catch (err) {
      console.error("Error deleting video:", err);
    }
  };

  const handlePlayVideo = (video: VideoWithProject) => {
    setPlayingVideo(video);
  };

  const handleClosePlayer = () => {
    setPlayingVideo(null);
  };

  const handleSaveAsTemplate = async (video: VideoWithProject) => {
    setTemplateVideo(video);
  };

  const handleCreateTemplate = async (data: {
    title: string;
    description: string;
    video_type: string;
  }) => {
    if (!templateVideo) return;

    try {
      const { error } = await templatesApi.create({
        title: data.title,
        description: data.description,
        video_type: data.video_type,
        video_prompt: templateVideo.prompt,
        original_video_url: templateVideo.video_url,
        model: templateVideo.model,
        size: templateVideo.size,
        duration_seconds: templateVideo.duration_seconds || 8,
        thumbnail_url: templateVideo.thumbnail_url || undefined,
        is_active: true,
      });

      if (error) throw error;

      alert("Template created successfully!");
      setTemplateVideo(null);
    } catch (err) {
      console.error("Error creating template:", err);
      alert("Failed to create template. Please try again.");
    }
  };

  const handleRecreate = (video: VideoWithProject) => {
    // Navigate to create video page with pre-filled params
    const params = new URLSearchParams({
      prompt: video.prompt,
      model: video.model,
      size: video.size,
      seconds: video.duration_seconds?.toString() || "8",
    });
    router.push(`/app/create-video?${params.toString()}`);
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
          <Video className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Please log in
          </h3>
          <p className="text-muted-foreground">
            You need to be logged in to view your videos
          </p>
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

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Videos</h1>
          <p className="text-muted-foreground">
            Browse and manage all your created videos
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
          <Input
            placeholder="Search videos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 bg-card border-border"
          />
        </div>
        <p className="text-sm text-muted-foreground whitespace-nowrap">
          {filteredVideos.length} video{filteredVideos.length !== 1 ? "s" : ""}{" "}
          found
        </p>
      </div>

      {/* Videos Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredVideos.map((video) => (
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
                    {video.progress !== null && video.progress > 0 && (
                      <div className="w-2/3">
                        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-primary h-full transition-all duration-300"
                            style={{ width: `${video.progress}%` }}
                          />
                        </div>
                        <p className="text-xs text-center text-muted-foreground mt-1">
                          {video.progress}%
                        </p>
                      </div>
                    )}
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
                  <div
                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                    onClick={() => handlePlayVideo(video)}
                  >
                    <div className="w-14 h-14 rounded-full bg-primary/90 flex items-center justify-center">
                      <Play className="w-6 h-6 text-white ml-1" fill="white" />
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
                  {video.project && (
                    <p className="text-xs text-muted-foreground">
                      {video.project.name}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(video.created_at)}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {video.model}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  {video.status === "completed" && video.video_url ? (
                    <>
                      <Button
                        size="sm"
                        className="flex-1 bg-primary hover:bg-primary/90 text-xs"
                        onClick={() => handleRecreate(video)}
                      >
                        <Sparkles className="w-3 h-3 mr-1" />
                        Recreate
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="px-3 border-border"
                        onClick={() => setVideoToPost(video)}
                        title="Share to Social Media"
                      >
                        <Share2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="px-3 border-border"
                        onClick={() =>
                          handleDownload(video.video_url, video.title)
                        }
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="ghost" className="px-3">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleSaveAsTemplate(video)}
                            className="cursor-pointer"
                          >
                            <Sparkles className="w-4 h-4 mr-2" />
                            Save as Template
                          </DropdownMenuItem>
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
                  ) : (
                    <div className="flex gap-2 pt-2">
                      {video.status === "processing" && (
                        <>
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
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredVideos.length === 0 && (
        <div className="text-center py-12">
          <Video className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No videos found
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm
              ? "Try adjusting your search"
              : "Create your first video to get started"}
          </p>
          {!searchTerm && (
            <Button
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={() => router.push("/app/create-video")}
            >
              <Play className="w-4 h-4 mr-2" />
              Create Video
            </Button>
          )}
        </div>
      )}

      {/* Save Template Modal */}
      <SaveTemplateModal
        isOpen={!!templateVideo}
        onClose={() => setTemplateVideo(null)}
        onSave={handleCreateTemplate}
        defaultTitle={templateVideo?.title || ""}
      />

      {/* Video Player Modal */}
      {playingVideo && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={handleClosePlayer}
        >
          <div
            className="relative max-w-4xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute -top-12 right-0 text-white hover:bg-white/20"
              onClick={handleClosePlayer}
            >
              <X className="w-6 h-6" />
            </Button>

            {/* Video Player */}
            <div className="bg-black rounded-lg overflow-hidden">
              <video
                src={playingVideo.video_url}
                controls
                autoPlay
                className="w-full max-h-[80vh] object-contain"
                controlsList="nodownload"
              />
            </div>

            {/* Video Info */}
            <div className="mt-4 text-white">
              <h3 className="text-xl font-semibold mb-2">
                {playingVideo.title}
              </h3>
              <div className="flex items-center gap-4 text-sm text-white/70">
                <span>{formatDate(playingVideo.created_at)}</span>
                <span>•</span>
                <span>{playingVideo.model}</span>
                {playingVideo.duration_seconds && (
                  <>
                    <span>•</span>
                    <span>{playingVideo.duration_seconds}s</span>
                  </>
                )}
              </div>
              {playingVideo.prompt && (
                <p className="mt-3 text-sm text-white/80 line-clamp-2">
                  {playingVideo.prompt}
                </p>
              )}
              <div className="flex gap-2 mt-4">
                <Button
                  onClick={() =>
                    handleDownload(playingVideo.video_url, playingVideo.title)
                  }
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  onClick={handleClosePlayer}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        open={!!videoToDelete}
        onOpenChange={() => setVideoToDelete(null)}
        onConfirm={handleConfirmDelete}
        title={
          videoToDelete?.status === "processing"
            ? "Cancel Video Generation"
            : "Delete Video"
        }
        description={
          videoToDelete?.status === "processing"
            ? "Are you sure you want to cancel this video generation? This action cannot be undone."
            : "Are you sure you want to delete this video? This action cannot be undone."
        }
        confirmText={
          videoToDelete?.status === "processing"
            ? "Cancel Generation"
            : "Delete"
        }
        variant="destructive"
      />

      {/* Post to Social Modal */}
      {videoToPost && (
        <PostToSocialModal
          isOpen={!!videoToPost}
          onClose={() => setVideoToPost(null)}
          video={{
            id: videoToPost.id,
            title: videoToPost.title,
            video_url: videoToPost.video_url,
          }}
        />
      )}
    </div>
  );
}
