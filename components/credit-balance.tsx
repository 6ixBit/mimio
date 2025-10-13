"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Coins, TrendingDown, AlertCircle } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

interface CreditBalance {
  credits_remaining: number;
  credits_allocated: number;
  plan_name: string;
}

export function CreditBalance({ compact = false }: { compact?: boolean }) {
  const { user } = useAuth();
  const [balance, setBalance] = useState<CreditBalance | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchBalance = async () => {
      try {
        const response = await fetch(`/api/credits/balance`);
        if (response.ok) {
          const data = await response.json();
          setBalance(data);
        }
      } catch (error) {
        console.error("Error fetching credit balance:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBalance();
  }, [user]);

  if (loading) {
    return null;
  }

  // Show "No subscription" for users without active plans
  if (!balance) {
    if (compact) {
      return (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 border border-border">
          <Coins className="w-4 h-4 text-muted-foreground" />
          <div className="flex items-center gap-1">
            <span className="text-sm font-medium text-muted-foreground">
              No subscription
            </span>
          </div>
        </div>
      );
    }
    return null;
  }

  // Show free plan info
  if (balance.credits_allocated === 0) {
    if (compact) {
      return (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 border border-border">
          <Coins className="w-4 h-4 text-muted-foreground" />
          <div className="flex items-center gap-1">
            <span className="text-sm font-medium text-muted-foreground">
              Free Plan
            </span>
          </div>
        </div>
      );
    }
    return null;
  }

  const usagePercentage =
    balance.credits_allocated > 0
      ? ((balance.credits_allocated - balance.credits_remaining) /
          balance.credits_allocated) *
        100
      : 0;

  const isLow = balance.credits_remaining < balance.credits_allocated * 0.2;
  const isCritical =
    balance.credits_remaining < balance.credits_allocated * 0.1;

  if (compact) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 border border-border">
        <Coins
          className={`w-4 h-4 ${
            isCritical
              ? "text-red-500"
              : isLow
              ? "text-orange-500"
              : "text-primary"
          }`}
        />
        <div className="flex items-center gap-1">
          <span className="text-sm font-medium">
            {balance.credits_remaining.toLocaleString()}
          </span>
          <span className="text-xs text-muted-foreground">credits</span>
        </div>
        {isLow && (
          <AlertCircle
            className={`w-3 h-3 ${
              isCritical ? "text-red-500" : "text-orange-500"
            }`}
          />
        )}
      </div>
    );
  }

  return (
    <Card className="p-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Credits</h3>
          </div>
          <Badge
            variant={
              isCritical ? "destructive" : isLow ? "secondary" : "outline"
            }
          >
            {balance.plan_name}
          </Badge>
        </div>

        <div className="space-y-1">
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold">
              {balance.credits_remaining.toLocaleString()}
            </span>
            <span className="text-sm text-muted-foreground">
              / {balance.credits_allocated.toLocaleString()}
            </span>
          </div>

          <Progress value={100 - usagePercentage} className="h-2" />

          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <TrendingDown className="w-3 h-3" />
            <span>{Math.round(usagePercentage)}% used this month</span>
          </div>
        </div>

        {isLow && (
          <div
            className={`flex items-start gap-2 p-2 rounded-lg ${
              isCritical
                ? "bg-red-50 border border-red-200"
                : "bg-orange-50 border border-orange-200"
            }`}
          >
            <AlertCircle
              className={`w-4 h-4 mt-0.5 ${
                isCritical ? "text-red-500" : "text-orange-500"
              }`}
            />
            <div className="flex-1">
              <p
                className={`text-sm font-medium ${
                  isCritical ? "text-red-700" : "text-orange-700"
                }`}
              >
                {isCritical ? "Critical: Low credits!" : "Warning: Running low"}
              </p>
              <p
                className={`text-xs ${
                  isCritical ? "text-red-600" : "text-orange-600"
                }`}
              >
                {isCritical
                  ? "Consider upgrading your plan to continue generating videos"
                  : "You may want to upgrade soon to avoid interruptions"}
              </p>
            </div>
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          1 credit = 1 second of video (Sora-2 720p)
        </div>
      </div>
    </Card>
  );
}
