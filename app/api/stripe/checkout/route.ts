import { NextRequest, NextResponse } from "next/server";
import { getStripeServer, getSubscriptionPlans } from "@/lib/stripe";
import { subscriptionApi } from "@/lib/subscription-api";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { planName, userId } = await req.json();

    if (!planName || !userId) {
      return NextResponse.json(
        { error: "Plan name and user ID are required" },
        { status: 400 }
      );
    }

    // Validate plan
    const SUBSCRIPTION_PLANS = getSubscriptionPlans();
    const plan = SUBSCRIPTION_PLANS[planName as keyof typeof SUBSCRIPTION_PLANS];
    if (!plan) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    // Free plan doesn't need checkout
    if (planName === "free") {
      return NextResponse.json(
        { error: "Free plan does not require checkout" },
        { status: 400 }
      );
    }

    // Get or create Stripe customer
    let customerId: string;

    // Check if user already has a Stripe customer ID
    const existingSubscription = await subscriptionApi.getCurrentSubscription(
      userId
    );

    if (existingSubscription?.stripe_customer_id) {
      customerId = existingSubscription.stripe_customer_id;
    } else {
      // Get user email from Supabase
      const { data: userData, error: userError } =
        await supabase.auth.admin.getUserById(userId);

      if (userError || !userData.user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      // Create Stripe customer
      const stripe = getStripeServer();
      const customer = await stripe.customers.create({
        email: userData.user.email,
        metadata: {
          supabase_user_id: userId,
        },
      });

      customerId = customer.id;
    }

    // Create Stripe checkout session
    const stripe = getStripeServer();
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price: plan.priceId!,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${req.nextUrl.origin}/app/settings?success=subscription_created`,
      cancel_url: `${req.nextUrl.origin}/app/settings?canceled=true`,
      metadata: {
        user_id: userId,
        plan_name: planName,
      },
      subscription_data: {
        metadata: {
          user_id: userId,
          plan_name: planName,
        },
      },
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
