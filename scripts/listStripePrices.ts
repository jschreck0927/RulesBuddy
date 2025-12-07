import Stripe from 'stripe';

/*
 * List all Stripe prices for products beginning with "RulesBuddy".
 *
 * Usage:
 *   npx ts-node scripts/listStripePrices.ts
 */

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
  throw new Error('STRIPE_SECRET_KEY environment variable is required');
}
const stripe = new Stripe(stripeSecretKey, { apiVersion: '2022-11-15' });

async function main() {
  const products = await stripe.products.list({ limit: 100 });
  const rulesbuddyProducts = products.data.filter((p) => p.name?.startsWith('RulesBuddy'));
  for (const product of rulesbuddyProducts) {
    const prices = await stripe.prices.list({ product: product.id, limit: 100 });
    console.log(`Product ${product.name} (${product.id}):`);
    for (const price of prices.data) {
      console.log({ id: price.id, unit_amount: price.unit_amount, interval: price.recurring?.interval, active: price.active });
    }
  }
}

main().catch((err) => console.error(err));