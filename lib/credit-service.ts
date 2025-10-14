import { supabaseAdmin } from "./supabase-admin";

export interface CreditBalance {
  credits_remaining: number;
  credits_allocated: number;
  credits_reset_date: string | null;
  plan_name: string;
}

export interface CreditTransaction {
  id: string;
  user_id: string;
  amount: number;
  balance_after: number;
  transaction_type: "allocation" | "usage" | "refund" | "bonus" | "reset";
  description: string | null;
  video_id: string | null;
  metadata: Record<string, any> | null;
  created_at: string;
}

export interface CreditCost {
  seconds: number;
  credits: number;
}

/**
 * Calculate credit cost based on video duration
 * Sora-2 720p: 1 credit per second
 */
export function calculateCreditCost(durationSeconds: number): number {
  return durationSeconds; // 1 credit per second
}

/**
 * Get credit cost breakdown for display
 */
export function getCreditCostBreakdown(durationSeconds: number): CreditCost {
  return {
    seconds: durationSeconds,
    credits: calculateCreditCost(durationSeconds),
  };
}

/**
 * Get user's current credit balance
 */
export async function getUserCredits(
  userId: string
): Promise<CreditBalance | null> {
  const { data, error } = await supabaseAdmin.rpc("get_user_credits", {
    p_user_id: userId,
  });

  if (error) {
    console.error("Error fetching user credits:", error);
    return null;
  }

  return data && data.length > 0 ? data[0] : null;
}

/**
 * Check if user has enough credits
 */
export async function hasEnoughCredits(
  userId: string,
  requiredCredits: number
): Promise<{ hasEnough: boolean; current: number; required: number }> {
  const balance = await getUserCredits(userId);

  if (!balance) {
    return { hasEnough: false, current: 0, required: requiredCredits };
  }

  return {
    hasEnough: balance.credits_remaining >= requiredCredits,
    current: balance.credits_remaining,
    required: requiredCredits,
  };
}

/**
 * Deduct credits from user account
 */
export async function deductCredits(
  userId: string,
  amount: number,
  description: string,
  videoId?: string,
  metadata?: Record<string, any>
): Promise<{ success: boolean; newBalance: number; error?: string }> {
  try {
    // Get current balance
    const balance = await getUserCredits(userId);

    if (!balance) {
      return {
        success: false,
        newBalance: 0,
        error: "No active subscription found",
      };
    }

    if (balance.credits_remaining < amount) {
      return {
        success: false,
        newBalance: balance.credits_remaining,
        error: `Insufficient credits. You have ${balance.credits_remaining} credits but need ${amount}.`,
      };
    }

    const newBalance = balance.credits_remaining - amount;

    // Update credits_remaining
    const { error: updateError } = await supabaseAdmin
      .from("user_subscriptions")
      .update({ credits_remaining: newBalance })
      .eq("user_id", userId)
      .eq("status", "active");

    if (updateError) {
      console.error("Error updating credits:", updateError);
      return {
        success: false,
        newBalance: balance.credits_remaining,
        error: "Failed to deduct credits",
      };
    }

    // Record transaction
    const { error: transactionError } = await supabaseAdmin
      .from("credit_transactions")
      .insert({
        user_id: userId,
        amount: -amount, // negative for deduction
        balance_after: newBalance,
        transaction_type: "usage",
        description,
        video_id: videoId,
        metadata,
      });

    if (transactionError) {
      console.error("Error recording transaction:", transactionError);
    }

    return { success: true, newBalance };
  } catch (error) {
    console.error("Error in deductCredits:", error);
    return {
      success: false,
      newBalance: 0,
      error: "An unexpected error occurred",
    };
  }
}

/**
 * Add credits to user account (for refunds or bonuses)
 */
