"use client";

import { useState } from "react";
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
import {
  Crown,
  Sparkles,
  Instagram,
  Link as LinkIcon,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

// Mock subscription type - will be replaced with real data later
const MOCK_SUBSCRIPTION = "Free"; // "Free" or "Pro"

export default function SettingsPage() {
  const { user } = useAuth();
  const [subscriptionType, setSubscriptionType] = useState<"Free" | "Pro">(
    MOCK_SUBSCRIPTION
  );

  // Mock connection status - will be replaced with real data later
  const [tiktokConnected, setTiktokConnected] = useState(false);
  const [instagramConnected, setInstagramConnected] = useState(false);

  const handleConnectTikTok = () => {
    // TODO: Implement TikTok OAuth flow
    console.log("Connect TikTok");
  };

  const handleDisconnectTikTok = () => {
    setTiktokConnected(false);
  };

  const handleConnectInstagram = () => {
    // TODO: Implement Instagram OAuth flow
    console.log("Connect Instagram");
  };

  const handleDisconnectInstagram = () => {
    setInstagramConnected(false);
  };

  const handleUpgrade = () => {
    // TODO: Implement upgrade flow (Stripe/payment)
    console.log("Upgrade to Pro");
  };

  const handleCancelSubscription = () => {
    // TODO: Implement cancel subscription flow
    console.log("Cancel subscription");
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl">
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
        <CardContent className="space-y-4">
          {subscriptionType === "Free" ? (
            <>
              <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                <p className="text-sm text-muted-foreground">
                  You're currently on the Free plan. Upgrade to Pro to unlock:
                </p>
                <ul className="space-y-2 text-sm text-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    Unlimited video generations
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    Access to all video models (Sora 2 Pro)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    Priority processing queue
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    Remove watermarks
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    Advanced analytics
                  </li>
                </ul>
              </div>
              <Button
                className="bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto"
                onClick={handleUpgrade}
              >
                <Crown className="w-4 h-4 mr-2" />
                Upgrade to Pro
              </Button>
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
              <Button
                variant="outline"
                className="border-border text-muted-foreground hover:bg-muted hover:text-foreground w-full sm:w-auto"
                onClick={handleCancelSubscription}
              >
                Cancel Subscription
              </Button>
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
            Connect your social media accounts to streamline your workflow
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* TikTok Integration */}
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-black flex items-center justify-center relative overflow-hidden">
                <svg
                  className="w-6 h-6 relative z-10"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"
                    fill="white"
                  />
                  <path
                    d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"
                    fill="#00F2EA"
                    style={{ mixBlendMode: "screen" }}
                  />
                  <path
                    d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"
                    fill="#FF0050"
                    style={{ mixBlendMode: "screen" }}
                  />
                </svg>
              </div>
              <div>
                <p className="font-medium text-foreground">TikTok</p>
                <p className="text-xs text-muted-foreground">
                  {tiktokConnected ? "Connected" : "Not connected"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {tiktokConnected ? (
                <>
                  <Badge className="bg-green-500/20 text-green-700">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Connected
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                    onClick={handleDisconnectTikTok}
                  >
                    Disconnect
                  </Button>
                </>
              ) : (
                <Button
                  size="sm"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  onClick={handleConnectTikTok}
                >
                  <LinkIcon className="w-4 h-4 mr-2" />
                  Connect
                </Button>
              )}
            </div>
          </div>

          {/* Instagram Integration */}
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#FCAF45] flex items-center justify-center">
                <Instagram className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-medium text-foreground">Instagram</p>
                <p className="text-xs text-muted-foreground">
                  {instagramConnected ? "Connected" : "Not connected"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {instagramConnected ? (
                <>
                  <Badge className="bg-green-500/20 text-green-700">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Connected
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                    onClick={handleDisconnectInstagram}
                  >
                    Disconnect
                  </Button>
                </>
              ) : (
                <Button
                  size="sm"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  onClick={handleConnectInstagram}
                >
                  <LinkIcon className="w-4 h-4 mr-2" />
                  Connect
                </Button>
              )}
            </div>
          </div>

          <p className="text-xs text-muted-foreground mt-4">
            More integrations coming soon...
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
