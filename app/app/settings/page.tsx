"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Crown,
  Sparkles,
  Instagram,
  Link as LinkIcon,
  CheckCircle,
  XCircle,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { socialMediaApi } from "@/lib/supabase";
import { ConfirmationModal } from "@/components/confirmation-modal";
import { PricingPlans } from "@/components/pricing-plans";
import { getStripe } from "@/lib/stripe";

// Mock subscription type - will be replaced with real data later
const MOCK_SUBSCRIPTION = "Free"; // "Free" or "Pro"

interface SocialMediaAccount {
  id: string;
  platform: "instagram" | "tiktok";
  username: string;
  display_name?: string;
  profile_picture_url?: string;
  connection_status: string;
  created_at: string;
}

export default function SettingsPage() {
  const { user } = useAuth();
  const [subscriptionType, setSubscriptionType] = useState<string>("free");
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);

  // Real social media accounts from database
  const [tiktokAccounts, setTiktokAccounts] = useState<SocialMediaAccount[]>(
    []
  );
  const [instagramAccounts, setInstagramAccounts] = useState<
    SocialMediaAccount[]
  >([]);
  const [loading, setLoading] = useState(true);

  // Modal state for account disconnection
  const [accountToDisconnect, setAccountToDisconnect] = useState<{
    id: string;
    platform: "tiktok" | "instagram";
    username: string;
  } | null>(null);

  // Fetch connected accounts on mount
  useEffect(() => {
    async function fetchAccounts() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Fetch TikTok accounts
        const { data: tiktok, error: tiktokError } =
          await socialMediaApi.getByPlatform(user.id, "tiktok");
        if (!tiktokError && tiktok) {
          setTiktokAccounts(tiktok as SocialMediaAccount[]);
        }

        // Fetch Instagram accounts
        const { data: instagram, error: instagramError } =
          await socialMediaApi.getByPlatform(user.id, "instagram");
        if (!instagramError && instagram) {
          setInstagramAccounts(instagram as SocialMediaAccount[]);
        }
      } catch (err) {
        console.error("Error fetching social media accounts:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchAccounts();
  }, [user]);

  const handleConnectTikTok = () => {
    // Redirect to TikTok OAuth flow
    window.location.href = "/api/auth/tiktok/connect";
  };

  const handleDisconnectAccount = (
    accountId: string,
    platform: "tiktok" | "instagram",
    username: string
  ) => {
    console.log("Disconnect clicked for:", { accountId, platform, username });
    setAccountToDisconnect({ id: accountId, platform, username });
  };

  const confirmDisconnectAccount = async () => {
    if (!accountToDisconnect) return;

    try {
      await socialMediaApi.delete(accountToDisconnect.id);

      // Update local state
      if (accountToDisconnect.platform === "tiktok") {
        setTiktokAccounts(
          tiktokAccounts.filter((acc) => acc.id !== accountToDisconnect.id)
        );
      } else {
        setInstagramAccounts(
          instagramAccounts.filter((acc) => acc.id !== accountToDisconnect.id)
        );
      }

      setAccountToDisconnect(null);
    } catch (err) {
      console.error("Error disconnecting account:", err);
      // Keep modal open and show error - you could add error state here if needed
    }
  };

  const handleConnectInstagram = () => {
    // Redirect to Instagram OAuth flow
    window.location.href = "/api/auth/instagram/connect";
  };

  const handleUpgrade = async (planName: string) => {
    if (!user) return;

    setSubscriptionLoading(true);
    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planName,
          userId: user.id,
        }),
      });

      const { sessionId, url } = await response.json();

      if (url) {
        window.location.href = url;
      } else if (sessionId) {
        const stripe = await getStripe();
        await stripe?.redirectToCheckout({ sessionId });
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
    } finally {
      setSubscriptionLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    if (!user) return;

    try {
      const response = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
        }),
      });

      const { url } = await response.json();

      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error("Error opening customer portal:", error);
    }
  };

  const handleCancelSubscription = () => {
    // TODO: Implement cancel subscription flow
    console.log("Cancel subscription");
  };

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Subscription Section */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-foreground flex items-center gap-2">
                {subscriptionType === "Pro" && (
                  <Crown className="w-5 h-5 text-primary" />
                )}
                Subscription
              </CardTitle>
              <CardDescription>Manage your subscription plan</CardDescription>
            </div>
            <Badge
              className={
                subscriptionType === "Pro"
                  ? "bg-primary/20 text-primary text-base px-4 py-1"
                  : "bg-muted text-muted-foreground text-base px-4 py-1"
              }
            >
              {subscriptionType === "Pro" && (
                <Sparkles className="w-4 h-4 mr-1" />
              )}
              {subscriptionType}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {subscriptionType === "free" ? (
            <>
              <div className="p-6 bg-muted/50 rounded-lg space-y-4">
                <p className="text-base text-muted-foreground">
                  You're currently on the Free plan. Upgrade to unlock premium
                  features:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-primary" />
                      <span className="text-sm text-foreground">
                        Unlimited video generations
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-primary" />
                      <span className="text-sm text-foreground">
                        Access to all video models (Sora 2 Pro)
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-primary" />
                      <span className="text-sm text-foreground">
                        Priority processing queue
                      </span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-primary" />
                      <span className="text-sm text-foreground">
                        Remove watermarks
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-primary" />
                      <span className="text-sm text-foreground">
                        Advanced analytics
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-primary" />
                      <span className="text-sm text-foreground">
                        API access
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="pt-4">
                <PricingPlans
                  currentPlan={subscriptionType}
                  onUpgrade={handleUpgrade}
                  loading={subscriptionLoading}
                />
              </div>
            </>
          ) : (
            <>
              <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                <div className="flex items-start gap-3">
                  <Crown className="w-5 h-5 text-primary mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">
                      Pro Plan Active
                    </p>
                    <p className="text-xs text-muted-foreground">
                      You have access to all premium features
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleManageSubscription}
                  className="flex-1 sm:flex-none"
                >
                  Manage Subscription
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Separator />

      {/* Social Media Integrations */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">
            Social Media Integrations
          </CardTitle>
          <CardDescription>
            Connect multiple social media accounts to post your videos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : (
            <>
              {/* TikTok Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-black flex items-center justify-center">
                      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"
                          fill="white"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-foreground">
                        TikTok
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {tiktokAccounts.length} account
                        {tiktokAccounts.length !== 1 ? "s" : ""} connected
                      </p>
                    </div>
                  </div>
                  <Button
                    size="default"
                    variant="outline"
                    className="border-border"
                    onClick={handleConnectTikTok}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Account
                  </Button>
                </div>

                {tiktokAccounts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tiktokAccounts.map((account) => (
                      <div
                        key={account.id}
                        className="p-4 bg-muted/30 rounded-lg border border-border hover:border-primary/50 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-12 h-12">
                              <AvatarImage src={account.profile_picture_url} />
                              <AvatarFallback className="bg-primary/10 text-primary">
                                {account.username.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-foreground">
                                @{account.username}
                              </p>
                              {account.display_name && (
                                <p className="text-xs text-muted-foreground">
                                  {account.display_name}
                                </p>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-red-600 hover:bg-red-50"
                            onClick={() =>
                              handleDisconnectAccount(
                                account.id,
                                "tiktok",
                                account.username
                              )
                            }
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="flex items-center justify-between">
                          <Badge className="bg-green-500/20 text-green-700 text-xs">
                            {account.connection_status}
                          </Badge>
                          <p className="text-xs text-muted-foreground">
                            Connected{" "}
                            {new Date(account.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 bg-muted/30 rounded-lg border border-dashed border-border text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                      <svg
                        className="w-8 h-8 text-muted-foreground"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"
                          fill="currentColor"
                        />
                      </svg>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      No TikTok accounts connected yet
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Connect your TikTok accounts to start posting your videos
                    </p>
                  </div>
                )}
              </div>

              <Separator />

              {/* Instagram Section - Coming Soon */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#FCAF45] flex items-center justify-center opacity-50">
                      <Instagram className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-foreground">
                        Instagram
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Coming soon
                      </p>
                    </div>
                  </div>
                  <Button
                    size="default"
                    variant="outline"
                    className="border-border"
                    disabled
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Coming Soon
                  </Button>
                </div>

                <div className="p-8 bg-muted/20 rounded-lg border border-dashed border-border text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#FCAF45] flex items-center justify-center opacity-50">
                    <Instagram className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Instagram integration coming soon
                  </p>
                  <p className="text-xs text-muted-foreground">
                    We're working on bringing Instagram support to expand your
                    reach across platforms
                  </p>
                </div>
              </div>

              <div className="pt-4">
                <p className="text-xs text-muted-foreground text-center">
                  💡 You can connect multiple accounts per platform
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Modal for Account Disconnection */}
      <ConfirmationModal
        open={accountToDisconnect !== null}
        onOpenChange={(open) => {
          if (!open) setAccountToDisconnect(null);
        }}
        onConfirm={confirmDisconnectAccount}
        title="Disconnect Account"
        description={
          accountToDisconnect
            ? `Are you sure you want to disconnect @${accountToDisconnect.username} from ${accountToDisconnect.platform}? This action cannot be undone.`
            : ""
        }
        confirmText="Disconnect"
        cancelText="Cancel"
        variant="destructive"
      />
    </div>
  );
}
