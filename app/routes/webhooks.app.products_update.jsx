import { authenticate } from "../shopify.server";
import { recordProductUpdate } from "../lib/price-history.server";

// Fires whenever a product (and its variants) changes in Shopify — from this
// app, the admin, another app, or a bulk edit. authenticate.webhook verifies
// the HMAC signature for us; if it fails it throws a 401 before we get here.
export const action = async ({ request }) => {
  const { shop, topic, payload } = await authenticate.webhook(request);

  try {
    const summary = await recordProductUpdate(shop, payload);
    console.log(
      `📦 [${topic}] ${shop} → "${summary.product}": ${summary.variants} variant(s), ${summary.logged} price change(s) logged`,
    );
  } catch (err) {
    // Log and still return 200 in dev so Shopify doesn't retry in a loop while
    // we iterate. In production you'd return non-200 to get a retry.
    console.error(`❌ [${topic}] ${shop} failed:`, err);
  }

  return new Response();
};
