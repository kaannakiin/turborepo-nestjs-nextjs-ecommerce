-- CreateEnum
CREATE TYPE "FulfillmentStrategyType" AS ENUM ('PROXIMITY', 'STOCK_PRIORITY', 'COST_OPTIMAL', 'LOAD_BALANCE', 'MANUAL');

-- CreateEnum
CREATE TYPE "FulfillmentRuleOperator" AS ENUM ('AND', 'OR');

-- CreateEnum
CREATE TYPE "FulfillmentConditionType" AS ENUM ('CUSTOMER_TYPE', 'CUSTOMER_GROUP', 'ORDER_TOTAL', 'ORDER_ITEM_COUNT', 'PRODUCT_TAG', 'PRODUCT_CATEGORY', 'BRAND', 'SHIPPING_METHOD', 'DESTINATION_COUNTRY', 'DESTINATION_STATE', 'DESTINATION_CITY', 'DAY_OF_WEEK', 'TIME_OF_DAY');

-- CreateEnum
CREATE TYPE "FulfillmentActionType" AS ENUM ('USE_LOCATION', 'EXCLUDE_LOCATION', 'PREFER_LOCATION', 'ALLOW_SPLIT', 'DENY_SPLIT', 'USE_DROPSHIP', 'BACKORDER', 'REJECT');

-- CreateEnum
CREATE TYPE "ConditionOperator" AS ENUM ('EQUALS', 'NOT_EQUALS', 'GREATER_THAN', 'LESS_THAN', 'GREATER_THAN_OR_EQUALS', 'LESS_THAN_OR_EQUALS', 'IN', 'NOT_IN', 'CONTAINS', 'NOT_CONTAINS', 'BETWEEN');

-- CreateEnum
CREATE TYPE "FulfillmentDecisionType" AS ENUM ('AUTO_ASSIGNED', 'SPLIT_SHIPMENT', 'DROPSHIP', 'BACKORDER', 'MANUAL_REQUIRED', 'REJECTED');

-- CreateTable
CREATE TABLE "FulfillmentStrategy" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "FulfillmentStrategyType" NOT NULL DEFAULT 'PROXIMITY',
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "allowSplitShipment" BOOLEAN NOT NULL DEFAULT false,
    "maxSplitCount" INTEGER,
    "allowBackorder" BOOLEAN NOT NULL DEFAULT false,
    "allowDropship" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FulfillmentStrategy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FulfillmentRule" (
    "id" TEXT NOT NULL,
    "strategyId" TEXT NOT NULL,
    "name" TEXT,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "conditionOperator" "FulfillmentRuleOperator" NOT NULL DEFAULT 'AND',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FulfillmentRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FulfillmentRuleCondition" (
    "id" TEXT NOT NULL,
    "ruleId" TEXT NOT NULL,
    "type" "FulfillmentConditionType" NOT NULL,
    "operator" "ConditionOperator" NOT NULL DEFAULT 'EQUALS',
    "value" TEXT NOT NULL,

    CONSTRAINT "FulfillmentRuleCondition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FulfillmentRuleAction" (
    "id" TEXT NOT NULL,
    "ruleId" TEXT NOT NULL,
    "type" "FulfillmentActionType" NOT NULL,
    "value" TEXT,

    CONSTRAINT "FulfillmentRuleAction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FulfillmentDecision" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "strategyId" TEXT,
    "ruleId" TEXT,
    "decisionType" "FulfillmentDecisionType" NOT NULL,
    "assignedLocationId" TEXT,
    "supplierId" TEXT,
    "evaluationLog" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FulfillmentDecision_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FulfillmentStrategy_isActive_priority_idx" ON "FulfillmentStrategy"("isActive", "priority");

-- CreateIndex
CREATE INDEX "FulfillmentRule_strategyId_priority_idx" ON "FulfillmentRule"("strategyId", "priority");

-- CreateIndex
CREATE INDEX "FulfillmentRuleCondition_ruleId_idx" ON "FulfillmentRuleCondition"("ruleId");

-- CreateIndex
CREATE INDEX "FulfillmentRuleAction_ruleId_idx" ON "FulfillmentRuleAction"("ruleId");

-- CreateIndex
CREATE INDEX "FulfillmentDecision_orderId_idx" ON "FulfillmentDecision"("orderId");

-- AddForeignKey
ALTER TABLE "FulfillmentRule" ADD CONSTRAINT "FulfillmentRule_strategyId_fkey" FOREIGN KEY ("strategyId") REFERENCES "FulfillmentStrategy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FulfillmentRuleCondition" ADD CONSTRAINT "FulfillmentRuleCondition_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "FulfillmentRule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FulfillmentRuleAction" ADD CONSTRAINT "FulfillmentRuleAction_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "FulfillmentRule"("id") ON DELETE CASCADE ON UPDATE CASCADE;
