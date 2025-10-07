"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  FolderKanban,
  Search,
  MoreVertical,
  Calendar,
  Video,
} from "lucide-react";

export default function ProjectsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  // Sample projects data
  const projects = [
    {
      id: "1",
      name: "Fitness App Campaign",
      type: "Consumer App",
      videosCount: 12,
      createdAt: "2024-10-01",
      lastUpdated: "2024-10-06",
      status: "active",
    },
    {
      id: "2",
      name: "E-commerce Products",
      type: "E-commerce",
      videosCount: 24,
      createdAt: "2024-09-15",
      lastUpdated: "2024-10-05",
      status: "active",
    },
    {
      id: "3",
      name: "SaaS Product Demo",
      type: "Consumer App",
      videosCount: 8,
      createdAt: "2024-09-20",
      lastUpdated: "2024-09-28",
      status: "draft",
    },
  ];

  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-primary/20 text-primary";
      case "draft":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Projects</h1>
          <p className="text-muted-foreground">
            Manage your consumer apps and e-commerce products
          </p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-card border-border"
          />
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground tracking-wider">
                  TOTAL PROJECTS
                </p>
                <p className="text-2xl font-bold text-foreground font-mono">
                  {projects.length}
                </p>
              </div>
              <FolderKanban className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground tracking-wider">
                  ACTIVE PROJECTS
                </p>
                <p className="text-2xl font-bold text-foreground font-mono">
                  {projects.filter((p) => p.status === "active").length}
                </p>
              </div>
              <FolderKanban className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground tracking-wider">
                  TOTAL VIDEOS
                </p>
                <p className="text-2xl font-bold text-foreground font-mono">
                  {projects.reduce((acc, p) => acc + p.videosCount, 0)}
                </p>
              </div>
              <Video className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <Card
            key={project.id}
            className="bg-card border-border hover:border-primary/50 transition-colors cursor-pointer group"
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                    <FolderKanban className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold text-foreground">
                      {project.name}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">
                      {project.type}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge className={getStatusColor(project.status)}>
                  {project.status.toUpperCase()}
                </Badge>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Video className="w-4 h-4" />
                  <span>{project.videosCount} videos</span>
                </div>
              </div>

              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3 h-3" />
                  <span>Created: {project.createdAt}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-3 h-3" />
                  <span>Updated: {project.lastUpdated}</span>
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <Button
                  size="sm"
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Open
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 border-border"
                >
                  Edit
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <FolderKanban className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No projects found
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm
              ? "Try adjusting your search"
              : "Create your first project to get started"}
          </p>
          {!searchTerm && (
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Plus className="w-4 h-4 mr-2" />
              Create Project
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

