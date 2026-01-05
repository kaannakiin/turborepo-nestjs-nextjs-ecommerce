-- CreateEnum
CREATE TYPE "LocationType" AS ENUM ('WAREHOUSE', 'STORE', 'SUPPLIER', 'FULFILLMENT', 'VIRTUAL');

-- CreateEnum
CREATE TYPE "MovementType" AS ENUM ('PURCHASE', 'RETURN', 'TRANSFER_IN', 'ADJUSTMENT_ADD', 'PRODUCTION', 'SALE', 'TRANSFER_OUT', 'ADJUSTMENT_REMOVE', 'DAMAGED', 'LOST', 'EXPIRED', 'RESERVE', 'UNRESERVE', 'COMMIT', 'UNCOMMIT', 'FULFILL');

-- CreateEnum
CREATE TYPE "TransferStatus" AS ENUM ('DRAFT', 'PENDING', 'IN_TRANSIT', 'PARTIALLY_RECEIVED', 'RECEIVED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AdjustmentReason" AS ENUM ('CYCLE_COUNT', 'STOCK_COUNT', 'SHRINKAGE', 'DAMAGE', 'CORRECTION', 'RECOUNT', 'OTHER');

-- CreateEnum
CREATE TYPE "SupplierOrderStatus" AS ENUM ('DRAFT', 'SENT', 'CONFIRMED', 'PARTIALLY_RECEIVED', 'RECEIVED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "WeightUnit" AS ENUM ('KG', 'GR', 'LB', 'OZ');

-- CreateTable
CREATE TABLE "InventoryLocation" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "LocationType" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isFulfillmentEnabled" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "addressLine1" TEXT,
    "addressLine2" TEXT,
    "cityId" TEXT,
    "stateId" TEXT,
    "countryId" TEXT,
    "zipCode" TEXT,
    "contactName" TEXT,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "InventoryLocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryItem" (
    "id" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "sku" TEXT,
    "tracked" BOOLEAN NOT NULL DEFAULT true,
    "allowNegative" BOOLEAN NOT NULL DEFAULT false,
    "lowStockThreshold" INTEGER,
    "weight" DOUBLE PRECISION,
    "weightUnit" "WeightUnit" NOT NULL DEFAULT 'KG',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InventoryItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryLevel" (
    "id" TEXT NOT NULL,
    "inventoryItemId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "available" INTEGER NOT NULL DEFAULT 0,
    "reserved" INTEGER NOT NULL DEFAULT 0,
    "committed" INTEGER NOT NULL DEFAULT 0,
    "incoming" INTEGER NOT NULL DEFAULT 0,
    "damaged" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InventoryLevel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryMovement" (
    "id" TEXT NOT NULL,
    "inventoryItemId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "type" "MovementType" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "previousAvailable" INTEGER NOT NULL,
    "newAvailable" INTEGER NOT NULL,
    "previousReserved" INTEGER,
    "newReserved" INTEGER,
    "orderId" TEXT,
    "orderItemId" TEXT,
    "transferId" TEXT,
    "supplierOrderId" TEXT,
    "adjustmentId" TEXT,
    "reason" TEXT,
    "note" TEXT,
    "actorType" "ActorType" NOT NULL DEFAULT 'SYSTEM',
    "actorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InventoryMovement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryTransfer" (
    "id" TEXT NOT NULL,
    "transferNumber" TEXT NOT NULL,
    "fromLocationId" TEXT NOT NULL,
    "toLocationId" TEXT NOT NULL,
    "status" "TransferStatus" NOT NULL DEFAULT 'DRAFT',
    "expectedDate" TIMESTAMP(3),
    "shippedAt" TIMESTAMP(3),
    "receivedAt" TIMESTAMP(3),
    "note" TEXT,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InventoryTransfer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryTransferItem" (
    "id" TEXT NOT NULL,
    "transferId" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "quantityExpected" INTEGER NOT NULL,
    "quantityShipped" INTEGER NOT NULL DEFAULT 0,
    "quantityReceived" INTEGER NOT NULL DEFAULT 0,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InventoryTransferItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryAdjustment" (
    "id" TEXT NOT NULL,
    "adjustmentNumber" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "reason" "AdjustmentReason" NOT NULL,
    "note" TEXT,
    "createdBy" TEXT NOT NULL,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InventoryAdjustment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryAdjustmentItem" (
    "id" TEXT NOT NULL,
    "adjustmentId" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "previousQuantity" INTEGER NOT NULL,
    "newQuantity" INTEGER NOT NULL,
    "difference" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InventoryAdjustmentItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Supplier" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "website" TEXT,
    "addressLine1" TEXT,
    "addressLine2" TEXT,
    "cityId" TEXT,
    "countryId" TEXT,
    "paymentTermsDays" INTEGER,
    "currency" "Currency" NOT NULL DEFAULT 'TRY',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Supplier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupplierProduct" (
    "id" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "supplierSku" TEXT,
    "cost" DOUBLE PRECISION,
    "currency" "Currency" NOT NULL DEFAULT 'TRY',
    "leadTimeDays" INTEGER,
    "minOrderQuantity" INTEGER,
    "isPreferred" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupplierProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupplierOrder" (
    "id" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "destinationId" TEXT NOT NULL,
    "status" "SupplierOrderStatus" NOT NULL DEFAULT 'DRAFT',
    "currency" "Currency" NOT NULL DEFAULT 'TRY',
    "subtotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "taxAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "shippingCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "expectedDate" TIMESTAMP(3),
    "orderedAt" TIMESTAMP(3),
    "receivedAt" TIMESTAMP(3),
    "note" TEXT,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupplierOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupplierOrderItem" (
    "id" TEXT NOT NULL,
    "supplierOrderId" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "quantityOrdered" INTEGER NOT NULL,
    "quantityReceived" INTEGER NOT NULL DEFAULT 0,
    "unitCost" DOUBLE PRECISION NOT NULL,
    "totalCost" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupplierOrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "InventoryLocation_type_isActive_idx" ON "InventoryLocation"("type", "isActive");

-- CreateIndex
CREATE INDEX "InventoryLocation_priority_idx" ON "InventoryLocation"("priority");

-- CreateIndex
CREATE UNIQUE INDEX "InventoryItem_variantId_key" ON "InventoryItem"("variantId");

-- CreateIndex
CREATE INDEX "InventoryItem_sku_idx" ON "InventoryItem"("sku");

-- CreateIndex
CREATE INDEX "InventoryLevel_locationId_idx" ON "InventoryLevel"("locationId");

-- CreateIndex
CREATE INDEX "InventoryLevel_available_idx" ON "InventoryLevel"("available");

-- CreateIndex
CREATE UNIQUE INDEX "InventoryLevel_inventoryItemId_locationId_key" ON "InventoryLevel"("inventoryItemId", "locationId");

-- CreateIndex
CREATE INDEX "InventoryMovement_inventoryItemId_createdAt_idx" ON "InventoryMovement"("inventoryItemId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "InventoryMovement_locationId_createdAt_idx" ON "InventoryMovement"("locationId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "InventoryMovement_type_createdAt_idx" ON "InventoryMovement"("type", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "InventoryMovement_orderId_idx" ON "InventoryMovement"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "InventoryTransfer_transferNumber_key" ON "InventoryTransfer"("transferNumber");

-- CreateIndex
CREATE INDEX "InventoryTransfer_status_idx" ON "InventoryTransfer"("status");

-- CreateIndex
CREATE INDEX "InventoryTransfer_fromLocationId_idx" ON "InventoryTransfer"("fromLocationId");

-- CreateIndex
CREATE INDEX "InventoryTransfer_toLocationId_idx" ON "InventoryTransfer"("toLocationId");

-- CreateIndex
CREATE UNIQUE INDEX "InventoryTransferItem_transferId_variantId_key" ON "InventoryTransferItem"("transferId", "variantId");

-- CreateIndex
CREATE UNIQUE INDEX "InventoryAdjustment_adjustmentNumber_key" ON "InventoryAdjustment"("adjustmentNumber");

-- CreateIndex
CREATE INDEX "InventoryAdjustment_locationId_idx" ON "InventoryAdjustment"("locationId");

-- CreateIndex
CREATE INDEX "InventoryAdjustment_reason_idx" ON "InventoryAdjustment"("reason");

-- CreateIndex
CREATE UNIQUE INDEX "InventoryAdjustmentItem_adjustmentId_variantId_key" ON "InventoryAdjustmentItem"("adjustmentId", "variantId");

-- CreateIndex
CREATE UNIQUE INDEX "Supplier_code_key" ON "Supplier"("code");

-- CreateIndex
CREATE INDEX "Supplier_isActive_idx" ON "Supplier"("isActive");

-- CreateIndex
CREATE INDEX "SupplierProduct_variantId_idx" ON "SupplierProduct"("variantId");

-- CreateIndex
CREATE UNIQUE INDEX "SupplierProduct_supplierId_variantId_key" ON "SupplierProduct"("supplierId", "variantId");

-- CreateIndex
CREATE UNIQUE INDEX "SupplierOrder_orderNumber_key" ON "SupplierOrder"("orderNumber");

-- CreateIndex
CREATE INDEX "SupplierOrder_supplierId_idx" ON "SupplierOrder"("supplierId");

-- CreateIndex
CREATE INDEX "SupplierOrder_status_idx" ON "SupplierOrder"("status");

-- CreateIndex
CREATE INDEX "SupplierOrder_destinationId_idx" ON "SupplierOrder"("destinationId");

-- CreateIndex
CREATE UNIQUE INDEX "SupplierOrderItem_supplierOrderId_variantId_key" ON "SupplierOrderItem"("supplierOrderId", "variantId");

-- AddForeignKey
ALTER TABLE "InventoryItem" ADD CONSTRAINT "InventoryItem_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariantCombination"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryLevel" ADD CONSTRAINT "InventoryLevel_inventoryItemId_fkey" FOREIGN KEY ("inventoryItemId") REFERENCES "InventoryItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryLevel" ADD CONSTRAINT "InventoryLevel_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "InventoryLocation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryMovement" ADD CONSTRAINT "InventoryMovement_inventoryItemId_fkey" FOREIGN KEY ("inventoryItemId") REFERENCES "InventoryItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryMovement" ADD CONSTRAINT "InventoryMovement_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "InventoryLocation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryMovement" ADD CONSTRAINT "InventoryMovement_transferId_fkey" FOREIGN KEY ("transferId") REFERENCES "InventoryTransfer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryMovement" ADD CONSTRAINT "InventoryMovement_adjustmentId_fkey" FOREIGN KEY ("adjustmentId") REFERENCES "InventoryAdjustment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryTransfer" ADD CONSTRAINT "InventoryTransfer_fromLocationId_fkey" FOREIGN KEY ("fromLocationId") REFERENCES "InventoryLocation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryTransfer" ADD CONSTRAINT "InventoryTransfer_toLocationId_fkey" FOREIGN KEY ("toLocationId") REFERENCES "InventoryLocation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryTransferItem" ADD CONSTRAINT "InventoryTransferItem_transferId_fkey" FOREIGN KEY ("transferId") REFERENCES "InventoryTransfer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryTransferItem" ADD CONSTRAINT "InventoryTransferItem_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariantCombination"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryAdjustmentItem" ADD CONSTRAINT "InventoryAdjustmentItem_adjustmentId_fkey" FOREIGN KEY ("adjustmentId") REFERENCES "InventoryAdjustment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryAdjustmentItem" ADD CONSTRAINT "InventoryAdjustmentItem_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariantCombination"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplierProduct" ADD CONSTRAINT "SupplierProduct_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplierProduct" ADD CONSTRAINT "SupplierProduct_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariantCombination"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplierOrder" ADD CONSTRAINT "SupplierOrder_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplierOrder" ADD CONSTRAINT "SupplierOrder_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "InventoryLocation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplierOrderItem" ADD CONSTRAINT "SupplierOrderItem_supplierOrderId_fkey" FOREIGN KEY ("supplierOrderId") REFERENCES "SupplierOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplierOrderItem" ADD CONSTRAINT "SupplierOrderItem_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariantCombination"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
