import { createClient } from "@supabase/supabase-js";
import { SubscriptionPlan } from "./stripe";

// Create a Supabase client with service role key for server-side operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  status: "active" | "canceled" | "past_due" | "incomplete" | "trialing";
  current_period_start?: string;
  current_period_end?: string;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
  subscription_plans?: {
    name: string;
    display_name: string;
    price_monthly: number;
    features: Record<string, any>;
    limits: Record<string, any>;
  };
}

export interface UserUsage {
  id: string;
  user_id: string;
  resource_type: string;
  count: number;
  period_start: string;
  period_end: string;
}

export const subscriptionApi = {
  // Get user's current subscription
  async getCurrentSubscription(
    userId: string
  ): Promise<UserSubscription | null> {
    const { data, error } = await supabaseAdmin
      .from("user_subscriptions")
      .select(
        `
        *,
        subscription_plans (
          name,
          display_name,
          price_monthly,
          features,
          limits
        )
      `
      )
      .eq("user_id", userId)
      .eq("status", "active")
      .single();

    if (error) {
      console.error("Error fetching subscription:", error);
      return null;
    }

    return data;
  },

  // Create or update subscription
  async upsertSubscription(
    subscription: Partial<UserSubscription>
  ): Promise<UserSubscription | null> {
    const { data, error } = await supabaseAdmin
      .from("user_subscriptions")
      .upsert(subscription, {
        onConflict: "user_id,status",
        ignoreDuplicates: false,
      })
      .select()
      .single();

    if (error) {
      console.error("Error upserting subscription:", error);
      return null;
    }

    return data;
  },

  // Get subscription plan by name
  async getPlanByName(planName: string) {
    const { data, error } = await supabaseAdmin
      .from("subscription_plans")
      .select("*")
      .eq("name", planName)
      .eq("is_active", true)
      .single();

    if (error) {
      console.error("Error fetching plan:", error);
      return null;
    }

    return data;
  },

  // Get all active plans (for pricing page)
  async getAllPlans() {
    const { data, error } = await supabaseAdmin
      .from("subscription_plans")
      .select("*")
      .eq("is_active", true)
      .order("price_monthly", { ascending: true });

    if (error) {
      console.error("Error fetching plans:", error);
      return [];
    }

    return data;
  },

  // Get user's current usage for a resource type
  async getCurrentUsage(userId: string, resourceType: string): Promise<number> {
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const { data, error } = await supabaseAdmin
      .from("user_usage")
      .select("count")
      .eq("user_id", userId)
      .eq("resource_type", resourceType)
      .gte("period_start", periodStart.toISOString())
      .lte("period_end", periodEnd.toISOString())
      .single();

    if (error) {
      // If no usage record exists, return 0
      if (error.code === "PGRST116") {
        return 0;
      }
      console.error("Error fetching usage:", error);
      return 0;
    }

    return data?.count || 0;
  },

  // Increment usage for a resource type
  async incrementUsage(
    userId: string,
    resourceType: string,
    increment: number = 1
  ): Promise<boolean> {
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Try to update existing usage record
    const { data: existingUsage } = await supabaseAdmin
      .from("user_usage")
      .select("id, count")
      .eq("user_id", userId)
      .eq("resource_type", resourceType)
      .gte("period_start", periodStart.toISOString())
      .lte("period_end", periodEnd.toISOString())
      .single();

    if (existingUsage) {
      // Update existing record
      const { error } = await supabaseAdmin
        .from("user_usage")
        .update({
          count: existingUsage.count + increment,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingUsage.id);

      if (error) {
        console.error("Error updating usage:", error);
        return false;
      }
    } else {
      // Create new record
      const { error } = await supabaseAdmin.from("user_usage").insert({
        user_id: userId,
        resource_type: resourceType,
        count: increment,
        period_start: periodStart.toISOString(),
        period_end: periodEnd.toISOString(),
      });

      if (error) {
        console.error("Error creating usage record:", error);
        return false;
      }
    }

    return true;
  },

  // Check if user can use a resource (based on their plan limits)
  async canUseResource(userId: string, resourceType: string): Promise<boolean> {
    const subscription = await this.getCurrentSubscription(userId);

    if (!subscription) {
      // No subscription, default to free plan limits
      const freePlan = await this.getPlanByName("free");
      if (!freePlan) return false;

      const limit = freePlan.limits[resourceType];
      if (limit === -1) return true; // unlimited

      const currentUsage = await this.getCurrentUsage(userId, resourceType);
      return currentUsage < limit;
    }

    const limits = subscription.subscription_plans?.limits;
    if (!limits) return false;

    const limit = limits[resourceType];
    if (limit === -1) return true; // unlimited

    const currentUsage = await this.getCurrentUsage(userId, resourceType);
    return currentUsage < limit;
  },

  // Record a payment
  async recordPayment(payment: {
    user_id: string;
    subscription_id?: string;
    stripe_payment_intent_id?: string;
    stripe_invoice_id?: string;
    amount: number;
    currency: string;
    status: string;
    description?: string;
  }) {
    const { data, error } = await supabaseAdmin
      .from("payments")
      .insert(payment)
      .select()
      .single();

    if (error) {
      console.error("Error recording payment:", error);
      return null;
    }

    return data;
  },
};
