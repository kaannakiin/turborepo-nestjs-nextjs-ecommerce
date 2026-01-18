-- CreateTable
CREATE TABLE "PaymentRule" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "flowData" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentRule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PaymentRule_isActive_priority_idx" ON "PaymentRule"("isActive", "priority");

-- CreateIndex
CREATE INDEX "PaymentRule_isDefault_idx" ON "PaymentRule"("isDefault");
