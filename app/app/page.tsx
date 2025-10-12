"use client";

import { Video, Sparkles, Wand2, Crown, Zap, Rocket } from "lucide-react";
import { OptionCard } from "@/components/option-card";
import { ProtectedRoute } from "@/components/protected-route";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle } from "lucide-react";
import { getSubscriptionPlans, formatPrice } from "@/lib/stripe";
import { useAuth } from "@/lib/auth-context";
import { useState } from "react";
import { getStripe } from "@/lib/stripe";

export default function HomePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async (planName: string) => {
    if (!user) return;

    setLoading(true);
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
      setLoading(false);
    }
  };

  const options = [
    {
      id: "create-video",
      icon: Video,
      title: "Create Videos",
      description: "Generate single videos, variations, or batches with AI",
      href: "/app/create-video",
    },
    {
      id: "mimic-video",
      icon: Wand2,
      title: "Mimic Videos",
      description: "Upload viral videos and recreate them for your brand",
      href: "/app/analyze",
    },
    {
      id: "templates",
      icon: Sparkles,
      title: "Ad Templates",
      description: "Browse viral ad templates and recreate them",
      href: "/app/templates",
    },
  ];

  return (
    <ProtectedRoute>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome to Mimio
          </h1>
          <p className="text-muted-foreground">
            AI-powered video generation for your marketing campaigns
          </p>
        </div>

        {/* Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
          {options.map((option) => (
            <OptionCard
              key={option.id}
              icon={option.icon}
              title={option.title}
              description={option.description}
              href={option.href}
            />
          ))}
        </div>

        {/* Pricing Section */}
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Choose Your Plan
            </h2>
            <p className="text-muted-foreground">
              Scale your video marketing with the perfect plan for your needs
            </p>
          </div>

          <PricingCards onUpgrade={handleUpgrade} loading={loading} />
        </div>
      </div>
    </ProtectedRoute>
  );
}

function PricingCards({
  onUpgrade,
  loading,
}: {
  onUpgrade: (plan: string) => void;
  loading: boolean;
}) {
  const SUBSCRIPTION_PLANS = getSubscriptionPlans();

  const plans = [
    {
      ...SUBSCRIPTION_PLANS.starter,
      icon: <Zap className="w-6 h-6 text-blue-500" />,
      popular: false,
      description: "Perfect for small creators",
      features: [
        "25 video generations/month",
        "All templates",
        "Standard processing",
        "Email support",
      ],
    },
    {
      ...SUBSCRIPTION_PLANS.scaler,
      icon: <Crown className="w-6 h-6 text-purple-500" />,
      popular: true,
      description: "Most popular for growing creators",
      features: [
        "100 video generations/month",
        "No watermarks",
        "Priority processing",
        "Sora 2 Pro access",
        "Advanced analytics",
      ],
    },
    {
      ...SUBSCRIPTION_PLANS.pro,
      icon: <Rocket className="w-6 h-6 text-orange-500" />,
      popular: false,
      description: "For professional teams",
      features: [
        "Unlimited generations",
        "API access",
        "White-label options",
        "Custom templates",
        "Dedicated support",
      ],
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {plans.map((plan) => (
        <Card
          key={plan.name}
          className={`relative ${
            plan.popular ? "ring-2 ring-primary scale-105" : ""
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
            <p className="text-sm text-muted-foreground">{plan.description}</p>
            <div className="mt-4">
              <span className="text-3xl font-bold">
                {formatPrice(plan.price)}
              </span>
              <span className="text-muted-foreground">/month</span>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-2">
              {plan.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            <Button
              className="w-full"
              onClick={() => onUpgrade(plan.name)}
              disabled={loading}
              variant={plan.popular ? "default" : "outline"}
            >
              {loading ? "Processing..." : `Get ${plan.displayName}`}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
