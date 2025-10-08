"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
} from "lucide-react";
import { templatesApi } from "@/lib/supabase";

interface VideoTemplate {
  id: string;
  title: string;
  description: string;
  prompt: string;
  thumbnailUrl: string;
  category: string;
  duration: string;
  model: string;
  size: string;
  seconds: string;
  socialMediaUrl: string;
}

// Mock template data - will be replaced with database later
const templates: VideoTemplate[] = [
  {
    id: "1",
    title: "Product Showcase - Modern Tech",
    description: "Sleek product reveal with dynamic camera movements",
    prompt:
      "A sleek modern smartphone floating in a minimalist white space, slowly rotating to show all angles. Soft studio lighting creates elegant reflections on the glass surface. Camera slowly zooms in on the device as holographic UI elements appear around it. Professional product photography style.",
    thumbnailUrl: "/placeholder.jpg",
    category: "POV",
    duration: "8s",
    model: "sora-2",
    size: "720x1280",
    seconds: "8",
    socialMediaUrl: "https://www.tiktok.com/@example/video/123",
  },
  {
    id: "2",
    title: "Fashion Brand - Urban Style",
    description: "Dynamic fashion ad with urban energy",
    prompt:
      "A confident model walking down a vibrant city street at golden hour, wearing trendy streetwear. Dynamic camera follows alongside as they move with purpose. Neon signs and traffic blur in the background. Urban fashion editorial style with cinematic color grading.",
    thumbnailUrl: "/placeholder.jpg",
    category: "Review",
    duration: "15s",
    model: "sora-2-pro",
    size: "720x1280",
    seconds: "15",
    socialMediaUrl: "https://www.instagram.com/p/example123",
  },
  {
    id: "3",
    title: "Food & Beverage - Appetizing",
    description: "Mouth-watering food presentation",
    prompt:
      "Close-up of a gourmet burger being assembled in slow motion. Each layer drops perfectly - fresh lettuce, juicy tomatoes, melted cheese, and a perfectly cooked patty. Ingredients are vibrant and fresh. Steam rises from the hot patty. Professional food photography with dramatic lighting.",
    thumbnailUrl: "/placeholder.jpg",
    category: "Unboxing",
    duration: "8s",
    model: "sora-2",
    size: "1280x720",
    seconds: "8",
    socialMediaUrl: "https://www.youtube.com/shorts/example",
  },
  {
    id: "4",
    title: "Fitness Motivation",
    description: "High-energy workout inspiration",
    prompt:
      "Athletic person doing intense workout in a modern gym. Quick cuts between different exercises - push-ups, weights, running. Sweat droplets fly in slow motion. Dramatic lighting with strong contrast. Motivational and energetic atmosphere. Sports commercial style.",
    thumbnailUrl: "/placeholder.jpg",
    category: "Tutorial",
    duration: "12s",
    model: "sora-2",
    size: "720x1280",
    seconds: "12",
    socialMediaUrl: "https://www.tiktok.com/@fitness/video/456",
  },
  {
    id: "5",
    title: "Real Estate - Luxury Home",
    description: "Elegant property tour",
    prompt:
      "Smooth cinematic walkthrough of a luxurious modern home. Sunlight streams through floor-to-ceiling windows. Camera glides through open-concept living spaces showcasing high-end finishes and minimalist design. Peaceful and aspirational atmosphere. Architectural videography style.",
    thumbnailUrl: "/placeholder.jpg",
    category: "Showcase",
    duration: "15s",
    model: "sora-2-pro",
    size: "1280x720",
    seconds: "15",
    socialMediaUrl: "https://www.instagram.com/p/realestate789",
  },
  {
    id: "6",
    title: "App Launch - Tech Innovation",
    description: "Modern app demonstration",
    prompt:
      "Hands interacting with a smartphone showing a sleek mobile app interface. Smooth transitions between different app screens with animated UI elements. Modern tech aesthetic with glowing accents. Close-up shots of fingers swiping and tapping. Tech commercial style with futuristic vibe.",
    thumbnailUrl: "/placeholder.jpg",
    category: "Demo",
    duration: "12s",
    model: "sora-2",
    size: "720x1280",
    seconds: "12",
    socialMediaUrl: "https://www.tiktok.com/@tech/video/789",
  },
  {
    id: "7",
    title: "Travel & Tourism - Adventure",
    description: "Epic travel destination showcase",
    prompt:
      "Breathtaking aerial drone shot soaring over tropical paradise. Crystal clear turquoise water, white sand beaches, and lush green mountains. Camera sweeps dramatically through the landscape. Golden hour lighting creates warm, inviting atmosphere. Travel documentary cinematography style.",
    thumbnailUrl: "/placeholder.jpg",
    category: "POV",
    duration: "15s",
    model: "sora-2-pro",
    size: "1792x1024",
    seconds: "15",
    socialMediaUrl: "https://www.youtube.com/shorts/travel456",
  },
  {
    id: "8",
    title: "Skincare Brand - Clean Beauty",
    description: "Elegant beauty product showcase",
    prompt:
      "Minimal beauty product sitting on a clean white surface surrounded by natural elements - water droplets, green leaves, soft light. Product slowly rotates as water droplets fall in slow motion. Fresh, clean, and organic aesthetic. High-end beauty commercial style.",
    thumbnailUrl: "/placeholder.jpg",
    category: "Review",
    duration: "8s",
    model: "sora-2",
    size: "720x1280",
    seconds: "8",
    socialMediaUrl: "https://www.instagram.com/p/beauty101",
  },
  {
    id: "9",
    title: "Car Commercial - Speed",
    description: "Dynamic automotive showcase",
    prompt:
      "Sleek sports car speeding down a winding mountain road at sunset. Dynamic camera angles capture the car's curves and power. Motion blur emphasizes speed. Dramatic lighting highlights the vehicle's design. Automotive commercial cinematography with cinematic color grading.",
    thumbnailUrl: "/placeholder.jpg",
    category: "Showcase",
    duration: "12s",
    model: "sora-2-pro",
    size: "1792x1024",
    seconds: "12",
    socialMediaUrl: "https://www.youtube.com/shorts/cars789",
  },
  {
    id: "10",
    title: "Coffee Shop - Cozy Vibe",
    description: "Warm and inviting cafe atmosphere",
    prompt:
      "Steam rising from a perfectly made latte with intricate foam art. Cozy coffee shop background with warm lighting and bokeh effect. Barista's hands carefully pouring milk. Close-up shots of coffee beans and brewing process. Warm, inviting, and artisanal feel.",
    thumbnailUrl: "/placeholder.jpg",
    category: "Tutorial",
    duration: "8s",
    model: "sora-2",
    size: "720x1280",
    seconds: "8",
    socialMediaUrl: "https://www.tiktok.com/@coffee/video/321",
  },
  {
    id: "11",
    title: "Gaming - Epic Action",
    description: "High-energy gaming showcase",
    prompt:
      "First-person perspective of intense gaming action. Quick cuts between epic game moments - explosions, character abilities, dramatic victories. RGB lighting reflects on player's face. Controller in hands with rapid button presses. Gaming content creator style with vibrant colors.",
    thumbnailUrl: "/placeholder.jpg",
    category: "POV",
    duration: "12s",
    model: "sora-2",
    size: "1280x720",
    seconds: "12",
    socialMediaUrl: "https://www.youtube.com/shorts/gaming999",
  },
  {
    id: "12",
    title: "Jewelry - Elegant Luxury",
    description: "Sophisticated jewelry presentation",
    prompt:
      "Sparkling diamond necklace rotating on a black velvet surface. Dramatic lighting creates brilliant light reflections through the gemstones. Macro close-up reveals intricate details. Elegant and luxurious atmosphere. High-end jewelry commercial style.",
    thumbnailUrl: "/placeholder.jpg",
    category: "Unboxing",
    duration: "8s",
    model: "sora-2-pro",
    size: "720x1280",
    seconds: "8",
    socialMediaUrl: "https://www.instagram.com/p/jewelry555",
  },
];

