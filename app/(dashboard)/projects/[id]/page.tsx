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
  Share2,
  MoreVertical,
  Eye,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { projectsApi, videosApi } from "@/lib/supabase";
import { Project, Video as VideoType } from "@/lib/database.types";

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [videos, setVideos] = useState<VideoType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
                  {/* Thumbnail */}
                  <div className="relative aspect-video bg-muted overflow-hidden">
                    {video.thumbnail_url ? (
                      <img
                        src={video.thumbnail_url}
                        alt={video.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                        <Video className="w-12 h-12 text-primary/50" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-14 h-14 rounded-full bg-primary/90 flex items-center justify-center">
                        <Play
                          className="w-6 h-6 text-white ml-1"
                          fill="white"
                        />
                      </div>
                    </div>
                    {video.duration_seconds && (
                      <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        {video.duration_seconds}s
                      </div>
                    )}
                    <Badge
                      className={`absolute top-2 left-2 ${getStatusColor(
                        video.status || "processing"
                      )}`}
                    >
                      {(video.status || "processing").toUpperCase()}
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
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 border-border text-xs"
                      >
                        <Download className="w-3 h-3 mr-1" />
                        Download
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 border-border text-xs"
                      >
                        <Share2 className="w-3 h-3 mr-1" />
                        Share
                      </Button>
                      <Button size="sm" variant="ghost" className="px-2">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
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
    </div>
  );
}

