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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Sparkles, Wand2 } from "lucide-react";
import { API_ENDPOINTS, getApiUrl } from "@/lib/api-config";

interface PromptAdapterModalProps {
  isOpen: boolean;
  onClose: () => void;
  basePrompt: string;
  onPromptGenerated: (newPrompt: string) => void;
}

export function PromptAdapterModal({
  isOpen,
  onClose,
  basePrompt,
  onPromptGenerated,
}: PromptAdapterModalProps) {
  const [instructions, setInstructions] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAdaptMode = basePrompt.trim().length > 0;

  const handleGenerate = async () => {
    if (!instructions.trim()) {
      setError("Please provide instructions for the prompt");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const formData = new FormData();
      if (isAdaptMode) {
        formData.append("base_prompt", basePrompt);
      }
      formData.append("adaptation_instructions", instructions);

      const response = await fetch(getApiUrl(API_ENDPOINTS.ADAPT_PROMPT), {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.detail || "Failed to generate prompt");
      }

      const data = await response.json();
      onPromptGenerated(data.prompt);
      setInstructions("");
      onClose();
    } catch (err) {
      console.error("Error generating prompt:", err);
      setError(
        err instanceof Error ? err.message : "Failed to generate prompt"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClose = () => {
    if (!isGenerating) {
      setInstructions("");
      setError(null);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isAdaptMode ? (
              <>
                <Wand2 className="w-5 h-5 text-primary" />
                Adapt Prompt
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-primary" />
                Generate Prompt
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {isAdaptMode
              ? "Describe how you want to modify the existing prompt. The AI will adapt it while maintaining the detailed format."
              : "Describe the video you want to create in plain English."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Instructions Input */}
          <div className="space-y-2">
            <Label htmlFor="instructions">
              {isAdaptMode ? "Adaptation Instructions" : "Video Description"}
            </Label>
            <Textarea
              id="instructions"
              placeholder={
                isAdaptMode
                  ? "e.g., Change the subject to an Asian female and make the message about how gaming is beneficial instead of harmful"
                  : "e.g., Create a 12-second video of a young woman talking directly to camera about fitness motivation, modern aesthetic, bright lighting"
              }
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              disabled={isGenerating}
              className="min-h-[120px] resize-y"
            />
            <p className="text-xs text-muted-foreground">
              {isAdaptMode
                ? "Be specific about what you want to change. The structure and format will be preserved."
                : "Include details like subject, message, style, duration, and visual aesthetic."}
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isGenerating}
          >
            Cancel
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={!instructions.trim() || isGenerating}
            className="bg-primary hover:bg-primary/90"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                {isAdaptMode ? "Adapt Prompt" : "Generate Prompt"}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
