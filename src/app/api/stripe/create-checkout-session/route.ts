import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { individualPrices, groupSeatPrices } from '@/config/billing';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

if (!stripeSecretKey) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}

const stripe = new Stripe(stripeSecretKey, {
apiVersion: '2022-11-15',
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    mode,
    tier,
    billingPeriod,
    seatCount = 1,
    successUrl,
    cancelUrl,
    userId,
    groupId,
  } = body;
  try {
    let priceId: string | undefined;
    let quantity = 1;
    if (mode === 'individual') {
      if (billingPeriod === 'monthly') {
        priceId = {
          BRONZE: individualPrices.bronzeMonthly,
          SILVER: individualPrices.silverMonthly,
          GOLD: individualPrices.goldMonthly,
        }[tier as keyof typeof individualPrices];
      } else {
        priceId = {
          BRONZE: individualPrices.bronzeAnnual,
          SILVER: individualPrices.silverAnnual,
          GOLD: individualPrices.goldAnnual,
        }[tier as keyof typeof individualPrices];
      }
      quantity = 1;
    } else if (mode === 'group') {
      priceId = {
        BRONZE: groupSeatPrices.bronzeAnnual,
        SILVER: groupSeatPrices.silverAnnual,
        GOLD: groupSeatPrices.goldAnnual,
      }[tier as keyof typeof groupSeatPrices];
      quantity = seatCount;
    }
    if (!priceId) {
      throw new Error('Invalid price configuration');
    }
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity,
        },
      ],
      metadata: {
        mode,
        tier,
        user_id: userId,
        group_id: groupId ?? '',
        seat_count: quantity,
      },
      success_url: successUrl || `${process.env.NEXT_PUBLIC_APP_BASE_URL}/account?session=success`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_APP_BASE_URL}/account?session=cancel`,
    });
    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: { message: err.message } }, { status: 500 });
  }
}