"use client";

import { useState, useEffect } from "react";
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
  Loader2,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { projectsApi } from "@/lib/supabase";
import { Project } from "@/lib/database.types";
import { CreateProjectModal } from "@/components/create-project-modal";

export default function ProjectsPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Fetch projects from database
  useEffect(() => {
    async function fetchProjects() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { data, error } = await projectsApi.getAll(user.id);

        if (error) throw error;

        setProjects(data || []);
      } catch (err) {
        console.error("Error fetching projects:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load projects"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchProjects();
  }, [user]);

  // Handle new project created
  const handleProjectCreated = (newProject: Project) => {
    setProjects((prev) => [newProject, ...prev]);
  };

  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Format date helper
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
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
            You need to be logged in to view your projects
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
          <h1 className="text-3xl font-bold text-foreground mb-2">Projects</h1>
          <p className="text-muted-foreground">
            Organize your video campaigns by project
          </p>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  RECENT ACTIVITY
                </p>
                <p className="text-sm text-foreground">
                  {projects.length > 0
                    ? formatDate(projects[0].created_at)
                    : "No activity"}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <Card
            key={project.id}
            className="bg-card border-border hover:border-primary/50 transition-colors cursor-pointer group flex flex-col min-h-[320px]"
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                    <FolderKanban className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base font-bold text-foreground">
                      {project.name}
                    </CardTitle>
                    {project.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                        {project.description}
                      </p>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-foreground flex-shrink-0"
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 flex-1 flex flex-col">
              {project.system_prompt && (
                <div className="p-3 bg-muted/50 rounded text-xs text-muted-foreground line-clamp-4 min-h-[72px]">
                  {project.system_prompt}
                </div>
              )}

              <div className="space-y-2 text-xs text-muted-foreground mt-auto">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3 h-3" />
                  <span>Created: {formatDate(project.created_at)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-3 h-3" />
                  <span>Updated: {formatDate(project.updated_at)}</span>
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
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Project
            </Button>
          )}
        </div>
      )}

      {/* Create Project Modal */}
      <CreateProjectModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onProjectCreated={handleProjectCreated}
      />
    </div>
  );
}
