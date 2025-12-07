import Stripe from 'stripe';

/*
 * WARNING: This script will permanently delete all Stripe products whose name begins with "RulesBuddy".
 * Use with caution. It also deletes associated prices.
 *
 * Usage:
 *   npx ts-node scripts/deleteStripeProducts.ts
 */

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
  throw new Error('STRIPE_SECRET_KEY environment variable is required');
}

const stripe = new Stripe(stripeSecretKey, { apiVersion: '2022-11-15' });

async function main() {
  const products = await stripe.products.list({ limit: 100 });
  for (const product of products.data) {
    if (product.name && product.name.startsWith('RulesBuddy')) {
      console.log(`Deleting product ${product.name} (${product.id})`);
      // Delete prices associated with product
      const prices = await stripe.prices.list({ product: product.id, limit: 100 });
      for (const price of prices.data) {
        console.log(` - Deleting price ${price.id}`);
        await stripe.prices.update(price.id, { active: false });
      }
      await stripe.products.update(product.id, { active: false });
    }
  }
  console.log('Completed deletion.');
}

main().catch((err) => {
  console.error(err);
});