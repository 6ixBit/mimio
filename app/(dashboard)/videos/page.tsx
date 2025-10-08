"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Play,
  Download,
  Share2,
  MoreVertical,
  Calendar,
  Eye,
  Video,
} from "lucide-react";

export default function VideosPage() {
  const [searchTerm, setSearchTerm] = useState("");

  // Mock video data
  const videos = [
    {
      id: "1",
      title: "Product Demo - Fitness App",
      thumbnail:
        "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=225&fit=crop",
      duration: "0:45",
      views: 1234,
      createdAt: "2024-10-06",
      project: "Fitness App Campaign",
      status: "published",
    },
    {
      id: "2",
      title: "Summer Collection Showcase",
      thumbnail:
        "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=225&fit=crop",
      duration: "1:20",
      views: 2891,
      createdAt: "2024-10-05",
      project: "E-commerce Products",
      status: "published",
    },
    {
      id: "3",
      title: "Feature Highlight Video",
      thumbnail:
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=225&fit=crop",
      duration: "0:58",
      views: 567,
      createdAt: "2024-10-04",
      project: "SaaS Product Demo",
      status: "draft",
    },
    {
      id: "4",
      title: "Customer Testimonial",
      thumbnail:
        "https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=225&fit=crop",
      duration: "1:15",
      views: 892,
      createdAt: "2024-10-03",
      project: "Fitness App Campaign",
      status: "published",
    },
    {
      id: "5",
      title: "Product Unboxing",
      thumbnail:
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=225&fit=crop",
      duration: "2:30",
      views: 3421,
      createdAt: "2024-10-02",
      project: "E-commerce Products",
      status: "published",
    },
    {
      id: "6",
      title: "How-to Tutorial",
      thumbnail:
        "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=225&fit=crop",
      duration: "3:45",
      views: 1567,
      createdAt: "2024-10-01",
      project: "SaaS Product Demo",
      status: "processing",
    },
  ];

  const filteredVideos = videos.filter((video) =>
    video.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-500/20 text-green-700";
      case "draft":
        return "bg-muted text-muted-foreground";
      case "processing":
        return "bg-primary/20 text-primary";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="p-6 space-y-6">
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
              {/* Thumbnail */}
              <div className="relative aspect-video bg-muted overflow-hidden">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-primary/90 flex items-center justify-center">
                    <Play className="w-6 h-6 text-white ml-1" fill="white" />
                  </div>
                </div>
                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                  {video.duration}
                </div>
                <Badge
                  className={`absolute top-2 left-2 ${getStatusColor(
                    video.status
                  )}`}
                >
                  {video.status.toUpperCase()}
                </Badge>
              </div>

              {/* Content */}
              <div className="p-4 space-y-3">
                <div>
                  <h3 className="font-semibold text-foreground line-clamp-2 mb-1">
                    {video.title}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {video.project}
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    <span>{video.views.toLocaleString()} views</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{video.createdAt}</span>
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
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Play className="w-4 h-4 mr-2" />
              Create Video
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
