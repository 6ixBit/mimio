import { NextRequest, NextResponse } from "next/server";
import { getStripeServer } from "@/lib/stripe";
import { subscriptionApi } from "@/lib/subscription-api";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Get user's current subscription to find their Stripe customer ID
    const subscription = await subscriptionApi.getCurrentSubscription(userId);

    if (!subscription?.stripe_customer_id) {
      return NextResponse.json(
        { error: "No active subscription found" },
        { status: 404 }
      );
    }

    // Create customer portal session
    const stripe = getStripeServer();
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: `${req.nextUrl.origin}/app/settings`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    console.error("Customer portal error:", error);
    return NextResponse.json(
      { error: "Failed to create portal session" },
      { status: 500 }
    );
  }
}
