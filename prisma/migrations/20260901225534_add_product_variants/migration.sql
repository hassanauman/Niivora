-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "variantId" TEXT,
ADD COLUMN     "variantName" TEXT;

-- CreateTable
CREATE TABLE "ProductVariant" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "sku" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductVariant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProductVariant_sku_key" ON "ProductVariant"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "ProductVariant_productId_name_key" ON "ProductVariant"("productId", "name");

-- CreateIndex
CREATE INDEX "OrderItem_variantId_idx" ON "OrderItem"("variantId");

-- AddForeignKey
ALTER TABLE "ProductVariant" ADD CONSTRAINT "ProductVariant_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Create a Default variant for every existing product
INSERT INTO "ProductVariant" (
    "id",
    "productId",
    "name",
    "price",
    "stock",
    "createdAt",
    "updatedAt"
)
SELECT
    'variant_' || "id",
    "id",
    'Default',
    "price",
    "stock",
    NOW(),
    NOW()
FROM "Product"
WHERE NOT EXISTS (
    SELECT 1
    FROM "ProductVariant"
    WHERE "ProductVariant"."productId" = "Product"."id"
);

-- Attach existing order items to their product's Default variant
UPDATE "OrderItem"
SET
    "variantId" = "ProductVariant"."id",
    "variantName" = "ProductVariant"."name"
FROM "ProductVariant"
WHERE
    "OrderItem"."productId" = "ProductVariant"."productId"
    AND "ProductVariant"."name" = 'Default';