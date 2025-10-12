"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, XCircle, ExternalLink } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { socialMediaApi, videoPostsApi } from "@/lib/supabase";

interface SocialMediaAccount {
  id: string;
  platform: "tiktok" | "instagram";
  username: string;
  display_name?: string;
  profile_picture_url?: string;
  connection_status: string;
}

interface PostToSocialModalProps {
  isOpen: boolean;
  onClose: () => void;
  video: {
    id: string;
    title: string;
    video_url: string;
  };
}

type PostStatus = "idle" | "uploading" | "published" | "failed";

export function PostToSocialModal({
  isOpen,
  onClose,
  video,
}: PostToSocialModalProps) {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<any[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [caption, setCaption] = useState("");
  const [status, setStatus] = useState<PostStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [postUrl, setPostUrl] = useState<string | null>(null);
  const [loadingAccounts, setLoadingAccounts] = useState(true);

  // Load connected accounts
  useEffect(() => {
    async function loadAccounts() {
      if (!user || !isOpen) return;

      try {
        setLoadingAccounts(true);
        const { data, error } = await socialMediaApi.getAll(user.id);

        if (error) throw error;

        // Filter to only active, connected accounts
        const activeAccounts = (data || []).filter(
          (acc: any) => acc.connection_status === "connected" && acc.is_active
        );

        setAccounts(activeAccounts);

        // Auto-select first account if only one
        if (activeAccounts.length === 1 && activeAccounts[0]) {
          setSelectedAccountId((activeAccounts[0] as any).id);
        }
      } catch (err) {
        console.error("Error loading accounts:", err);
        setError("Failed to load social media accounts");
      } finally {
        setLoadingAccounts(false);
      }
    }

    loadAccounts();
  }, [user, isOpen]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setStatus("idle");
      setError(null);
      setPostUrl(null);
      setCaption("");
      setSelectedAccountId("");
    }
  }, [isOpen]);

  const handlePost = async () => {
    if (!user || !selectedAccountId) return;

    const selectedAccount = accounts.find(
      (acc) => acc.id === selectedAccountId
    );
    if (!selectedAccount) return;

    try {
      setStatus("uploading");
      setError(null);

      // Create post record in database
      const { data: postRecord, error: createError }: any =
        await videoPostsApi.create(user.id, {
          video_id: video.id,
          social_media_account_id: selectedAccountId,
          platform: selectedAccount.platform,
          caption: caption || undefined,
        });

      if (createError) throw createError;

      // Upload to the platform
      if (selectedAccount.platform === "tiktok") {
        const response = await fetch("/api/social/tiktok/upload", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: user.id,
            video_url: video.video_url,
            caption: caption || video.title,
            account_id: selectedAccountId,
            post_id: postRecord!.id,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Failed to upload video");
        }

        // Update post record with success
        await videoPostsApi.update(postRecord!.id, {
          status: "published",
          platform_post_id: result.post_id,
          post_url: result.post_url || undefined,
          posted_at: new Date().toISOString(),
        });

        setPostUrl(result.post_url);
        setStatus("published");
      } else {
        // Instagram - coming soon
        throw new Error("Instagram posting coming soon!");
      }
    } catch (err) {
      console.error("Error posting video:", err);
      setError(err instanceof Error ? err.message : "Failed to post video");
      setStatus("failed");

      // Update post record with failure
      if (selectedAccountId && video.id) {
        await videoPostsApi.update(selectedAccountId, {
          status: "failed",
          error_message: err instanceof Error ? err.message : "Unknown error",
        });
      }
    }
  };

  const selectedAccount = accounts.find((acc) => acc.id === selectedAccountId);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Post to Social Media</DialogTitle>
          <DialogDescription>
            Share &quot;{video.title}&quot; to your connected accounts
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {loadingAccounts ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : accounts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                No social media accounts connected
              </p>
              <Button
                onClick={() => {
                  onClose();
                  window.location.href = "/settings";
                }}
                variant="outline"
              >
                Connect Accounts
              </Button>
            </div>
          ) : status === "idle" || status === "uploading" ? (
            <>
              {/* Account Selection */}
              <div className="space-y-2">
                <Label htmlFor="account">Select Account</Label>
                <Select
                  value={selectedAccountId}
                  onValueChange={setSelectedAccountId}
                  disabled={status === "uploading"}
                >
                  <SelectTrigger id="account">
                    <SelectValue placeholder="Choose an account" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        <div className="flex items-center gap-2">
                          {account.profile_picture_url && (
                            <img
                              src={account.profile_picture_url}
                              alt={account.username}
                              className="w-5 h-5 rounded-full"
                            />
                          )}
                          <span className="font-medium">
                            {account.display_name || account.username}
                          </span>
                          <Badge variant="outline" className="ml-1">
                            {account.platform}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Caption */}
              <div className="space-y-2">
                <Label htmlFor="caption">
                  Caption{" "}
                  <span className="text-muted-foreground text-xs">
                    (optional)
                  </span>
                </Label>
                <Textarea
                  id="caption"
                  placeholder={`Enter caption for ${
                    selectedAccount?.platform || "your post"
                  }...`}
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  disabled={status === "uploading"}
                  rows={4}
                  maxLength={2200}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground text-right">
                  {caption.length}/2200 characters
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded text-sm text-destructive">
                  {error}
                </div>
              )}
            </>
          ) : status === "published" ? (
            <div className="text-center py-8 space-y-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">
                  Video Uploaded Successfully!
                </h3>
                <p className="text-muted-foreground text-sm mb-2">
                  Your video has been uploaded to{" "}
                  {selectedAccount?.platform || "social media"}
                </p>
                {selectedAccount?.platform === "tiktok" && (
                  <p className="text-sm text-primary font-medium">
                    📱 Check your TikTok notifications to review and post your
                    video!
                  </p>
                )}
              </div>
              {postUrl && (
                <Button
                  variant="outline"
                  onClick={() => window.open(postUrl, "_blank")}
                  className="gap-2"
                >
                  View Post
                  <ExternalLink className="w-4 h-4" />
                </Button>
              )}
            </div>
          ) : (
            <div className="text-center py-8 space-y-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                  <XCircle className="w-8 h-8 text-destructive" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Upload Failed</h3>
                <p className="text-muted-foreground text-sm">{error}</p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          {status === "idle" || status === "uploading" ? (
            <>
              <Button
                variant="outline"
                onClick={onClose}
                disabled={status === "uploading"}
              >
                Cancel
              </Button>
              <Button
                onClick={handlePost}
                disabled={!selectedAccountId || status === "uploading"}
              >
                {status === "uploading" ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  "Post Now"
                )}
              </Button>
            </>
          ) : (
            <Button onClick={onClose} className="w-full">
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