const categories = [
  "All",
  "POV",
  "Review",
  "Unboxing",
  "Tutorial",
  "Showcase",
  "Demo",
];

export default function TemplatesPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  
  // Add template dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    video_type: "POV",
    video_prompt: "",
    original_video_url: "",
    model: "sora-2",
    size: "720x1280",
    duration_seconds: "8",
  });

  // Filter templates
  const filteredTemplates = templates.filter((template) => {
    const matchesCategory =
      selectedCategory === "All" || template.category === selectedCategory;

    return matchesCategory;
  });

  const handleRecreate = (template: VideoTemplate) => {
    // Navigate to create-video page with template data as URL params
    const params = new URLSearchParams({
      prompt: template.prompt,
      model: template.model,
      size: template.size,
      seconds: template.seconds,
    });
    router.push(`/create-video?${params.toString()}`);
  };

  const handleViewOriginal = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleSubmitTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data, error } = await templatesApi.create({
        title: formData.title,
        video_type: formData.video_type,
        video_prompt: formData.video_prompt,
        original_video_url: formData.original_video_url,
        model: formData.model,
        size: formData.size,
        duration_seconds: parseInt(formData.duration_seconds),
      });

      if (error) {
        alert("Error creating template: " + error.message);
        return;
      }

      // Reset form and close dialog
      setFormData({
        title: "",
        video_type: "POV",
        video_prompt: "",
        original_video_url: "",
        model: "sora-2",
        size: "720x1280",
        duration_seconds: "8",
      });
      setIsDialogOpen(false);
      alert("Template added successfully! Refresh to see it.");
    } catch (err) {
      console.error("Error:", err);
      alert("Failed to add template");
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
                        <SelectItem value="720x1280">720x1280 (Vertical)</SelectItem>
                        <SelectItem value="1280x720">1280x720 (Horizontal)</SelectItem>
                        <SelectItem value="1024x1792">1024x1792 (Portrait)</SelectItem>
                        <SelectItem value="1792x1024">1792x1024 (Landscape)</SelectItem>
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
          {/* Search */}
          {/* <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search templates by name, description, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-background border-border"
            />
          </div> */}

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

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {filteredTemplates.length} template
          {filteredTemplates.length !== 1 ? "s" : ""} found
        </p>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <Card
            key={template.id}
            className="bg-card border-border hover:border-primary/50 transition-all duration-200 group"
          >
            <CardHeader className="p-0">
              {/* Thumbnail */}
              <div className="relative h-48 bg-gradient-to-br from-primary/20 to-primary/5 rounded-t-lg overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Play className="w-12 h-12 text-primary/50 group-hover:text-primary/80 transition-colors" />
                </div>
                <div className="absolute top-3 right-3">
                  <Badge
                    variant="secondary"
                    className="bg-background/80 backdrop-blur-sm"
                  >
                    {template.duration}
                  </Badge>
                </div>
                <div className="absolute top-3 left-3">
                  <Badge
                    variant="secondary"
                    className="bg-background/80 backdrop-blur-sm flex items-center gap-1"
                  >
                    {getCategoryIcon(template.category)}
                    {template.category}
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
              <div className="flex gap-2 pt-2">
                <Button
                  onClick={() => handleRecreate(template)}
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Recreate
                </Button>
                <Button
                  onClick={() => handleViewOriginal(template.socialMediaUrl)}
                  variant="outline"
                  size="icon"
                  className="border-border hover:border-primary"
                  title="View Original"
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredTemplates.length === 0 && (
        <Card className="bg-card border-border">
          <CardContent className="p-12 text-center">
            <Video className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No templates found
            </h3>
            <p className="text-sm text-muted-foreground">
              Try adjusting your search or filters
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
