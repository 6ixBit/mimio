"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
  const [includeTranscript, setIncludeTranscript] = useState(true);
  const [ignoreTextOnScreen, setIgnoreTextOnScreen] = useState(false);

  // Custom script state
  const [audioOption, setAudioOption] = useState<
    "original" | "custom" | "none"
  >("original");
  const [customScript, setCustomScript] = useState("");
  const MAX_SCRIPT_LENGTH = 500;

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

    // Validate custom script if custom audio option is selected
    if (audioOption === "custom" && customScript.trim().length < 10) {
      alert(
        "Please provide a script (at least 10 characters) for your custom audio"
      );
      return;
    }

    setIsAnalyzing(true);
    setAnalysisProgress(0);

    try {
      const formData = new FormData();

      formData.append("video_file", selectedVideo);

      // Handle audio options
      if (audioOption === "custom") {
        formData.append("include_transcript", "false");
        formData.append("custom_script", customScript);
      } else if (audioOption === "none") {
        formData.append("include_transcript", "false");
      } else {
        formData.append("include_transcript", "true");
      }

      formData.append("ignore_text_on_screen", ignoreTextOnScreen.toString());

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
      alert("Failed to analyze video. Please try again.");

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

    // Include custom script if it was used
    if (audioOption === "custom" && customScript) {
      params.append("customScript", customScript);
    }

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

            {/* Audio Options */}
            <div className="space-y-4 p-4 border border-border rounded-lg bg-muted/30">
              <div className="space-y-1">
                <Label className="text-sm font-semibold">
                  What should the video say?
                </Label>
                <p className="text-xs text-muted-foreground">
                  Choose how to handle the audio content
                </p>
              </div>

              <RadioGroup
                value={audioOption}
                onValueChange={(value: "original" | "custom" | "none") =>
                  setAudioOption(value)
                }
                disabled={isAnalyzing}
                className="space-y-3"
              >
                {/* Original Audio Option */}
                <div className="flex items-start space-x-3 p-3 rounded-lg border border-border hover:border-primary/50 transition-colors">
                  <RadioGroupItem
                    value="original"
                    id="original-audio"
                    className="mt-0.5"
                  />
                  <div className="flex-1 space-y-1">
                    <Label
                      htmlFor="original-audio"
                      className="text-sm font-medium cursor-pointer"
                    >
                      Same as original video
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Keep the original dialogue and what they're saying
                    </p>
                  </div>
                </div>

                {/* Custom Script Option */}
                <div className="flex items-start space-x-3 p-3 rounded-lg border border-border hover:border-primary/50 transition-colors">
                  <RadioGroupItem
                    value="custom"
                    id="custom-script"
                    className="mt-0.5"
                  />
                  <div className="flex-1 space-y-1">
                    <Label
                      htmlFor="custom-script"
                      className="text-sm font-medium cursor-pointer"
                    >
                      Replace with my own message
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Talk about your product instead (e.g., "iPhone" → "our
                      app")
                    </p>
                  </div>
                </div>

                {/* No Audio Option */}
                <div className="flex items-start space-x-3 p-3 rounded-lg border border-border hover:border-primary/50 transition-colors">
                  <RadioGroupItem
                    value="none"
                    id="no-audio"
                    className="mt-0.5"
                  />
                  <div className="flex-1 space-y-1">
                    <Label
                      htmlFor="no-audio"
                      className="text-sm font-medium cursor-pointer"
                    >
                      No audio / visual only
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Focus only on visual style, ignore all spoken content
                    </p>
                  </div>
                </div>
              </RadioGroup>

              {/* Custom Script Textarea - Only show when custom is selected */}
              {audioOption === "custom" && (
                <div className="space-y-2 pt-2 pl-8">
                  <Label className="text-xs font-medium">Your Message</Label>
                  <Textarea
                    placeholder="What do you want the video to say? (e.g., 'Check out our new productivity app! It helps you manage tasks 10x faster!')"
                    value={customScript}
                    onChange={(e) =>
                      setCustomScript(
                        e.target.value.slice(0, MAX_SCRIPT_LENGTH)
                      )
                    }
                    disabled={isAnalyzing}
                    className="min-h-[100px] resize-none"
                    maxLength={MAX_SCRIPT_LENGTH}
                  />
                  <div className="flex items-center justify-between text-xs">
                    <p className="text-muted-foreground">
                      💡 Keep it brief - we'll adapt it to match the video's
                      style
                    </p>
                    <p
                      className={`font-medium ${
                        customScript.length > MAX_SCRIPT_LENGTH * 0.9
                          ? "text-orange-500"
                          : "text-muted-foreground"
                      }`}
                    >
                      {customScript.length}/{MAX_SCRIPT_LENGTH}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Ignore Text on Screen Option */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="ignore-text"
                checked={ignoreTextOnScreen}
                onCheckedChange={(checked) =>
                  setIgnoreTextOnScreen(checked === true)
                }
                disabled={isAnalyzing}
              />
              <Label
                htmlFor="ignore-text"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Ignore text on screen (focus on actions and visuals only)
              </Label>
            </div>

            {/* Analysis Button */}
            {isAnalyzing ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center py-8">
                  <div className="text-center space-y-4">
                    <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
                    <div>
                      <p className="text-sm font-medium">Analyzing video...</p>
                      <p className="text-xs text-muted-foreground">
                        This may take 30-60 seconds
                      </p>
                    </div>
                  </div>
                </div>
                <Progress value={analysisProgress} className="h-2" />
                <p className="text-xs text-center text-muted-foreground">
                  {analysisProgress < 30
                    ? "Processing video..."
                    : analysisProgress < 60
                    ? "Analyzing scenes..."
                    : analysisProgress < 90
                    ? "Generating format breakdown..."
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

          {/* Generated Prompt */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="w-5 h-5 text-primary" />
                Video Format Breakdown
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
                  Generate Video
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
