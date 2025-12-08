import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { individualPrices, groupSeatPrices } from "@/config/billing";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) throw new Error("Missing STRIPE_SECRET_KEY");

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2025-01-27",
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      mode,            // "individual" | "group"
      tier,            // "BRONZE" | "SILVER" | "GOLD"
      billingPeriod,   // "monthly" | "annual"
      seatCount,       // group only
      userId
    } = body;

    if (!mode || !tier || !billingPeriod) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    let priceId = "";

    //
    // INDIVIDUAL PLANS
    //
    if (mode === "individual") {
      if (billingPeriod === "monthly") {
        const monthlyMap: Record<string, string> = {
          BRONZE: individualPrices.bronzeMonthly,
          SILVER: individualPrices.silverMonthly,
          GOLD: individualPrices.goldMonthly,
        };
        priceId = monthlyMap[tier];
      } else {
        const annualMap: Record<string, string> = {
          BRONZE: individualPrices.bronzeAnnual,
          SILVER: individualPrices.silverAnnual,
          GOLD: individualPrices.goldAnnual,
        };
        priceId = annualMap[tier];
      }
    }

    //
    // GROUP SEAT PLANS
    //
    if (mode === "group") {
      if (!seatCount || seatCount < 3) {
        return NextResponse.json(
          { error: "Group plans require minimum of 3 seats" },
          { status: 400 }
        );
      }

      const seatMap: Record<string, string> = {
        BRONZE: groupSeatPrices.bronzeSeatAnnual,
        SILVER: groupSeatPrices.silverSeatAnnual,
        GOLD: groupSeatPrices.goldSeatAnnual,
      };

      priceId = seatMap[tier];
    }

    if (!priceId) {
      return NextResponse.json(
        { error: "Unable to determine price ID" },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: body.email || undefined,
      metadata: {
        userId,
        mode,
        tier,
        billingPeriod,
        seatCount: seatCount ?? "",
      },
      line_items: [
        {
          price: priceId,
          quantity: mode === "group" ? seatCount : 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_BASE_URL}/subscription/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_BASE_URL}/subscription/cancel`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("CREATE CHECKOUT SESSION ERROR", err);
    return NextResponse.json(
      { error: err.message || "Unknown error" },
      { status: 500 }
    );
  }
}
