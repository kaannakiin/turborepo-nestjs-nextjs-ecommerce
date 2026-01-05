/*
  Warnings:

  - The values [EQUALS,NOT_EQUALS,GREATER_THAN,LESS_THAN,GREATER_THAN_OR_EQUALS,LESS_THAN_OR_EQUALS] on the enum `ConditionOperator` will be removed. If these variants are still used in the database, this will fail.
  - The `operator` column on the `DiscountConditionGroup` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `conditionOperator` column on the `FulfillmentRule` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `type` on the `FulfillmentRuleCondition` table. All the data in the column will be lost.
  - Added the required column `field` to the `FulfillmentRuleCondition` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `value` on the `FulfillmentRuleCondition` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "LogicalOperator" AS ENUM ('AND', 'OR');

-- CreateEnum
CREATE TYPE "CustomerSegmentField" AS ENUM ('ORDER_COUNT', 'TOTAL_SPENT', 'AVERAGE_ORDER_VALUE', 'LAST_ORDER_DATE', 'FIRST_ORDER_DATE', 'CREATED_AT', 'EMAIL_VERIFIED_AT', 'PHONE_VERIFIED_AT', 'IS_EMAIL_VERIFIED', 'IS_PHONE_VERIFIED', 'HAS_ORDERS', 'HAS_ADDRESS', 'ACCOUNT_STATUS', 'REGISTRATION_SOURCE', 'SUBSCRIPTION_STATUS', 'CUSTOMER_TAGS', 'CUSTOMER_GROUPS', 'PRICE_LIST', 'COUNTRY', 'STATE', 'CITY', 'DISTRICT');

-- CreateEnum
CREATE TYPE "FulfillmentConditionField" AS ENUM ('CUSTOMER_TYPE', 'CUSTOMER_GROUP', 'ORDER_TOTAL', 'ORDER_ITEM_COUNT', 'ORDER_WEIGHT', 'ORDER_CURRENCY', 'PRODUCT_TAG', 'PRODUCT_CATEGORY', 'PRODUCT_BRAND', 'SHIPPING_METHOD', 'DESTINATION_COUNTRY', 'DESTINATION_STATE', 'DESTINATION_CITY', 'DAY_OF_WEEK', 'TIME_OF_DAY', 'IS_HOLIDAY');

-- CreateEnum
CREATE TYPE "DiscountConditionField" AS ENUM ('PRODUCT', 'PRODUCT_VARIANT', 'CATEGORY', 'BRAND', 'PRODUCT_TAG', 'CART_TOTAL', 'CART_ITEM_COUNT', 'CART_WEIGHT', 'CUSTOMER_GROUP', 'CUSTOMER_TAG', 'IS_FIRST_ORDER', 'VALID_FROM', 'VALID_UNTIL', 'DAY_OF_WEEK');

-- CreateEnum
CREATE TYPE "TimeUnit" AS ENUM ('MINUTES', 'HOURS', 'DAYS', 'WEEKS', 'MONTHS', 'YEARS');

-- AlterEnum
BEGIN;
CREATE TYPE "ConditionOperator_new" AS ENUM ('EQ', 'NEQ', 'GT', 'GTE', 'LT', 'LTE', 'IN', 'NOT_IN', 'BETWEEN', 'CONTAINS', 'NOT_CONTAINS', 'STARTS_WITH', 'ENDS_WITH', 'IS_EMPTY', 'IS_NOT_EMPTY', 'HAS_ANY', 'HAS_ALL', 'HAS_NONE', 'EXISTS', 'NOT_EXISTS', 'IS_NULL', 'IS_NOT_NULL', 'IS_TRUE', 'IS_FALSE', 'BEFORE', 'AFTER', 'ON_DATE', 'WITHIN_LAST', 'NOT_WITHIN_LAST', 'WITHIN_NEXT');
ALTER TABLE "public"."FulfillmentRuleCondition" ALTER COLUMN "operator" DROP DEFAULT;
ALTER TABLE "FulfillmentRuleCondition" ALTER COLUMN "operator" TYPE "ConditionOperator_new" USING ("operator"::text::"ConditionOperator_new");
ALTER TYPE "ConditionOperator" RENAME TO "ConditionOperator_old";
ALTER TYPE "ConditionOperator_new" RENAME TO "ConditionOperator";
DROP TYPE "public"."ConditionOperator_old";
COMMIT;

-- AlterTable
ALTER TABLE "DiscountConditionGroup" DROP COLUMN "operator",
ADD COLUMN     "operator" "LogicalOperator" NOT NULL DEFAULT 'AND';

-- AlterTable
ALTER TABLE "FulfillmentRule" DROP COLUMN "conditionOperator",
ADD COLUMN     "conditionOperator" "LogicalOperator" NOT NULL DEFAULT 'AND';

-- AlterTable
ALTER TABLE "FulfillmentRuleCondition" DROP COLUMN "type",
ADD COLUMN     "field" "FulfillmentConditionField" NOT NULL,
ALTER COLUMN "operator" DROP DEFAULT,
DROP COLUMN "value",
ADD COLUMN     "value" JSONB NOT NULL;

-- DropEnum
DROP TYPE "FilterOperator";
