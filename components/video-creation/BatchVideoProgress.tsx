"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  XCircle,
  Loader2,
  Download,
  RefreshCw,
  Play,
} from "lucide-react";
import type { TrackedVideo } from "@/lib/video-api-types";

interface BatchVideoProgressProps {
  videos: TrackedVideo[];
  onDownload: (videoId: string, title: string) => void;
  onPlay: (video: TrackedVideo) => void;
  onReset: () => void;
}

export function BatchVideoProgress({
  videos,
  onDownload,
  onPlay,
  onReset,
}: BatchVideoProgressProps) {
  const completedCount = videos.filter((v) => v.status === "completed").length;
  const failedCount = videos.filter((v) => v.status === "error").length;
  const processingCount = videos.filter(
    (v) => v.status === "processing" || v.status === "uploading"
  ).length;

  const allComplete = completedCount + failedCount === videos.length;
  const overallProgress =
    videos.reduce((sum, v) => sum + v.progress, 0) / videos.length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/20 text-green-700";
      case "error":
        return "bg-red-500/20 text-red-700";
      case "processing":
      case "uploading":
        return "bg-primary/20 text-primary";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusIcon = (video: TrackedVideo) => {
    switch (video.status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "error":
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Loader2 className="w-5 h-5 text-primary animate-spin" />;
    }
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Batch Progress</span>
          <div className="flex items-center gap-2 text-sm font-normal">
            <Badge className="bg-green-500/20 text-green-700">
              {completedCount} completed
            </Badge>
            {processingCount > 0 && (
              <Badge className="bg-primary/20 text-primary">
                {processingCount} processing
              </Badge>
            )}
            {failedCount > 0 && (
              <Badge className="bg-red-500/20 text-red-700">
                {failedCount} failed
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Overall Progress</span>
            <span className="font-medium">{Math.round(overallProgress)}%</span>
          </div>
          <Progress value={overallProgress} className="h-2" />
        </div>

        {/* Individual Videos */}
        <div className="space-y-3">
          {videos.map((video, index) => (
            <div
              key={video.id}
              className="p-4 bg-muted/50 rounded-lg space-y-3 border border-border"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  {getStatusIcon(video)}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {video.title || `Video ${index + 1}`}
                    </p>
                    <p className="text-xs text-muted-foreground truncate mt-1">
                      {video.prompt}
                    </p>
                  </div>
                </div>
                <Badge className={getStatusColor(video.status)}>
                  {video.status.toUpperCase()}
                </Badge>
              </div>

              {/* Progress Bar */}
              {(video.status === "processing" ||
                video.status === "uploading") && (
                <div className="space-y-1">
                  <Progress value={video.progress} className="h-1.5" />
                  <p className="text-xs text-muted-foreground text-right">
                    {video.progress}%
                  </p>
                </div>
              )}

              {/* Error Message */}
              {video.status === "error" && video.error && (
                <p className="text-xs text-red-600 bg-red-50 dark:bg-red-900/10 p-2 rounded">
                  {video.error}
                </p>
              )}

              {/* Action Buttons */}
              {video.status === "completed" && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => onPlay(video)}
                  >
                    <Play className="w-3 h-3 mr-2" />
                    Play
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onDownload(video.id, video.title)}
                  >
                    <Download className="w-3 h-3" />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Actions */}
        {allComplete && (
          <div className="pt-4 border-t border-border">
            <Button
              onClick={onReset}
              variant="outline"
              className="w-full"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Create More Videos
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

