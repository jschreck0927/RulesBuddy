import Stripe from 'stripe';

/*
 * List all Stripe products beginning with "RulesBuddy".
 *
 * Usage:
 *   npx ts-node scripts/listStripeProducts.ts
 */

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
  throw new Error('STRIPE_SECRET_KEY environment variable is required');
}
const stripe = new Stripe(stripeSecretKey, { apiVersion: '2022-11-15' });

async function main() {
  const products = await stripe.products.list({ limit: 100 });
  const filtered = products.data.filter((p) => p.name?.startsWith('RulesBuddy'));
  console.log(filtered.map((p) => ({ id: p.id, name: p.name, active: p.active })));
}

main().catch((err) => console.error(err));