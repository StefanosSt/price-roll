-- CreateTable
CREATE TABLE "stores" (
    "id" BIGINT NOT NULL PRIMARY KEY,
    "shopDomain" TEXT NOT NULL,
    "shopifyGid" TEXT,
    "name" TEXT,
    "currencyCode" TEXT NOT NULL DEFAULT 'USD',
    "currencyExponent" INTEGER NOT NULL DEFAULT 2,
    "status" TEXT NOT NULL DEFAULT 'active',
    "installedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uninstalledAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "products" (
    "id" BIGINT NOT NULL PRIMARY KEY,
    "storeId" BIGINT NOT NULL,
    "shopifyProductId" BIGINT NOT NULL,
    "gid" TEXT,
    "title" TEXT,
    "handle" TEXT,
    "status" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "products_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "variants" (
    "id" BIGINT NOT NULL PRIMARY KEY,
    "storeId" BIGINT NOT NULL,
    "productId" BIGINT,
    "shopifyVariantId" BIGINT NOT NULL,
    "gid" TEXT,
    "title" TEXT,
    "sku" TEXT,
    "barcode" TEXT,
    "position" INTEGER,
    "currentPrice" BIGINT,
    "currentCompareAtPrice" BIGINT,
    "shopifyUpdatedAt" DATETIME,
    "firstSeenAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "variants_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "variants_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "price_changes" (
    "id" BIGINT NOT NULL PRIMARY KEY,
    "storeId" BIGINT NOT NULL,
    "variantId" BIGINT NOT NULL,
    "price" BIGINT,
    "compareAtPrice" BIGINT,
    "source" TEXT NOT NULL DEFAULT 'webhook',
    "changedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "price_changes_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "price_changes_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "variants" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "stores_shopDomain_key" ON "stores"("shopDomain");

-- CreateIndex
CREATE INDEX "products_storeId_idx" ON "products"("storeId");

-- CreateIndex
CREATE UNIQUE INDEX "products_storeId_shopifyProductId_key" ON "products"("storeId", "shopifyProductId");

-- CreateIndex
CREATE INDEX "variants_storeId_idx" ON "variants"("storeId");

-- CreateIndex
CREATE INDEX "variants_productId_idx" ON "variants"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "variants_storeId_shopifyVariantId_key" ON "variants"("storeId", "shopifyVariantId");

-- CreateIndex
CREATE INDEX "price_changes_storeId_variantId_changedAt_idx" ON "price_changes"("storeId", "variantId", "changedAt");

-- CreateIndex
CREATE INDEX "price_changes_storeId_changedAt_idx" ON "price_changes"("storeId", "changedAt");
