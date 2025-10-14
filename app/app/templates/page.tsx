"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sparkles,
  Video,
  Search,
  Play,
  Clock,
  TrendingUp,
  ShoppingBag,
  Zap,
  ExternalLink,
  Plus,
  Loader2,
  Heart,
  BookOpen,
  MoreVertical,
  Trash2,
} from "lucide-react";
import { templatesApi, videosApi } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import { ConfirmationModal } from "@/components/confirmation-modal";

interface VideoTemplate {
  id: string;
  title: string;
  description: string | null;
  video_prompt: string;
  thumbnail_url: string | null;
  video_type: string;
  duration_seconds: number;
  model: string;
  size: string;
  original_video_url: string;
  is_active: boolean;
  created_by?: string;
  is_public?: boolean;
}

interface GeneratedVideo {
  id: string;
  title: string;
  video_url: string;
  thumbnail_url: string | null;
  prompt: string;
  model: string;
  size: string;
  duration_seconds: number | null;
  status: string | null;
  created_at: string;
}

const categories = [
  "All",
  "POV",
  "Review",
  "Unboxing",
  "Tutorial",
  "Showcase",
  "Demo",
  "UGC",
  "Memes",
];

export default function TemplatesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [activeTab, setActiveTab] = useState("public");
  const [publicTemplates, setPublicTemplates] = useState<VideoTemplate[]>([]);
  const [customTemplates, setCustomTemplates] = useState<VideoTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  // Template videos modal
  const [selectedTemplate, setSelectedTemplate] =
    useState<VideoTemplate | null>(null);
  const [templateVideos, setTemplateVideos] = useState<GeneratedVideo[]>([]);
  const [videosLoading, setVideosLoading] = useState(false);

  // Add template dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    video_type: "POV",
    video_prompt: "",
    original_video_url: "",
    model: "sora-2",
    size: "720x1280",
    duration_seconds: "8",
  });

  // Template deletion
  const [templateToDelete, setTemplateToDelete] =
    useState<VideoTemplate | null>(null);

  // Fetch templates on mount
  useEffect(() => {
    async function fetchTemplates() {
      try {
        // Fetch public templates
        const { data: publicData, error: publicError } =
          await templatesApi.getPublic();
        if (publicError) throw publicError;

        // Fetch custom templates if user is logged in
        let customData: any[] = [];
        if (user) {
          const { data: customResult, error: customError } =
            await templatesApi.getCustom(user.id);
          if (customError) {
            console.error("Error fetching custom templates:", customError);
          } else {
            customData = customResult || [];
          }
        }

        // For each template, try to get a sample video to use as thumbnail
        const addThumbnails = async (templates: any[]) => {
          return await Promise.all(
            templates.map(async (template: any) => {
              try {
                const { data: videos } = await templatesApi.getGeneratedVideos(
                  template.id,
                  1
                );
                const sampleVideo: any = (videos as any)?.[0];
                return {
                  ...template,
                  thumbnail_url:
                    sampleVideo?.thumbnail_url ||
                    sampleVideo?.video_url ||
                    template.thumbnail_url,
                };
              } catch (err) {
                return template; // Return original template if fetching videos fails
              }
            })
          );
        };

        const publicWithThumbnails = await addThumbnails(publicData || []);
        const customWithThumbnails = await addThumbnails(customData);

        setPublicTemplates(publicWithThumbnails);
        setCustomTemplates(customWithThumbnails);
      } catch (err) {
        console.error("Error fetching templates:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchTemplates();
  }, [user]);

  // Get current templates based on active tab
  const currentTemplates =
    activeTab === "public" ? publicTemplates : customTemplates;

  // Filter templates
  const filteredTemplates = currentTemplates.filter((template) => {
    const matchesCategory =
      selectedCategory === "All" || template.video_type === selectedCategory;

    return matchesCategory;
  });

  const handleRecreate = (template: VideoTemplate) => {
    // Navigate to create-video page with template data as URL params
    const params = new URLSearchParams({
      prompt: template.video_prompt,
      model: template.model,
      size: template.size,
      seconds: template.duration_seconds.toString(),
      template_id: template.id, // Pass template ID to link the created video
    });
    router.push(`/app/create-video?${params.toString()}`);
  };

  const handleDeleteTemplate = (template: VideoTemplate) => {
    setTemplateToDelete(template);
  };

  const confirmDeleteTemplate = async () => {
    if (!templateToDelete || !user) return;

    try {
      const { error } = await templatesApi.delete(templateToDelete.id, user.id);

      if (error) {
        throw error;
      }

      // Remove from local state
      setCustomTemplates((prev) =>
        prev.filter((t) => t.id !== templateToDelete.id)
      );

      toast.success("Template deleted successfully");
      setTemplateToDelete(null);
    } catch (error) {
      console.error("Error deleting template:", error);
      toast.error("Failed to delete template");
    }
  };

  const handleViewOriginal = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleViewTemplateVideos = async (template: VideoTemplate) => {
    setSelectedTemplate(template);
    setVideosLoading(true);

    try {
      const { data, error } = await templatesApi.getGeneratedVideos(
        template.id,
        20
      );
      if (error) throw error;
      console.log("Videos for template:", data);
      setTemplateVideos(data || []);
    } catch (err) {
      console.error("Error fetching template videos:", err);
      setTemplateVideos([]);
    } finally {
      setVideosLoading(false);
    }
  };

  const handleCloseVideosModal = () => {
    setSelectedTemplate(null);
    setTemplateVideos([]);
  };

  const handleSubmitTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data, error } = await templatesApi.create({
        title: formData.title,
        description: formData.description,
        video_type: formData.video_type,
        video_prompt: formData.video_prompt,
        original_video_url: formData.original_video_url,
        model: formData.model,
        size: formData.size,
        duration_seconds: parseInt(formData.duration_seconds),
        is_active: true,
        is_public: false,
        created_by: user?.id,
        category: "custom",
      });

      if (error) {
        toast.error("Error creating template", {
          description: error.message,
        });
        return;
      }

      // Optimistically add locally, then try to refetch
      if (data) {
        setCustomTemplates([data, ...customTemplates]);
      }
      if (user) {
        const { data: updatedCustom, error: fetchError } =
          await templatesApi.getCustom(user.id);
        if (
          !fetchError &&
          Array.isArray(updatedCustom) &&
          updatedCustom.length > 0
        ) {
          setCustomTemplates(updatedCustom);
        }
      }

      // Reset form and close dialog
      setFormData({
        title: "",
        description: "",
        video_type: "POV",
        video_prompt: "",
        original_video_url: "",
        model: "sora-2",
        size: "720x1280",
        duration_seconds: "8",
      });
      setIsDialogOpen(false);

      // Switch to custom tab to show the new template
      setActiveTab("custom");

      toast.success("Template created successfully!", {
        description: "Your template has been added to your custom collection.",
      });
    } catch (err) {
      console.error("Error:", err);
      toast.error("Failed to create template", {
        description:
          "Please try again or contact support if the issue persists.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    return <Video className="w-4 h-4" />;
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">
              Viral Ad Templates
            </h1>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Plus className="w-4 h-4 mr-2" />
                Add Template
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add Viral Ad Template</DialogTitle>
                <DialogDescription>
                  Add a new template to your library
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmitTemplate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">
                    Title <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    required
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="e.g., Product Showcase - Modern Tech"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description (optional)</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Describe what this template is about"
                    className="min-h-[80px]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="video_type">
                      Type <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.video_type}
                      onValueChange={(value) =>
                        setFormData({ ...formData, video_type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="POV">POV</SelectItem>
                        <SelectItem value="Review">Review</SelectItem>
                        <SelectItem value="Unboxing">Unboxing</SelectItem>
                        <SelectItem value="Tutorial">Tutorial</SelectItem>
                        <SelectItem value="Showcase">Showcase</SelectItem>
                        <SelectItem value="Demo">Demo</SelectItem>
                        <SelectItem value="UGC">UGC</SelectItem>
                        <SelectItem value="Memes">Memes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="duration">
                      Duration <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.duration_seconds}
                      onValueChange={(value) =>
                        setFormData({ ...formData, duration_seconds: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="4">4 seconds</SelectItem>
                        <SelectItem value="8">8 seconds</SelectItem>
                        <SelectItem value="12">12 seconds</SelectItem>
                        <SelectItem value="15">15 seconds</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="prompt">
                    Video Prompt <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="prompt"
                    required
                    value={formData.video_prompt}
                    onChange={(e) =>
                      setFormData({ ...formData, video_prompt: e.target.value })
                    }
                    placeholder="Describe the video in detail..."
                    className="min-h-[100px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="original_url">
                    Original Video URL <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="original_url"
                    required
                    type="url"
                    value={formData.original_video_url}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        original_video_url: e.target.value,
                      })
                    }
                    placeholder="https://www.tiktok.com/@user/video/123"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="model">Model</Label>
                    <Select
                      value={formData.model}
                      onValueChange={(value) =>
                        setFormData({ ...formData, model: value })
                      }
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
                    <Label htmlFor="size">Resolution</Label>
                    <Select
                      value={formData.size}
                      onValueChange={(value) =>
                        setFormData({ ...formData, size: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="720x1280">
                          720x1280 (Vertical)
                        </SelectItem>
                        <SelectItem value="1280x720">
                          1280x720 (Horizontal)
                        </SelectItem>
                        <SelectItem value="1024x1792">
                          1024x1792 (Portrait)
                        </SelectItem>
                        <SelectItem value="1792x1024">
                          1792x1024 (Landscape)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-primary hover:bg-primary/90"
                  >
                    {isSubmitting ? "Adding..." : "Add Template"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        <p className="text-muted-foreground">
          Professionally crafted video templates ready to recreate with one
          click. Choose a template and customize it to your needs.
        </p>
      </div>

      {/* Search and Filter */}
      <Card className="bg-card border-border">
        <CardContent className="p-6 space-y-4">
          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={
                  selectedCategory === category
                    ? "bg-primary text-primary-foreground"
                    : "border-border"
                }
              >
                {category}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Template Tabs - Centered above content */}
      <div className="flex items-center justify-center">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="public" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Public
            </TabsTrigger>
            <TabsTrigger value="custom" className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              Custom
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {filteredTemplates.length} template
          {filteredTemplates.length !== 1 ? "s" : ""} found
        </p>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : (
        <>
          {/* Templates Grid */}
          {filteredTemplates.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map((template) => (
                <Card
                  key={template.id}
                  className="bg-card border-border hover:border-primary/50 transition-all duration-200 group"
                >
                  <CardHeader className="p-0">
                    {/* Thumbnail */}
                    <div className="relative h-48 bg-gradient-to-br from-primary/20 to-primary/5 rounded-t-lg overflow-hidden">
                      {template.thumbnail_url ? (
                        <>
                          {template.thumbnail_url.includes(".mp4") ||
                          template.thumbnail_url.includes("video") ? (
                            <video
                              src={template.thumbnail_url}
                              className="w-full h-full object-cover"
                              preload="metadata"
                              muted
                              playsInline
                            />
                          ) : (
                            <img
                              src={template.thumbnail_url}
                              alt={template.title}
                              className="w-full h-full object-cover"
                            />
                          )}
                          <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Play className="w-12 h-12 text-white drop-shadow-lg" />
                          </div>
                        </>
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Play className="w-12 h-12 text-primary/50 group-hover:text-primary/80 transition-colors" />
                        </div>
                      )}
                      <div className="absolute top-3 right-3">
                        <Badge
                          variant="secondary"
                          className="bg-background/80 backdrop-blur-sm"
                        >
                          {template.duration_seconds}s
                        </Badge>
                      </div>
                      <div className="absolute top-3 left-3">
                        <Badge
                          variant="secondary"
                          className="bg-background/80 backdrop-blur-sm flex items-center gap-1"
                        >
                          {getCategoryIcon(template.video_type)}
                          {template.video_type}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 space-y-3">
                    <div>
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        {template.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {template.description}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2 pt-2">
                      <Button
                        onClick={() => handleViewTemplateVideos(template)}
                        variant="outline"
                        className="w-full border-border hover:border-primary"
                      >
                        <Video className="w-4 h-4 mr-2" />
                        See Generated Videos
                      </Button>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleRecreate(template)}
                          className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                        >
                          <Sparkles className="w-4 h-4 mr-2" />
                          Recreate
                        </Button>
                        <Button
                          onClick={() =>
                            handleViewOriginal(template.original_video_url)
                          }
                          variant="outline"
                          size="icon"
                          className="border-border hover:border-primary"
                          title="View Original"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                        {/* Options dropdown - only for custom templates */}
                        {activeTab === "custom" &&
                          template.created_by === user?.id && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="border-border hover:border-primary"
                                >
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => handleDeleteTemplate(template)}
                                  className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete Template
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Empty State */}
          {filteredTemplates.length === 0 && (
            <Card className="bg-card border-border">
              <CardContent className="p-12 text-center">
                {activeTab === "public" ? (
                  <>
                    <Video className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      No public templates found
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Try adjusting your filters or check back later
                    </p>
                  </>
                ) : (
                  <>
                    <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      No custom templates yet
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Save templates from the Public tab to build your custom
                      collection
                    </p>
                    <Button
                      onClick={() => setActiveTab("public")}
                      variant="outline"
                      className="border-border hover:border-primary"
                    >
                      <BookOpen className="w-4 h-4 mr-2" />
                      Browse Public Templates
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Template Videos Modal */}
      {selectedTemplate && (
        <Dialog open={!!selectedTemplate} onOpenChange={handleCloseVideosModal}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Videos Generated from "{selectedTemplate.title}"
              </DialogTitle>
              <DialogDescription>
                Videos created using this template by users
              </DialogDescription>
            </DialogHeader>

            {videosLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            ) : (
              <div className="space-y-4">
                {templateVideos.length === 0 ? (
                  <div className="text-center py-8">
                    <Video className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      No videos yet
                    </h3>
                    <p className="text-muted-foreground">
                      Be the first to create a video using this template!
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {templateVideos.map((video) => (
                      <Card key={video.id} className="bg-card border-border">
                        <CardContent className="p-0">
                          <div
                            className="relative bg-muted overflow-hidden"
                            style={{ aspectRatio: "9/16" }}
                          >
                            {video.video_url ? (
                              <video
                                src={video.video_url}
                                className="w-full h-full object-cover"
                                preload="metadata"
                                muted
                                playsInline
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                                <Video className="w-8 h-8 text-primary/50" />
                              </div>
                            )}
                            {video.duration_seconds && (
                              <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                                {video.duration_seconds}s
                              </div>
                            )}
                          </div>
                          <div className="p-3 space-y-2">
                            <h4 className="font-medium text-sm line-clamp-2">
                              {video.title}
                            </h4>
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>{video.model}</span>
                              <span>
                                {new Date(
                                  video.created_at
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        open={!!templateToDelete}
        onOpenChange={(open) => !open && setTemplateToDelete(null)}
        title="Delete Template"
        description={`Are you sure you want to delete "${templateToDelete?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDeleteTemplate}
        variant="destructive"
      />
    </div>
  );
}