export async function addCredits(
  userId: string,
  amount: number,
  transactionType: "refund" | "bonus" | "allocation",
  description: string,
  metadata?: Record<string, any>
): Promise<{ success: boolean; newBalance: number; error?: string }> {
  try {
    // Get current balance
    const balance = await getUserCredits(userId);

    if (!balance) {
      return {
        success: false,
        newBalance: 0,
        error: "No active subscription found",
      };
    }

    const newBalance = balance.credits_remaining + amount;

    // Update credits_remaining
    const { error: updateError } = await supabaseAdmin
      .from("user_subscriptions")
      .update({ credits_remaining: newBalance })
      .eq("user_id", userId)
      .eq("status", "active");

    if (updateError) {
      console.error("Error updating credits:", updateError);
      return {
        success: false,
        newBalance: balance.credits_remaining,
        error: "Failed to add credits",
      };
    }

    // Record transaction
    const { error: transactionError } = await supabaseAdmin
      .from("credit_transactions")
      .insert({
        user_id: userId,
        amount, // positive for addition
        balance_after: newBalance,
        transaction_type: transactionType,
        description,
        metadata,
      });

    if (transactionError) {
      console.error("Error recording transaction:", transactionError);
    }

    return { success: true, newBalance };
  } catch (error) {
    console.error("Error in addCredits:", error);
    return {
      success: false,
      newBalance: 0,
      error: "An unexpected error occurred",
    };
  }
}

/**
 * Get user's credit transaction history
 */
export async function getCreditTransactions(
  userId: string,
  limit: number = 50
): Promise<CreditTransaction[]> {
  const { data, error } = await supabaseAdmin
    .from("credit_transactions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching transactions:", error);
    return [];
  }

  return data || [];
}

/**
 * Reset credits on subscription renewal
 */
export async function resetCreditsForRenewal(
  userId: string,
  planName: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get plan details
    const { data: plan, error: planError } = await supabaseAdmin
      .from("subscription_plans")
      .select("features")
      .eq("plan_name", planName)
      .single();

    if (planError || !plan) {
      return { success: false, error: "Plan not found" };
    }

    const creditsAllocated = parseInt(plan.features.credits || "0");

    // Calculate next reset date (30 days from now)
    const nextResetDate = new Date();
    nextResetDate.setDate(nextResetDate.getDate() + 30);

    // Update subscription with reset credits
    const { error: updateError } = await supabaseAdmin
      .from("user_subscriptions")
      .update({
        credits_remaining: creditsAllocated,
        credits_allocated: creditsAllocated,
        credits_reset_date: nextResetDate.toISOString(),
      })
      .eq("user_id", userId)
      .eq("status", "active");

    if (updateError) {
      console.error("Error resetting credits:", updateError);
      return { success: false, error: "Failed to reset credits" };
    }

    // Record transaction
    await supabaseAdmin.from("credit_transactions").insert({
      user_id: userId,
      amount: creditsAllocated,
      balance_after: creditsAllocated,
      transaction_type: "reset",
      description: `Monthly credit reset for ${planName} plan`,
      metadata: { plan_name: planName },
    });

    return { success: true };
  } catch (error) {
    console.error("Error in resetCreditsForRenewal:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Format credits for display
 */
export function formatCredits(credits: number): string {
  return credits.toLocaleString();
}

/**
 * Get credit usage summary
 */
export async function getCreditUsageSummary(userId: string): Promise<{
  total_allocated: number;
  total_used: number;
  total_remaining: number;
  usage_percentage: number;
}> {
  const balance = await getUserCredits(userId);

  if (!balance) {
    return {
      total_allocated: 0,
      total_used: 0,
      total_remaining: 0,
      usage_percentage: 0,
    };
  }

  const totalUsed = balance.credits_allocated - balance.credits_remaining;
  const usagePercentage =
    balance.credits_allocated > 0
      ? (totalUsed / balance.credits_allocated) * 100
      : 0;

  return {
    total_allocated: balance.credits_allocated,
    total_used: totalUsed,
    total_remaining: balance.credits_remaining,
    usage_percentage: Math.round(usagePercentage),
  };
}

