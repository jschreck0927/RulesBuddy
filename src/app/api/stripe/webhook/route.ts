import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY!;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2023-10-16",
});

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    console.error("Missing signature");
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: any) {
    console.error("Webhook signature error:", err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  console.log("➡️ Stripe event received:", event.type);

  // Handle events
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;

      console.log("Checkout session completed:", session.id);

      // You can store initial metadata here if needed
      break;
    }

    case "invoice.paid": {
      const invoice = event.data.object as Stripe.Invoice;
      const subscriptionId = invoice.subscription;

      console.log("Invoice paid:", subscriptionId);

      if (!subscriptionId) break;

      // Fetch subscription so we can read metadata
      const subscription = await stripe.subscriptions.retrieve(
        subscriptionId as string
      );

      const metadata = subscription.metadata || {};

      const userId = metadata.user_id || null;
      const groupId = metadata.group_id || null;
      const tier = metadata.tier || null;

      console.log("Subscription metadata:", metadata);

      if (userId) {
        await supabaseAdmin
          .from("profiles")
          .update({
            subscription_status: "active",
            subscription_tier: tier,
            subscription_id: subscriptionId,
          })
          .eq("id", userId);

        console.log("Updated user subscription in Supabase");
      }

      if (groupId) {
        await supabaseAdmin
          .from("group_subscriptions")
          .update({
            subscription_id: subscriptionId,
            status: "active",
          })
          .eq("id", groupId);

        console.log("Updated group subscription in Supabase");
      }

      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const metadata = subscription.metadata || {};

      const userId = metadata.user_id || null;
      const groupId = metadata.group_id || null;

      console.log("Subscription canceled:", subscription.id, metadata);

      if (userId) {
        await supabaseAdmin
          .from("profiles")
          .update({
            subscription_status: "canceled",
          })
          .eq("id", userId);
      }

      if (groupId) {
        await supabaseAdmin
          .from("group_subscriptions")
          .update({
            status: "canceled",
          })
          .eq("id", groupId);
      }

      break;
    }

    default:
      console.log(`Unhandled Stripe event: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
