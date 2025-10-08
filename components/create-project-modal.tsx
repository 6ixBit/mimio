"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, FolderKanban } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { projectsApi } from "@/lib/supabase";
import { Project } from "@/lib/database.types";

interface CreateProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProjectCreated: (project: Project) => void;
}

export function CreateProjectModal({
  open,
  onOpenChange,
  onProjectCreated,
}: CreateProjectModalProps) {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setError("You must be logged in to create a project");
      return;
    }

    if (!name.trim()) {
      setError("Project name is required");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await projectsApi.create(user.id, {
        name: name.trim(),
        description: description.trim() || undefined,
        system_prompt: systemPrompt.trim() || undefined,
      });

      if (error) throw error;

      if (data) {
        onProjectCreated(data);
        handleClose();
      }
    } catch (err) {
      console.error("Error creating project:", err);
      setError(err instanceof Error ? err.message : "Failed to create project");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setName("");
    setDescription("");
    setSystemPrompt("");
    setError(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <FolderKanban className="w-5 h-5 text-primary" />
            Create New Project
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Organize your videos by creating a new project. Add context to help
            generate better videos.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Project Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-foreground">
              Project Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              placeholder="e.g., Fitness App Campaign"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
              className="bg-background border-border"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-foreground">
              Description (Optional)
            </Label>
            <Textarea
              id="description"
              placeholder="Brief description of this project..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading}
              className="bg-background border-border min-h-[80px]"
              rows={3}
            />
          </div>

          {/* System Prompt */}
          <div className="space-y-2">
            <Label htmlFor="systemPrompt" className="text-foreground">
              System Prompt (Optional)
            </Label>
            <Textarea
              id="systemPrompt"
              placeholder="Context about your app/product that will be used for video generation..."
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              disabled={isLoading}
              className="bg-background border-border min-h-[100px]"
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              This context will be included when generating videos for this
              project, helping create more relevant content.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1 border-border"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !name.trim()}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Project"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
