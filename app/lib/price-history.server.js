/* global BigInt */
import prisma from "../db.server";
import { toMinorUnits } from "./money.server";

// Pull the trailing numeric id out of a GID ("gid://shopify/Product/123" -> 123n)
// or accept a plain numeric id directly.
function numericId(gidOrId) {
  if (gidOrId == null) return null;
  const match = String(gidOrId).match(/(\d+)$/);
  return match ? BigInt(match[1]) : null;
}

export async function getOrCreateStore(shopDomain) {
  return prisma.store.upsert({
    where: { shopDomain },
    update: {},
    create: { shopDomain },
  });
}

// The single source of truth for writing history: upsert the variant snapshot
// and, if it's new or its price actually changed, append one price_changes row.
// Returns true if a history row was written.
async function upsertVariantAndLog(store, productId, v) {
  const where = {
    storeId_shopifyVariantId: {
      storeId: store.id,
      shopifyVariantId: v.shopifyVariantId,
    },
  };

  const existing = await prisma.variant.findUnique({ where });
  const isNew = !existing;
  const priceChanged =
    !isNew &&
    (existing.currentPrice !== v.price ||
      existing.currentCompareAtPrice !== v.compareAtPrice);

  const data = {
    productId,
    gid: v.gid,
    title: v.title,
    sku: v.sku,
    barcode: v.barcode,
    position: v.position,
    currentPrice: v.price,
    currentCompareAtPrice: v.compareAtPrice,
    shopifyUpdatedAt: v.shopifyUpdatedAt,
  };

  const variant = await prisma.variant.upsert({
    where,
    update: data,
    create: { storeId: store.id, shopifyVariantId: v.shopifyVariantId, ...data },
  });

  if (isNew || priceChanged) {
    await prisma.priceChange.create({
      data: {
        storeId: store.id,
        variantId: variant.id,
        price: v.price,
        compareAtPrice: v.compareAtPrice,
        source: isNew ? "initial" : "webhook",
      },
    });
    return true;
  }
  return false;
}

// Called by the products/update webhook. `payload` is Shopify's REST-shaped
// product JSON (snake_case, money as strings).
export async function recordProductUpdate(shopDomain, payload) {
  const store = await getOrCreateStore(shopDomain);
  const exp = store.currencyExponent;

  const product = await prisma.product.upsert({
    where: {
      storeId_shopifyProductId: {
        storeId: store.id,
        shopifyProductId: numericId(payload.id),
      },
    },
    update: {
      gid: payload.admin_graphql_api_id,
      title: payload.title,
      handle: payload.handle,
      status: payload.status,
    },
    create: {
      storeId: store.id,
      shopifyProductId: numericId(payload.id),
      gid: payload.admin_graphql_api_id,
      title: payload.title,
      handle: payload.handle,
      status: payload.status,
    },
  });

  let logged = 0;
  for (const v of payload.variants ?? []) {
    const wrote = await upsertVariantAndLog(store, product.id, {
      shopifyVariantId: numericId(v.id),
      gid: v.admin_graphql_api_id,
      title: v.title,
      sku: v.sku,
      barcode: v.barcode,
      position: v.position ?? null,
      price: toMinorUnits(v.price, exp),
      compareAtPrice: toMinorUnits(v.compare_at_price, exp),
      shopifyUpdatedAt: v.updated_at ? new Date(v.updated_at) : null,
    });
    if (wrote) logged++;
  }

  return { product: product.title, variants: (payload.variants ?? []).length, logged };
}

const SYNC_QUERY = `#graphql
  query SyncProducts($cursor: String) {
    products(first: 50, after: $cursor) {
      pageInfo { hasNextPage endCursor }
      nodes {
        id
        title
        handle
        status
        variants(first: 100) {
          nodes { id title sku barcode price compareAtPrice updatedAt }
        }
      }
    }
  }`;

// One-time / on-demand backfill: pull every product + variant via the Admin API
// and seed the snapshot. New variants get an "initial" history row so you have a
// starting point; later edits log deltas. `admin` is the authenticated client.
export async function syncAllProducts(admin, shopDomain) {
  const store = await getOrCreateStore(shopDomain);
  const exp = store.currencyExponent;

  let cursor = null;
  let hasNext = true;
  let products = 0;
  let logged = 0;
  const MAX_PAGES = 50; // safety cap (~2,500 products) for this simple version

  for (let page = 0; hasNext && page < MAX_PAGES; page++) {
    const res = await admin.graphql(SYNC_QUERY, { variables: { cursor } });
    const conn = (await res.json()).data.products;

    for (const p of conn.nodes) {
      products++;
      const product = await prisma.product.upsert({
        where: {
          storeId_shopifyProductId: {
            storeId: store.id,
            shopifyProductId: numericId(p.id),
          },
        },
        update: { gid: p.id, title: p.title, handle: p.handle, status: p.status },
        create: {
          storeId: store.id,
          shopifyProductId: numericId(p.id),
          gid: p.id,
          title: p.title,
          handle: p.handle,
          status: p.status,
        },
      });

      for (const v of p.variants.nodes) {
        const wrote = await upsertVariantAndLog(store, product.id, {
          shopifyVariantId: numericId(v.id),
          gid: v.id,
          title: v.title,
          sku: v.sku,
          barcode: v.barcode,
          position: null,
          price: toMinorUnits(v.price, exp),
          compareAtPrice: toMinorUnits(v.compareAtPrice, exp),
          shopifyUpdatedAt: v.updatedAt ? new Date(v.updatedAt) : null,
        });
        if (wrote) logged++;
      }
    }

    hasNext = conn.pageInfo.hasNextPage;
    cursor = conn.pageInfo.endCursor;
  }

  return { products, logged };
}

// Recent price-change log for a shop, with variant info, for the UI.
export async function getRecentPriceChanges(shopDomain, take = 100) {
  const store = await prisma.store.findUnique({ where: { shopDomain } });
  if (!store) return { store: null, changes: [] };

  const changes = await prisma.priceChange.findMany({
    where: { storeId: store.id },
    orderBy: { changedAt: "desc" },
    take,
    include: { variant: true },
  });

  return { store, changes };
}
