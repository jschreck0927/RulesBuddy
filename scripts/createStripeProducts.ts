import Stripe from 'stripe';

/*
 * Script to create all required Stripe products and prices for RulesBuddy.
 *
 * This script is idempotent: running it multiple times will not create duplicates.
 * It checks for existing products by name and for existing prices by unit amount and recurring interval.
 *
 * Usage:
 *   npx ts-node scripts/createStripeProducts.ts
 */

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
  throw new Error('STRIPE_SECRET_KEY environment variable is required');
}

const stripe = new Stripe(stripeSecretKey, { apiVersion: '2022-11-15' });

// Define membership tiers with pricing (amount in cents)
const individualPlans = [
  { tier: 'BRONZE', monthly: 799, annual: 7999 },
  { tier: 'SILVER', monthly: 1199, annual: 11999 },
  { tier: 'GOLD', monthly: 1699, annual: 16999 },
];

const groupSeatPlans = [
  { tier: 'BRONZE', annual: 6000 },
  { tier: 'SILVER', annual: 8900 },
  { tier: 'GOLD', annual: 11900 },
];

async function ensureProduct(name: string, description: string): Promise<Stripe.Product> {
  // Search for product by name
  const existing = await stripe.products.list({ limit: 100 });
  const found = existing.data.find((p) => p.name === name);
  if (found) return found;
  return await stripe.products.create({ name, description });
}

async function ensurePrice(productId: string, unitAmount: number, interval: 'month' | 'year', metadata: any): Promise<Stripe.Price> {
  // Look for existing price
  const prices = await stripe.prices.list({ product: productId, limit: 100, active: true });
  const found = prices.data.find((p) => {
    const matchAmount = p.unit_amount === unitAmount;
    const recurring = p.recurring;
    return matchAmount && recurring && recurring.interval === interval;
  });
  if (found) return found;
  return await stripe.prices.create({
    product: productId,
    unit_amount: unitAmount,
    currency: 'usd',
    recurring: { interval },
    metadata,
  });
}

async function main() {
  const created: Record<string, any> = {};
  // Create individual membership products and prices
  for (const plan of individualPlans) {
    const name = `RulesBuddy ${plan.tier} Membership`;
    const desc = `${plan.tier} membership for individual users`;
    const product = await ensureProduct(name, desc);
    created[`${plan.tier}_PRODUCT_ID`] = product.id;
    // Monthly price
    const monthlyPrice = await ensurePrice(product.id, plan.monthly, 'month', {
      tier: plan.tier,
      billing_period: 'monthly',
      seat: 'false',
    });
    created[`${plan.tier}_MONTHLY_PRICE_ID`] = monthlyPrice.id;
    // Annual price
    const annualPrice = await ensurePrice(product.id, plan.annual, 'year', {
      tier: plan.tier,
      billing_period: 'annual',
      seat: 'false',
    });
    created[`${plan.tier}_ANNUAL_PRICE_ID`] = annualPrice.id;
  }
  // Create group seat products and prices
  for (const plan of groupSeatPlans) {
    const name = `RulesBuddy ${plan.tier} Group Seat`;
    const desc = `${plan.tier} tier annual seat for groups`;
    const product = await ensureProduct(name, desc);
    created[`${plan.tier}_GROUP_PRODUCT_ID`] = product.id;
    const annualSeat = await ensurePrice(product.id, plan.annual, 'year', {
      tier: plan.tier,
      billing_period: 'annual',
      seat: 'true',
    });
    created[`${plan.tier}_GROUP_ANNUAL_PRICE_ID`] = annualSeat.id;
  }
  console.log(JSON.stringify(created, null, 2));
}

main().catch((err) => {
  console.error(err);
});