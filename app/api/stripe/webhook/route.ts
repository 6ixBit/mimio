import { NextRequest, NextResponse } from "next/server";
import { getStripeServer, getPlanByPriceId } from "@/lib/stripe";
import { subscriptionApi } from "@/lib/subscription-api";
import { addCredits, resetCreditsForRenewal } from "@/lib/credit-service";
import Stripe from "stripe";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature")!;

    let event: Stripe.Event;

    try {
      const stripe = getStripeServer();
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    console.log("Received Stripe webhook:", event.type);

    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionChange(subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCancellation(subscription);
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentSucceeded(invoice);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  const userId = subscription.metadata.user_id;
  const planName = subscription.metadata.plan_name;

  if (!userId) {
    console.error("No user_id in subscription metadata");
    return;
  }

  // Get the plan from our database
  const plan = await subscriptionApi.getPlanByName(planName);
  if (!plan) {
    console.error(`Plan not found: ${planName}`);
    return;
  }

  // Update or create subscription record
  await subscriptionApi.upsertSubscription({
    user_id: userId,
    plan_id: plan.id,
    stripe_customer_id: subscription.customer as string,
    stripe_subscription_id: subscription.id,
    status: subscription.status as any,
    current_period_start: new Date(
      subscription.current_period_start * 1000
    ).toISOString(),
    current_period_end: new Date(
      subscription.current_period_end * 1000
    ).toISOString(),
    cancel_at_period_end: subscription.cancel_at_period_end,
  });

  // Allocate credits for new/updated subscription
  if (subscription.status === "active") {
    const creditsToAllocate = parseInt(plan.features.credits || "0");

    if (creditsToAllocate > 0) {
      const result = await resetCreditsForRenewal(userId, planName);

      if (result.success) {
        console.log(
          `Allocated ${creditsToAllocate} credits to user ${userId} for ${planName} plan`
        );
      } else {
        console.error(
          `Failed to allocate credits to user ${userId}:`,
          result.error
        );
      }
    }
  }

  console.log(
    `Subscription updated for user ${userId}: ${subscription.status}`
  );
}

async function handleSubscriptionCancellation(
  subscription: Stripe.Subscription
) {
  const userId = subscription.metadata.user_id;

  if (!userId) {
    console.error("No user_id in subscription metadata");
    return;
  }

  // Get free plan
  const freePlan = await subscriptionApi.getPlanByName("free");
  if (!freePlan) {
    console.error("Free plan not found");
    return;
  }

  // Downgrade to free plan
  await subscriptionApi.upsertSubscription({
    user_id: userId,
    plan_id: freePlan.id,
    stripe_customer_id: subscription.customer as string,
    stripe_subscription_id: null,
    status: "canceled",
    current_period_start: null,
    current_period_end: null,
    cancel_at_period_end: false,
  });

  // Reset credits to 0 for free plan
  const result = await resetCreditsForRenewal(userId, "free");
  if (result.success) {
    console.log(`Credits reset to 0 for canceled user ${userId}`);
  }

  console.log(`Subscription canceled for user ${userId}, downgraded to free`);
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  if (!invoice.subscription) return;

  const stripe = getStripeServer();
  const subscription = await stripe.subscriptions.retrieve(
    invoice.subscription as string
  );
  const userId = subscription.metadata.user_id;

  if (!userId) {
    console.error("No user_id in subscription metadata");
    return;
  }

  // Record the payment
  await subscriptionApi.recordPayment({
    user_id: userId,
    stripe_payment_intent_id: invoice.payment_intent as string,
    stripe_invoice_id: invoice.id,
    amount: invoice.amount_paid / 100, // Convert from cents
    currency: invoice.currency,
    status: "succeeded",
    description: `Payment for ${subscription.metadata.plan_name} plan`,
  });

  // Reset credits on successful payment (monthly renewal)
  const planName = subscription.metadata.plan_name;
  if (planName && planName !== "free") {
    const result = await resetCreditsForRenewal(userId, planName);

    if (result.success) {
      console.log(
        `Credits reset for user ${userId} on ${planName} plan renewal`
      );
    } else {
      console.error(
        `Failed to reset credits for user ${userId}:`,
        result.error
      );
    }
  }

  console.log(
    `Payment succeeded for user ${userId}: $${invoice.amount_paid / 100}`
  );
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  if (!invoice.subscription) return;

  const stripe = getStripeServer();
  const subscription = await stripe.subscriptions.retrieve(
    invoice.subscription as string
  );
  const userId = subscription.metadata.user_id;

  if (!userId) {
    console.error("No user_id in subscription metadata");
    return;
  }

  // Record the failed payment
  await subscriptionApi.recordPayment({
    user_id: userId,
    stripe_payment_intent_id: invoice.payment_intent as string,
    stripe_invoice_id: invoice.id,
    amount: invoice.amount_due / 100, // Convert from cents
    currency: invoice.currency,
    status: "failed",
    description: `Failed payment for ${subscription.metadata.plan_name} plan`,
  });

  console.log(
    `Payment failed for user ${userId}: $${invoice.amount_due / 100}`
  );
}
