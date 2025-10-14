import { subscriptionApi } from "./subscription-api";

// Admin user management utilities

/**
 * List of admin/special users who get free Pro access
 * Add your email or user ID here
 */
const ADMIN_USERS = [
  // Add your email or user ID here
  // 'your-email@example.com',
  // 'your-supabase-user-id',
];

/**
 * Check if a user is an admin/special user
 */
export function isAdminUser(userIdOrEmail: string): boolean {
  return ADMIN_USERS.includes(userIdOrEmail);
}

/**
 * Grant Pro access to a specific user
 */
export async function grantProAccess(userId: string): Promise<boolean> {
  try {
    const proPlan = await subscriptionApi.getPlanByName("pro");
    if (!proPlan) {
      console.error("Pro plan not found");
      return false;
    }

    const result = await subscriptionApi.upsertSubscription({
      user_id: userId,
      plan_id: proPlan.id,
      status: "active",
      stripe_customer_id: null, // No Stripe customer for admin users
      stripe_subscription_id: null, // No Stripe subscription for admin users
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(
        Date.now() + 365 * 24 * 60 * 60 * 1000
      ).toISOString(), // 1 year from now
      cancel_at_period_end: false,
    });

    return result !== null;
  } catch (error) {
    console.error("Error granting Pro access:", error);
    return false;
  }
}

/**
 * Setup admin users with Pro access
 * Call this function to automatically grant Pro access to admin users
 */
export async function setupAdminUsers(): Promise<void> {
  // This would typically be called from an admin API route or migration
  console.log("Setting up admin users...");

  // You can add logic here to automatically detect and upgrade admin users
  // For now, this is a placeholder for manual admin management
}

/**
 * Check if a user should have unlimited access regardless of their subscription
 */
export function hasUnlimitedAccess(userIdOrEmail: string): boolean {
  return isAdminUser(userIdOrEmail);
}

/**
 * Override usage limits for admin users
 */
export async function checkUsageWithAdminOverride(
  userId: string,
  userEmail: string,
  resourceType: string
): Promise<boolean> {
  // Check if user is admin first
  if (isAdminUser(userId) || isAdminUser(userEmail)) {
    return true; // Unlimited access for admins
  }

  // Regular usage check for non-admin users
  return await subscriptionApi.canUseResource(userId, resourceType);
}

