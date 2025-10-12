"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Upload,
  Video,
  Wand2,
  Loader2,
  Download,
  Copy,
  Sparkles,
  Eye,
  ChevronRight,
  Check,
  X,
  Film,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { getApiUrl, API_ENDPOINTS } from "@/lib/api-config";

interface SceneBreakdown {
  timestamp: string;
  duration: string;
  description: string;
  camera: string;
  lighting: string;
  action: string;
  audio?: string;
}

interface VideoAnalysis {
  overall_description: string;
  style: string;
  tone: string;
  pacing: string;
  scenes: SceneBreakdown[];
  sora_prompt: string;
}

export default function AnalyzeVideoPage() {
  const router = useRouter();
  const { user } = useAuth();

  // Upload state
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState("");

  // Analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysis, setAnalysis] = useState<VideoAnalysis | null>(null);

  // Customization state
  const [editedPrompt, setEditedPrompt] = useState("");
  const [productName, setProductName] = useState("");
  const [brandName, setBrandName] = useState("");
  const [customInstructions, setCustomInstructions] = useState("");
  const [includeTranscript, setIncludeTranscript] = useState(true);

  // Drag and drop handler
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setSelectedVideo(acceptedFiles[0]);
      setVideoUrl("");
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "video/mp4": [".mp4"],
      "video/quicktime": [".mov"],
      "video/x-msvideo": [".avi"],
      "video/webm": [".webm"],
    },
    maxFiles: 1,
    disabled: isAnalyzing,
  });

  const handleRemoveVideo = () => {
    setSelectedVideo(null);
  };

  const handleAnalyze = async () => {
    if (!selectedVideo) {
      alert("Please upload a video file");
      return;
    }

    setIsAnalyzing(true);
    setAnalysisProgress(0);

    try {
      const formData = new FormData();

      formData.append("video_file", selectedVideo);
      formData.append("include_transcript", includeTranscript.toString());

      // Simulate progress
      const progressInterval = setInterval(() => {
        setAnalysisProgress((prev) => Math.min(prev + 5, 90));
      }, 500);

      // Call API endpoint for video analysis
      const response = await fetch(getApiUrl(API_ENDPOINTS.ANALYZE_VIDEO), {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        throw new Error("Analysis failed");
      }

      const result: VideoAnalysis = await response.json();
      setAnalysis(result);
      setEditedPrompt(result.sora_prompt);
      setAnalysisProgress(100);
    } catch (error) {
      console.error("Error analyzing video:", error);
      alert("Failed to analyze video. This feature is coming soon!");

      // Mock data for demonstration
      const mockAnalysis: VideoAnalysis = {
        overall_description:
          "A fast-paced product showcase video featuring dynamic camera movements and vibrant lighting.",
        style: "Modern, energetic, commercial",
        tone: "Exciting, aspirational",
        pacing: "Quick cuts, high energy",
        scenes: [
          {
            timestamp: "0:00-0:03",
            duration: "3 seconds",
            description: "Close-up of product spinning on white background",
            camera: "Slow dolly zoom in, camera rotates 360°",
            lighting: "Soft key light from top-right, rim light for definition",
            action: "Product rotates clockwise, highlights gleaming",
            audio: "Subtle whoosh sound",
          },
          {
            timestamp: "0:03-0:06",
            duration: "3 seconds",
            description: "Person's hands interacting with product",
            camera: "Medium shot, slight overhead angle",
            lighting: "Natural daylight from window, warm tone",
            action: "Hands carefully unbox and reveal product",
            audio: "Unboxing sounds, ambient music builds",
          },
          {
            timestamp: "0:06-0:08",
            duration: "2 seconds",
            description: "Quick montage of product features",
            camera: "Rapid cuts, macro shots",
            lighting: "High contrast, dramatic shadows",
            action: "Close-ups of buttons, texture, details",
            audio: "Fast-paced music, click sounds",
          },
        ],
        sora_prompt: `A professional product showcase video, 8 seconds total.

SCENE 1 (0-3s): Close-up shot of a sleek modern product centered on a pure white background. Camera slowly dollies in while rotating 360 degrees around the product. Soft key light from top-right creates gentle shadows, rim light adds definition to edges. Product rotates clockwise, its surface gleaming with highlights. Cinematography style: commercial product photography, shallow depth of field, pristine and premium feel.

SCENE 2 (3-6s): Cut to medium overhead shot of hands carefully unboxing the product. Natural daylight streams from a nearby window creating warm, inviting tones. Hands move deliberately, revealing the product with care. Camera maintains steady overhead angle. Lighting: soft natural light, golden hour quality, authentic and relatable atmosphere.

SCENE 3 (6-8s): Rapid montage of extreme macro shots highlighting product features. Camera quickly cuts between close-ups of buttons, texture, materials. High contrast lighting creates dramatic shadows. Each detail is sharp and prominent. Cinematography: commercial macro photography, crisp focus, dynamic and energetic pacing.

Overall aesthetic: Premium commercial quality, modern and aspirational, fast-paced energy, vibrant yet sophisticated color grading.`,
      };

      setAnalysis(mockAnalysis);
      setEditedPrompt(mockAnalysis.sora_prompt);
      setAnalysisProgress(100);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCustomize = () => {
    if (!analysis) return;

    let customized = analysis.sora_prompt;

    // Replace product/brand mentions
    if (productName) {
      customized = customized.replace(/product/gi, productName);
    }

    if (brandName) {
      customized = `${customized}\n\nBrand: ${brandName}. Maintain brand identity throughout.`;
    }

    if (customInstructions) {
      customized = `${customized}\n\nAdditional instructions: ${customInstructions}`;
    }

    setEditedPrompt(customized);
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(editedPrompt);
    alert("Prompt copied to clipboard!");
  };

  const handleCreateWithSora = () => {
    // Navigate to create video with the detailed prompt pre-filled
    const params = new URLSearchParams({
      prompt: editedPrompt,
      model: "sora-2",
      size: "720x1280",
      seconds: "8",
    });
    router.push(`/app/create-video?${params.toString()}`);
  };

  const handleReset = () => {
    setSelectedVideo(null);
    setVideoUrl("");
    setAnalysis(null);
    setEditedPrompt("");
    setProductName("");
    setBrandName("");
    setCustomInstructions("");
    setAnalysisProgress(0);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Mimic Video</h1>
        <p className="text-muted-foreground">
          Upload any viral video and we'll recreate it for your brand
        </p>
      </div>

      {!analysis ? (
        /* Upload Section */
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Upload Video to Mimic
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* File Upload */}
            <div className="space-y-2">
              <Label>Video File</Label>
              {!selectedVideo ? (
                <div
                  {...getRootProps()}
                  className={`
                      relative border-2 border-dashed rounded-lg p-12 transition-all cursor-pointer
                      ${
                        isDragActive
                          ? "border-primary bg-primary/5 scale-[1.02]"
                          : "border-border bg-muted/30 hover:border-primary/50 hover:bg-muted/50"
                      }
                      ${isAnalyzing ? "opacity-50 cursor-not-allowed" : ""}
                    `}
                >
                  <input {...getInputProps()} />
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <Upload className="w-8 h-8 text-primary" />
                    </div>
                    <p className="text-lg font-medium text-foreground mb-2">
                      {isDragActive ? (
                        "Drop your video here"
                      ) : (
                        <>
                          Drag & drop a video, or{" "}
                          <span className="text-primary">click to browse</span>
                        </>
                      )}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Supports MP4, MOV, AVI, WebM (max 100MB)
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-muted/50 rounded-lg border border-border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Video className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {selectedVideo.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {(selectedVideo.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="hover:bg-red-500/10 hover:text-red-600"
                      onClick={handleRemoveVideo}
                      disabled={isAnalyzing}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Include Transcript Option */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="include-transcript"
                checked={includeTranscript}
                onCheckedChange={(checked) =>
                  setIncludeTranscript(checked === true)
                }
                disabled={isAnalyzing}
              />
              <Label
                htmlFor="include-transcript"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Include audio transcript in generated prompt
              </Label>
            </div>

            {/* Analysis Button */}
            {isAnalyzing ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center py-8">
                  <div className="text-center space-y-4">
                    <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
                    <div>
                      <p className="text-sm font-medium">
                        Analyzing video with AI...
                      </p>
                      <p className="text-xs text-muted-foreground">
                        This may take 30-60 seconds
                      </p>
                    </div>
                  </div>
                </div>
                <Progress value={analysisProgress} className="h-2" />
                <p className="text-xs text-center text-muted-foreground">
                  {analysisProgress < 30
                    ? "Extracting key frames..."
                    : analysisProgress < 60
                    ? "Analyzing scenes with GPT-4 Vision..."
                    : analysisProgress < 90
                    ? "Generating detailed Sora prompt..."
                    : "Finalizing..."}
                </p>
              </div>
            ) : (
              <Button
                onClick={handleAnalyze}
                disabled={!selectedVideo && !videoUrl}
                className="w-full bg-primary hover:bg-primary/90"
                size="lg"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Mimic This Video
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        /* Analysis Results */
        <div className="space-y-6">
          {/* Overview */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-primary" />
                Video Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Style</p>
                  <Badge variant="secondary">{analysis.style}</Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Tone</p>
                  <Badge variant="secondary">{analysis.tone}</Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Pacing</p>
                  <Badge variant="secondary">{analysis.pacing}</Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Scenes</p>
                  <Badge variant="secondary">{analysis.scenes.length}</Badge>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Overall Description</p>
                <p className="text-sm text-muted-foreground">
                  {analysis.overall_description}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Scene Breakdown */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Film className="w-5 h-5 text-primary" />
                Scene-by-Scene Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {analysis.scenes.map((scene, index) => (
                <div
                  key={index}
                  className="p-4 bg-muted/50 rounded-lg border border-border space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <Badge className="bg-primary text-primary-foreground">
                      Scene {index + 1}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {scene.timestamp} ({scene.duration})
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">
                        Description
                      </p>
                      <p className="text-sm">{scene.description}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">
                          📷 Camera
                        </p>
                        <p className="text-sm">{scene.camera}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">
                          💡 Lighting
                        </p>
                        <p className="text-sm">{scene.lighting}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">
                          🎬 Action
                        </p>
                        <p className="text-sm">{scene.action}</p>
                      </div>
                      {scene.audio && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground">
                            🔊 Audio
                          </p>
                          <p className="text-sm">{scene.audio}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Customization */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Customize for Your Brand
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="product">Product Name</Label>
                  <Input
                    id="product"
                    placeholder="e.g., EcoBottle Pro"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    className="bg-background border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="brand">Brand Name</Label>
                  <Input
                    id="brand"
                    placeholder="e.g., GreenTech"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    className="bg-background border-border"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="custom">Additional Instructions</Label>
                <Textarea
                  id="custom"
                  placeholder="e.g., Add more emphasis on sustainability, use green color grading..."
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                  className="bg-background border-border min-h-[80px]"
                />
              </div>

              <Button
                onClick={handleCustomize}
                variant="outline"
                className="w-full border-border"
              >
                <Wand2 className="w-4 h-4 mr-2" />
                Apply Customizations
              </Button>
            </CardContent>
          </Card>

          {/* Generated Prompt */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="w-5 h-5 text-primary" />
                Detailed Sora Prompt
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={editedPrompt}
                onChange={(e) => setEditedPrompt(e.target.value)}
                className="bg-background border-border min-h-[300px] font-mono text-sm"
              />

              <div className="flex gap-2">
                <Button
                  onClick={handleCopyPrompt}
                  variant="outline"
                  className="flex-1 border-border"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Prompt
                </Button>
                <Button
                  onClick={handleCreateWithSora}
                  className="flex-1 bg-primary hover:bg-primary/90"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Create with Sora
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>

              <Button onClick={handleReset} variant="ghost" className="w-full">
                Mimic Another Video
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
