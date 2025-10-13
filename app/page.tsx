"use client";

import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Sparkles,
  Zap,
  TrendingUp,
  Crown,
  Rocket,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getSubscriptionPlans, formatPrice, getStripe } from "@/lib/stripe";

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [pricingLoading, setPricingLoading] = useState(false);

  const handleGetStarted = async (planName?: string) => {
    if (planName && planName !== "free") {
      // Handle paid plan signup with Stripe
      setPricingLoading(true);
      try {
        // Redirect to signup first, then to checkout
        router.push(`/signup?plan=${planName}`);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setPricingLoading(false);
      }
    } else {
      // Handle free signup
      router.push("/signup");
    }
  };

  // Redirect logged-in users to the app
  useEffect(() => {
    if (!loading && user) {
      router.push("/app");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <img src="/mimio_logo.png" alt="Mimio" className="w-8 h-8" />
              <span className="text-xl font-bold text-foreground">mimio</span>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="/login"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Login
              </Link>
              <Link href="/signup">
                <Button size="sm">Get Started</Button>
              </Link>
            </nav>
            <div className="md:hidden">
              <Link href="/signup">
                <Button size="sm">Sign Up</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 lg:pt-32 lg:pb-32">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
            <Zap className="w-4 h-4" />
            For Vibe Marketers
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground tracking-tight">
            Recreate Viral Formats
            <br />
            <span className="text-primary">With One Click</span>
          </h1>

          {/* Subheading */}
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Analyze viral videos, extract their format, and automatically post
            to multiple TikTok accounts. Perfect for marketers who want to ride
            the wave of trending content.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button
              size="lg"
              className="w-full sm:w-auto gap-2 text-base"
              onClick={() => handleGetStarted()}
            >
              Start Creating Free
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Link href="/login">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto text-base"
              >
                Sign In
              </Button>
            </Link>
          </div>

          {/* Social Proof */}
          <p className="text-sm text-muted-foreground pt-4">
            No credit card required • Start in seconds
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-card border border-border rounded-lg p-6 space-y-3 hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">
                AI-Powered Analysis
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Upload any viral video and our AI instantly analyzes the format,
                style, and structure so you can recreate it with your own
                content.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-card border border-border rounded-lg p-6 space-y-3 hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">
                One-Click Generation
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Transform the viral format into your own branded content with a
                single click. No video editing skills required.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-card border border-border rounded-lg p-6 space-y-3 hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">
                Multi-Account Posting
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Automatically post to multiple TikTok accounts and scale your
                content distribution effortlessly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose the perfect plan for your content creation needs. Start
              free, upgrade when you're ready to scale.
            </p>
          </div>

          <PricingCards
            onGetStarted={handleGetStarted}
            loading={pricingLoading}
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-8 sm:p-12 text-center space-y-6">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
              Ready to go viral?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join marketers who are already leveraging viral formats to grow
              their reach on TikTok.
            </p>
            <Button
              size="lg"
              className="gap-2 text-base"
              onClick={() => handleGetStarted()}
            >
              Get Started Free
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-primary flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-semibold text-foreground">mimio</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link
                href="/privacy"
                className="hover:text-foreground transition-colors"
              >
                Privacy
              </Link>
              <Link
                href="/terms"
                className="hover:text-foreground transition-colors"
              >
                Terms
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function PricingCards({
  onGetStarted,
  loading,
}: {
  onGetStarted: (plan?: string) => void;
  loading: boolean;
}) {
  const SUBSCRIPTION_PLANS = getSubscriptionPlans();

  const plans = [
    {
      ...SUBSCRIPTION_PLANS.free,
      icon: <CheckCircle className="w-6 h-6 text-green-500" />,
      popular: false,
      description: "Perfect for getting started",
      features: [
        "3 video generations/month",
        "Basic templates",
        "Community support",
        "Standard processing",
      ],
      buttonText: "Start Free",
      buttonVariant: "outline" as const,
    },
    {
      ...SUBSCRIPTION_PLANS.starter,
      icon: <Zap className="w-6 h-6 text-blue-500" />,
      popular: false,
      description: "Great for small creators",
      features: [
        "25 video generations/month",
        "All templates",
        "Email support",
        "Standard processing",
      ],
      buttonText: "Get Starter",
      buttonVariant: "outline" as const,
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
      buttonText: "Get Scaler",
      buttonVariant: "default" as const,
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
      buttonText: "Get Pro",
      buttonVariant: "outline" as const,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                {plan.price === 0 ? "Free" : formatPrice(plan.price)}
              </span>
              {plan.price > 0 && (
                <span className="text-muted-foreground">/month</span>
              )}
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
              onClick={() => onGetStarted(plan.name)}
              disabled={loading}
              variant={plan.buttonVariant}
            >
              {loading ? "Processing..." : plan.buttonText}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
