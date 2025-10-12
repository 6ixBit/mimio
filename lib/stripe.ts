import Stripe from "stripe";
import { loadStripe } from "@stripe/stripe-js";

// Server-side Stripe instance - only create when needed
export const getStripeServer = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not defined');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2024-12-18.acacia",
  });
};

// For backward compatibility
export const stripe = typeof process !== 'undefined' && process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-12-18.acacia" })
  : null;

// Client-side Stripe instance
export const getStripe = () => {
  return loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
};

// Subscription plan configuration - function to avoid SSR issues
export const getSubscriptionPlans = () => ({
  free: {
    name: "free",
    displayName: "Free",
    price: 0,
    priceId: null,
    features: {
      videoGenerations: 3,
      templates: "basic",
      watermark: true,
      support: "community",
      analytics: "basic",
      processing: "standard",
    },
  },
  starter: {
    name: "starter",
    displayName: "Starter",
    price: 19.99,
    priceId: process.env.STRIPE_STARTER_PRICE_ID,
    features: {
      videoGenerations: 25,
      templates: "all",
      watermark: true,
      support: "email",
      analytics: "basic",
      processing: "standard",
    },
  },
  scaler: {
    name: "scaler",
    displayName: "Scaler",
    price: 44.99,
    priceId: process.env.STRIPE_SCALER_PRICE_ID,
    features: {
      videoGenerations: 100,
      templates: "all",
      watermark: false,
      support: "priority",
      analytics: "advanced",
      processing: "priority",
      soraPro: true,
    },
  },
  pro: {
    name: "pro",
    displayName: "Pro",
    price: 89.99,
    priceId: process.env.STRIPE_PRO_PRICE_ID,
    features: {
      videoGenerations: -1, // unlimited
      templates: "all",
      watermark: false,
      support: "dedicated",
      analytics: "advanced",
      processing: "priority",
      soraPro: true,
      apiAccess: true,
      whiteLabel: true,
      customTemplates: true,
    },
  },
});

// Static version for client-side usage
export const SUBSCRIPTION_PLANS = typeof window !== 'undefined' ? getSubscriptionPlans() : {} as ReturnType<typeof getSubscriptionPlans>;

export type SubscriptionPlan = keyof typeof SUBSCRIPTION_PLANS;

// Helper functions
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
};

export const getPlanByPriceId = (priceId: string): string | null => {
  const plans = getSubscriptionPlans();
  for (const [key, plan] of Object.entries(plans)) {
    if (plan.priceId === priceId) {
      return key;
    }
  }
  return null;
};
