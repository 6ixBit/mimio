"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Crown, Zap, Rocket, Loader2 } from "lucide-react";
import { getSubscriptionPlans, formatPrice } from "@/lib/stripe";
import { useAuth } from "@/lib/auth-context";

interface PricingPlansProps {
  currentPlan?: string;
  onUpgrade?: (planName: string) => void;
  loading?: boolean;
}

export function PricingPlans({
  currentPlan = "free",
  onUpgrade,
  loading = false,
}: PricingPlansProps) {
  const { user } = useAuth();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleUpgrade = async (planName: string) => {
    if (!user || !onUpgrade) return;

    setLoadingPlan(planName);
    try {
      await onUpgrade(planName);
    } finally {
      setLoadingPlan(null);
    }
  };

  const SUBSCRIPTION_PLANS = getSubscriptionPlans();

  const plans = [
    {
      ...SUBSCRIPTION_PLANS.free,
      icon: <CheckCircle className="w-6 h-6 text-green-500" />,
      popular: false,
      description: "Perfect for getting started",
      buttonText: "Current Plan",
      buttonVariant: "outline" as const,
    },
    {
      ...SUBSCRIPTION_PLANS.starter,
      icon: <Zap className="w-6 h-6 text-blue-500" />,
      popular: false,
      description: "Great for small creators",
      buttonText: "Upgrade to Starter",
      buttonVariant: "default" as const,
    },
    {
      ...SUBSCRIPTION_PLANS.scaler,
      icon: <Crown className="w-6 h-6 text-purple-500" />,
      popular: true,
      description: "Most popular for growing creators",
      buttonText: "Upgrade to Scaler",
      buttonVariant: "default" as const,
    },
    {
      ...SUBSCRIPTION_PLANS.pro,
      icon: <Rocket className="w-6 h-6 text-orange-500" />,
      popular: false,
      description: "For professional teams",
      buttonText: "Upgrade to Pro",
      buttonVariant: "default" as const,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {plans.map((plan) => {
        const isCurrentPlan = currentPlan === plan.name;
        const isLoading = loadingPlan === plan.name;

        return (
          <Card
            key={plan.name}
            className={`relative ${plan.popular ? "ring-2 ring-primary" : ""} ${
              isCurrentPlan ? "bg-muted/50" : ""
            }`}
          >
            {plan.popular && (
              <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-primary">
                Most Popular
              </Badge>
            )}

            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-2">{plan.icon}</div>
              <CardTitle className="text-xl">{plan.displayName}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {plan.description}
              </p>
              <div className="mt-4">
                <span className="text-3xl font-bold">
                  {formatPrice(plan.price)}
                </span>
                {plan.price > 0 && (
                  <span className="text-muted-foreground">/month</span>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Credits - Prominently displayed */}
              {plan.features.credits > 0 && (
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-primary">
                    {plan.features.credits}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    credits/month
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    ~{Math.floor(plan.features.credits / 8)}× 8sec videos
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {plan.features.credits > 0 && (
                  <>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>1 credit = 1 second video</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Mix any video lengths</span>
                    </div>
                  </>
                )}

                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>
                    {plan.features.templates === "all"
                      ? "All templates"
                      : "Basic templates"}
                  </span>
                </div>

                {!plan.features.watermark && (
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>No watermarks</span>
                  </div>
                )}

                {plan.features.processing === "priority" && (
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Priority processing</span>
                  </div>
                )}

                {plan.features.analytics === "advanced" && (
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Advanced analytics</span>
                  </div>
                )}

                {plan.features.apiAccess && (
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>API access</span>
                  </div>
                )}
              </div>

              <Button
                className="w-full"
                variant={isCurrentPlan ? "outline" : plan.buttonVariant}
                disabled={isCurrentPlan || isLoading || loading}
                onClick={() => !isCurrentPlan && handleUpgrade(plan.name)}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : isCurrentPlan ? (
                  "Current Plan"
                ) : (
                  plan.buttonText
                )}
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
