"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, Loader2 } from "lucide-react";

interface SubscriptionGuardProps {
  children: React.ReactNode;
}

export function SubscriptionGuard({ children }: SubscriptionGuardProps) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [subscriptionStatus, setSubscriptionStatus] = useState<
    "loading" | "active" | "inactive"
  >("loading");

  useEffect(() => {
    async function checkSubscription() {
      if (!user) {
        setSubscriptionStatus("inactive");
        return;
      }

      try {
        // Check user's subscription status
        // For now, we'll assume all logged-in users have access
        // You can implement the actual subscription check here
        setSubscriptionStatus("active");
      } catch (error) {
        console.error("Error checking subscription:", error);
        setSubscriptionStatus("inactive");
      }
    }

    if (!authLoading) {
      checkSubscription();
    }
  }, [user, authLoading]);

  // Show loading while checking auth and subscription
  if (authLoading || subscriptionStatus === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="text-muted-foreground">Loading...</span>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    router.push("/login");
    return null;
  }

  // Show upgrade prompt if no active subscription
  if (subscriptionStatus === "inactive") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <Crown className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Subscription Required</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              You need an active subscription to access the Mimio app. Choose a
              plan to get started.
            </p>
            <div className="space-y-2">
              <Button className="w-full" onClick={() => router.push("/")}>
                View Pricing Plans
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push("/app/settings")}
              >
                Manage Subscription
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // User has active subscription, show the app
  return <>{children}</>;
}
