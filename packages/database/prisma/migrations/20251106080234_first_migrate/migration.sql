-- CreateEnum
CREATE TYPE "VariantGroupRenderType" AS ENUM ('DROPDOWN', 'BADGE');

-- CreateEnum
CREATE TYPE "CampaignStatus" AS ENUM ('DRAFT', 'ACTIVE', 'SCHEDULED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "CampaignType" AS ENUM ('CROSS_SELLING', 'UP_SELLING');

-- CreateEnum
CREATE TYPE "CampaignOfferTargetPage" AS ENUM ('CHECKOUT_PAGE', 'POST_CHECKOUT', 'PRODUCT');

-- CreateEnum
CREATE TYPE "CartStatus" AS ENUM ('ACTIVE', 'ABANDONED', 'CONVERTED', 'MERGED');

-- CreateEnum
CREATE TYPE "LayoutComponentType" AS ENUM ('MARQUEE', 'SLIDER', 'PRODUCT_LIST', 'CATEGORY_GRID');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('OWNER', 'ADMIN', 'USER');

-- CreateEnum
CREATE TYPE "Locale" AS ENUM ('TR', 'EN', 'DE');

-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('TRY', 'USD', 'EUR', 'GBP');

-- CreateEnum
CREATE TYPE "VariantGroupType" AS ENUM ('LIST', 'COLOR');

-- CreateEnum
CREATE TYPE "AssetType" AS ENUM ('IMAGE', 'VIDEO', 'AUDIO', 'DOCUMENT');

-- CreateEnum
CREATE TYPE "ProductType" AS ENUM ('DIGITAL', 'PHYSICAL');

-- CreateEnum
CREATE TYPE "CountryType" AS ENUM ('NONE', 'STATE', 'CITY');

-- CreateEnum
CREATE TYPE "WhereAdded" AS ENUM ('PRODUCT_PAGE', 'CATEGORY_PAGE', 'BRAND_PAGE', 'CART_PAGE');

-- CreateEnum
CREATE TYPE "inVisibleCause" AS ENUM ('DELETED', 'DELETED_BY_USER', 'DELETED_BY_ADMIN', 'OUT_OF_STOCK', 'CURRENCY_MISMATCH', 'LOCALE_MISMATCH');

-- CreateEnum
CREATE TYPE "RuleType" AS ENUM ('SalesPrice', 'ProductWeight');

-- CreateEnum
CREATE TYPE "PaymentProvider" AS ENUM ('IYZICO', 'PAYTR', 'STRIPE', 'PAYPAL', 'BANK_TRANSFER');

-- CreateEnum
CREATE TYPE "DiscountType" AS ENUM ('PERCENTAGE', 'PERCENTAGE_GROW_QUANTITY', 'PERCENTAGE_GROW_PRICE', 'FIXED_AMOUNT', 'FIXED_AMOUNT_GROW_QUANTITY', 'FIXED_AMOUNT_GROW_PRICE', 'FREE_SHIPPING');

-- CreateEnum
CREATE TYPE "AllowedDiscountedItemsBy" AS ENUM ('price', 'discounted_price');

-- CreateEnum
CREATE TYPE "FilterOperator" AS ENUM ('AND', 'OR');

-- CreateEnum
CREATE TYPE "DiscountConditionType" AS ENUM ('PRODUCT', 'CATEGORY', 'BRAND', 'VARIANT');

-- CreateEnum
CREATE TYPE "DiscountEffectType" AS ENUM ('AUTOMATIC', 'COUPON');

-- CreateEnum
CREATE TYPE "DiscountWhereVisible" AS ENUM ('PRODUCT_PAGE', 'CHECKOUT_PAGE', 'ALL');

-- CreateEnum
CREATE TYPE "CartActivityType" AS ENUM ('CART_CREATED', 'CART_MERGED', 'CART_STATUS_CHANGED', 'ITEM_ADDED', 'ITEM_REMOVED', 'ITEM_QUANTITY_CHANGED', 'ITEM_VISIBILITY_CHANGED', 'SHIPPING_ADDRESS_SET', 'BILLING_ADDRESS_SET', 'PAYMENT_ATTEMPT_FAILED', 'PAYMENT_ATTEMPT_SUCCESS');

-- CreateEnum
CREATE TYPE "ActorType" AS ENUM ('USER', 'ADMIN', 'SYSTEM');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'CONFIRMED', 'PROCESSING', 'PARTIALLY_SHIPPED', 'SHIPPED', 'PARTIALLY_DELIVERED', 'DELIVERED', 'CANCELLED', 'PARTIALLY_REFUNDED', 'REFUNDED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "OrderItemStatus" AS ENUM ('PENDING', 'PREPARING', 'SHIPPED', 'DELIVERED', 'CANCEL_REQUESTED', 'CANCEL_REJECTED', 'CANCELLED', 'REFUND_REQUESTED', 'REFUND_REQUEST_ACCEPTED', 'REFUND_REJECTED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('FAILED', 'PAID', 'PARTIALLY_PAID', 'PENDING');

-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('APP_PAYMENT', 'BANK_REDIRECT', 'BUY_ONLINE_PAY_AT_STORE', 'CASH', 'CASH_ON_DELIVERY', 'CREDIT_CARD', 'CREDIT_CARD_ON_DELIVERY', 'DIRECT_DEBIT', 'GIFT_CARD', 'MONEY_ORDER', 'OTHER', 'PAY_LATER', 'SLICE_IT', 'WALLET');

-- CreateEnum
CREATE TYPE "ShipmentStatus" AS ENUM ('PENDING', 'IN_TRANSIT', 'DELIVERED', 'FAILED');

-- CreateEnum
CREATE TYPE "CardAssociation" AS ENUM ('VISA', 'MASTER_CARD', 'AMERICAN_EXPRESS', 'TROY', 'DISCOVER', 'DINERS_CLUB', 'JCB', 'UNIONPAY', 'MAESTRO', 'MIR', 'CUP', 'UNKNOWN');

-- CreateTable
CREATE TABLE "Asset" (
    "id" TEXT NOT NULL,
    "type" "AssetType" NOT NULL DEFAULT 'IMAGE',
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "name" TEXT NOT NULL,
    "surname" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "password" TEXT,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "defaultAddressId" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefreshTokens" (
    "id" TEXT NOT NULL,
    "hashedRefreshToken" TEXT NOT NULL,
    "userAgent" TEXT,
    "browser" TEXT,
    "browserVersion" TEXT,
    "os" TEXT,
    "osVersion" TEXT,
    "deviceType" TEXT,
    "deviceName" TEXT,
    "ipAddress" TEXT,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RefreshTokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CategoryTranslation" (
    "id" TEXT NOT NULL,
    "locale" "Locale" NOT NULL DEFAULT 'TR',
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "CategoryTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "imageId" TEXT,
    "parentCategoryId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "categoryGridComponentId" TEXT,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaxonomyCategory" (
    "id" TEXT NOT NULL,
    "googleId" TEXT NOT NULL,
    "parentId" TEXT,
    "path" TEXT,
    "pathNames" TEXT,
    "depth" INTEGER NOT NULL DEFAULT 0,
    "originalName" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TaxonomyCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductCategory" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BrandTranslation" (
    "id" TEXT NOT NULL,
    "locale" "Locale" NOT NULL DEFAULT 'TR',
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "brandId" TEXT NOT NULL,

    CONSTRAINT "BrandTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Brand" (
    "id" TEXT NOT NULL,
    "imageId" TEXT,
    "parentBrandId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Brand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VariantGroupTranslation" (
    "id" TEXT NOT NULL,
    "locale" "Locale" NOT NULL DEFAULT 'TR',
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "variantGroupId" TEXT NOT NULL,

    CONSTRAINT "VariantGroupTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VariantGroup" (
    "id" TEXT NOT NULL,
    "type" "VariantGroupType" NOT NULL DEFAULT 'LIST',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VariantGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VariantOptionTranslation" (
    "id" TEXT NOT NULL,
    "locale" "Locale" NOT NULL DEFAULT 'TR',
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "variantOptionId" TEXT NOT NULL,

    CONSTRAINT "VariantOptionTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VariantOption" (
    "id" TEXT NOT NULL,
    "hexValue" TEXT,
    "assetId" TEXT,
    "variantGroupId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VariantOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductTranslation" (
    "id" TEXT NOT NULL,
    "locale" "Locale" NOT NULL DEFAULT 'TR',
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "productId" TEXT,

    CONSTRAINT "ProductTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductPrice" (
    "id" TEXT NOT NULL,
    "currency" "Currency" NOT NULL DEFAULT 'TRY',
    "price" DOUBLE PRECISION NOT NULL,
    "buyedPrice" DOUBLE PRECISION,
    "discountedPrice" DOUBLE PRECISION,
    "productId" TEXT,
    "combinationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductPrice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductAsset" (
    "id" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "assetId" TEXT NOT NULL,
    "productId" TEXT,
    "combinationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductTagTranslation" (
    "id" TEXT NOT NULL,
    "locale" "Locale" NOT NULL DEFAULT 'TR',
    "name" TEXT NOT NULL,
    "productTagId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductTagTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductTag" (
    "id" TEXT NOT NULL,
    "color" TEXT,
    "icon" TEXT,
    "priority" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductTagOnProduct" (
    "productId" TEXT NOT NULL,
    "productTagId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductTagOnProduct_pkey" PRIMARY KEY ("productId","productTagId")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "type" "ProductType" NOT NULL DEFAULT 'PHYSICAL',
    "isVariant" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "sku" TEXT,
    "barcode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "brandId" TEXT,
    "taxonomyCategoryId" TEXT,
    "visibleAllCombinations" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductVariantGroup" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "variantGroupId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "renderVisibleType" "VariantGroupRenderType" NOT NULL DEFAULT 'DROPDOWN',

    CONSTRAINT "ProductVariantGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductVariantOption" (
    "id" TEXT NOT NULL,
    "productVariantGroupId" TEXT NOT NULL,
    "variantOptionId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductVariantOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductVariantCombination" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "sku" TEXT,
    "barcode" TEXT,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductVariantCombination_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductVariantCombinationOption" (
    "id" TEXT NOT NULL,
    "combinationId" TEXT NOT NULL,
    "productVariantOptionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductVariantCombinationOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductVariantTranslation" (
    "id" TEXT NOT NULL,
    "combinationId" TEXT NOT NULL,
    "locale" "Locale" NOT NULL DEFAULT 'TR',
    "description" TEXT,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductVariantTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CountryTranslation" (
    "id" TEXT NOT NULL,
    "locale" "Locale" NOT NULL DEFAULT 'TR',
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "countryId" TEXT NOT NULL,

    CONSTRAINT "CountryTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Country" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "iso2" TEXT,
    "iso3" TEXT,
    "phoneCode" TEXT,
    "capital" TEXT,
    "currency" TEXT,
    "native" TEXT,
    "region" TEXT,
    "subregion" TEXT,
    "emoji" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "type" "CountryType" NOT NULL DEFAULT 'STATE',

    CONSTRAINT "Country_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "State" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "stateCode" TEXT,
    "countryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "State_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "City" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "latitude" TEXT,
    "longitude" TEXT,
    "countryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "City_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "District" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cityId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "District_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CartItem" (
    "id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "whereAdded" "WhereAdded" NOT NULL DEFAULT 'PRODUCT_PAGE',
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "visibleCause" "inVisibleCause",
    "productId" TEXT,
    "variantId" TEXT,
    "cartId" TEXT NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CartItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CartActivityLog" (
    "id" TEXT NOT NULL,
    "cartId" TEXT NOT NULL,
    "cartItemId" TEXT,
    "activityType" "CartActivityType" NOT NULL,
    "actorType" "ActorType" NOT NULL DEFAULT 'USER',
    "actorId" TEXT,
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CartActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cart" (
    "id" TEXT NOT NULL,
    "status" "CartStatus" NOT NULL DEFAULT 'ACTIVE',
    "currency" "Currency" NOT NULL DEFAULT 'TRY',
    "locale" "Locale" NOT NULL DEFAULT 'TR',
    "shippingAddressId" TEXT,
    "billingAddressId" TEXT,
    "cargoRuleId" TEXT,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CartPaymentCheckAttempts" (
    "id" TEXT NOT NULL,
    "cartId" TEXT NOT NULL,
    "message" TEXT,
    "isSuccess" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CartPaymentCheckAttempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FooterLinks" (
    "id" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "options" JSONB,
    "customLink" TEXT,
    "productId" TEXT,
    "categoryId" TEXT,
    "brandId" TEXT,
    "footerLinkGroupId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FooterLinks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FooterLinkGroups" (
    "id" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "options" JSONB,
    "footerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FooterLinkGroups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Footer" (
    "id" TEXT NOT NULL,
    "options" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Footer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SliderItemSchema" (
    "id" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "mobileAssetId" TEXT,
    "desktopAssetId" TEXT,
    "customLink" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "sliderSettingsId" TEXT NOT NULL,

    CONSTRAINT "SliderItemSchema_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SliderSettings" (
    "id" TEXT NOT NULL,
    "isAutoPlay" BOOLEAN NOT NULL DEFAULT false,
    "autoPlayInterval" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SliderSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarqueeSchema" (
    "id" TEXT NOT NULL,
    "options" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarqueeSchema_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductListCarouselTranslation" (
    "id" TEXT NOT NULL,
    "locale" "Locale" NOT NULL DEFAULT 'TR',
    "title" TEXT NOT NULL,
    "productListCarouselId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductListCarouselTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductListCarousel" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductListCarousel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductListCarouselItem" (
    "id" TEXT NOT NULL,
    "productListCarouselId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "variantId" TEXT,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductListCarouselItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CategoryGridComponent" (
    "id" TEXT NOT NULL,
    "options" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CategoryGridComponent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LayoutComponent" (
    "id" TEXT NOT NULL,
    "type" "LayoutComponentType" NOT NULL,
    "order" INTEGER NOT NULL,
    "layoutId" TEXT NOT NULL,
    "sliderId" TEXT,
    "marqueeId" TEXT,
    "productListCarouselId" TEXT,
    "categoryGridComponentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LayoutComponent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Layout" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "otherSettings" JSONB,

    CONSTRAINT "Layout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AddressSchema" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "addressTitle" TEXT,
    "phone" TEXT NOT NULL,
    "tcKimlikNo" TEXT,
    "name" TEXT NOT NULL,
    "surname" TEXT NOT NULL,
    "addressLine1" TEXT NOT NULL,
    "addressLine2" TEXT,
    "zipCode" TEXT,
    "countryId" TEXT NOT NULL,
    "stateId" TEXT,
    "cityId" TEXT,
    "userId" TEXT,
    "addressLocationType" "CountryType" NOT NULL,
    "isBillingAddress" BOOLEAN NOT NULL DEFAULT false,
    "isCorporateInvoice" BOOLEAN NOT NULL DEFAULT false,
    "companyName" TEXT,
    "taxNumber" TEXT,
    "companyRegistrationAddress" TEXT,
    "districtId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AddressSchema_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CountryDefaultSettings" (
    "id" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "currency" "Currency" NOT NULL DEFAULT 'TRY',
    "locale" "Locale" NOT NULL DEFAULT 'TR',
    "translations" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CountryDefaultSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CargoZone" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CargoZone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Location" (
    "id" TEXT NOT NULL,
    "cargoZoneId" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "stateIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "cityIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CargoRule" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ruleType" "RuleType" NOT NULL DEFAULT 'SalesPrice',
    "minValue" DOUBLE PRECISION,
    "maxValue" DOUBLE PRECISION,
    "price" DOUBLE PRECISION,
    "currency" "Currency" NOT NULL DEFAULT 'TRY',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "cargoZoneId" TEXT,

    CONSTRAINT "CargoRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Discount" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" "DiscountType" NOT NULL,
    "currencies" "Currency"[],
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "isLimitPurchase" BOOLEAN NOT NULL DEFAULT false,
    "minPurchaseAmount" DOUBLE PRECISION,
    "maxPurchaseAmount" DOUBLE PRECISION,
    "isLimitItemQuantity" BOOLEAN NOT NULL DEFAULT false,
    "minItemQuantity" INTEGER,
    "maxItemQuantity" INTEGER,
    "allowDiscountedItems" BOOLEAN NOT NULL DEFAULT false,
    "allowedDiscountedItemsBy" "AllowedDiscountedItemsBy",
    "mergeOtherCampaigns" BOOLEAN NOT NULL DEFAULT false,
    "isLimitTotalUsage" BOOLEAN NOT NULL DEFAULT false,
    "totalUsageLimit" INTEGER,
    "isLimitTotalUsagePerCustomer" BOOLEAN NOT NULL DEFAULT false,
    "totalUsageLimitPerCustomer" INTEGER,
    "discountValue" DOUBLE PRECISION,
    "discountAmount" DOUBLE PRECISION,
    "isAllCustomers" BOOLEAN NOT NULL DEFAULT true,
    "isAllProducts" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "status" "CampaignStatus" NOT NULL DEFAULT 'DRAFT',

    CONSTRAINT "Discount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Coupon" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "discountId" TEXT NOT NULL,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isDelete" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Coupon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiscountTier" (
    "id" TEXT NOT NULL,
    "discountId" TEXT NOT NULL,
    "minQuantity" INTEGER,
    "maxQuantity" INTEGER,
    "minAmount" DOUBLE PRECISION,
    "maxAmount" DOUBLE PRECISION,
    "discountPercentage" DOUBLE PRECISION,
    "discountAmount" DOUBLE PRECISION,

    CONSTRAINT "DiscountTier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiscountCustomer" (
    "discountId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "DiscountCustomer_pkey" PRIMARY KEY ("discountId","userId")
);

-- CreateTable
CREATE TABLE "DiscountConditionGroup" (
    "id" TEXT NOT NULL,
    "discountId" TEXT NOT NULL,
    "operator" "FilterOperator" NOT NULL,
    "type" "DiscountConditionType" NOT NULL DEFAULT 'PRODUCT',

    CONSTRAINT "DiscountConditionGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiscountProduct" (
    "groupId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,

    CONSTRAINT "DiscountProduct_pkey" PRIMARY KEY ("groupId","productId")
);

-- CreateTable
CREATE TABLE "DiscountCategory" (
    "groupId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "DiscountCategory_pkey" PRIMARY KEY ("groupId","categoryId")
);

-- CreateTable
CREATE TABLE "DiscountBrand" (
    "groupId" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,

    CONSTRAINT "DiscountBrand_pkey" PRIMARY KEY ("groupId","brandId")
);

-- CreateTable
CREATE TABLE "DiscountProductVariant" (
    "groupId" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,

    CONSTRAINT "DiscountProductVariant_pkey" PRIMARY KEY ("groupId","variantId")
);

-- CreateTable
CREATE TABLE "DiscountUsage" (
    "id" TEXT NOT NULL,
    "discountId" TEXT NOT NULL,
    "couponId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "usedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DiscountUsage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Campaign" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "campaignType" "CampaignType" NOT NULL,
    "validCurrencies" "Currency"[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "dates" JSONB NOT NULL,
    "requirements" JSONB NOT NULL,
    "conditionsIsAllProducts" BOOLEAN,
    "campaignOfferType" "CampaignOfferTargetPage",
    "status" "CampaignStatus" NOT NULL DEFAULT 'DRAFT',

    CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampaignBuyableProduct" (
    "campaignId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,

    CONSTRAINT "CampaignBuyableProduct_pkey" PRIMARY KEY ("campaignId","productId")
);

-- CreateTable
CREATE TABLE "CampaignBuyableVariant" (
    "campaignId" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,

    CONSTRAINT "CampaignBuyableVariant_pkey" PRIMARY KEY ("campaignId","variantId")
);

-- CreateTable
CREATE TABLE "CampaignConditionProduct" (
    "campaignId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,

    CONSTRAINT "CampaignConditionProduct_pkey" PRIMARY KEY ("campaignId","productId")
);

-- CreateTable
CREATE TABLE "CampaignConditionVariant" (
    "campaignId" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,

    CONSTRAINT "CampaignConditionVariant_pkey" PRIMARY KEY ("campaignId","variantId")
);

-- CreateTable
CREATE TABLE "CampaignOffer" (
    "id" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "productId" TEXT,
    "variantId" TEXT,
    "discountType" "DiscountType" NOT NULL,
    "discountValue" DOUBLE PRECISION NOT NULL,
    "discountValueAppliedByPrice" "AllowedDiscountedItemsBy" NOT NULL,
    "addCountDown" BOOLEAN NOT NULL,
    "countDownMinute" INTEGER,
    "showPrroductIfInCart" BOOLEAN NOT NULL DEFAULT false,
    "campaignId" TEXT NOT NULL,

    CONSTRAINT "CampaignOffer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StorePaymentProvider" (
    "id" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "options" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isTestMode" BOOLEAN NOT NULL DEFAULT true,
    "provider" "PaymentProvider" NOT NULL,

    CONSTRAINT "StorePaymentProvider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssetLibrary" (
    "id" TEXT NOT NULL,
    "assetType" "AssetType" NOT NULL DEFAULT 'IMAGE',
    "url" TEXT NOT NULL,
    "altText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssetLibrary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItemSchema" (
    "id" TEXT NOT NULL,
    "buyedPrice" DECIMAL(65,30) NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "totalPrice" DECIMAL(65,30) NOT NULL,
    "totalFinalPrice" DECIMAL(65,30) NOT NULL,
    "discountAmount" DECIMAL(65,30),
    "taxAmount" DECIMAL(65,30),
    "productSnapshot" JSONB,
    "variantSnapshot" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "status" "OrderItemStatus" NOT NULL DEFAULT 'PENDING',
    "variantId" TEXT,
    "productId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "shipmentId" TEXT,

    CONSTRAINT "OrderItemSchema_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderSchema" (
    "id" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "totalPrice" DECIMAL(65,30) NOT NULL,
    "totalFinalPrice" DECIMAL(65,30) NOT NULL,
    "discountAmount" DECIMAL(65,30),
    "taxAmount" DECIMAL(65,30),
    "shippingCost" DECIMAL(65,30),
    "currency" "Currency" NOT NULL DEFAULT 'TRY',
    "locale" "Locale" NOT NULL DEFAULT 'TR',
    "orderNote" TEXT,
    "paymentProvider" "PaymentProvider" NOT NULL DEFAULT 'IYZICO',
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "orderStatus" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "shippingAddressSnapshot" JSONB,
    "billingAddressSnapshot" JSONB,
    "cargoRuleSnapshot" JSONB,
    "clientIp" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "cartId" TEXT,
    "userId" TEXT,
    "shippingAddressRecordId" TEXT,
    "billingAddressRecordId" TEXT,
    "cargoRuleId" TEXT,

    CONSTRAINT "OrderSchema_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderTransactionSchema" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "providerTransactionId" TEXT,
    "amount" DECIMAL(65,30) NOT NULL,
    "status" "PaymentStatus" NOT NULL,
    "paymentType" "PaymentType" NOT NULL,
    "provider" "PaymentProvider" NOT NULL,
    "binNumber" TEXT,
    "lastFourDigits" TEXT,
    "cardAssociation" "CardAssociation",
    "cardFamilyName" TEXT,
    "gatewayResponse" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderTransactionSchema_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Shipment" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "trackingCode" TEXT,
    "shippingProvider" TEXT,
    "status" "ShipmentStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Shipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ErrorLog" (
    "id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "stack" TEXT,
    "errorCode" TEXT,
    "context" TEXT NOT NULL,
    "meta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ErrorLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Asset_url_key" ON "Asset"("url");

-- CreateIndex
CREATE INDEX "Asset_url_idx" ON "Asset"("url");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "User_defaultAddressId_key" ON "User"("defaultAddressId");

-- CreateIndex
CREATE INDEX "User_id_email_phone_idx" ON "User"("id", "email", "phone");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshTokens_hashedRefreshToken_key" ON "RefreshTokens"("hashedRefreshToken");

-- CreateIndex
CREATE INDEX "RefreshTokens_id_hashedRefreshToken_idx" ON "RefreshTokens"("id", "hashedRefreshToken");

-- CreateIndex
CREATE UNIQUE INDEX "CategoryTranslation_locale_categoryId_key" ON "CategoryTranslation"("locale", "categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "CategoryTranslation_locale_slug_key" ON "CategoryTranslation"("locale", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "Category_imageId_key" ON "Category"("imageId");

-- CreateIndex
CREATE INDEX "Category_parentCategoryId_idx" ON "Category"("parentCategoryId");

-- CreateIndex
CREATE UNIQUE INDEX "TaxonomyCategory_googleId_key" ON "TaxonomyCategory"("googleId");

-- CreateIndex
CREATE INDEX "TaxonomyCategory_googleId_idx" ON "TaxonomyCategory"("googleId");

-- CreateIndex
CREATE INDEX "TaxonomyCategory_parentId_idx" ON "TaxonomyCategory"("parentId");

-- CreateIndex
CREATE INDEX "TaxonomyCategory_path_idx" ON "TaxonomyCategory"("path");

-- CreateIndex
CREATE INDEX "TaxonomyCategory_depth_idx" ON "TaxonomyCategory"("depth");

-- CreateIndex
CREATE INDEX "TaxonomyCategory_isActive_idx" ON "TaxonomyCategory"("isActive");

-- CreateIndex
CREATE INDEX "ProductCategory_productId_idx" ON "ProductCategory"("productId");

-- CreateIndex
CREATE INDEX "ProductCategory_categoryId_idx" ON "ProductCategory"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductCategory_productId_categoryId_key" ON "ProductCategory"("productId", "categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "BrandTranslation_locale_brandId_key" ON "BrandTranslation"("locale", "brandId");

-- CreateIndex
CREATE UNIQUE INDEX "BrandTranslation_locale_slug_key" ON "BrandTranslation"("locale", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "Brand_imageId_key" ON "Brand"("imageId");

-- CreateIndex
CREATE INDEX "Brand_parentBrandId_idx" ON "Brand"("parentBrandId");

-- CreateIndex
CREATE INDEX "VariantGroupTranslation_locale_slug_idx" ON "VariantGroupTranslation"("locale", "slug");

-- CreateIndex
CREATE INDEX "VariantGroupTranslation_variantGroupId_idx" ON "VariantGroupTranslation"("variantGroupId");

-- CreateIndex
CREATE UNIQUE INDEX "VariantGroupTranslation_locale_variantGroupId_key" ON "VariantGroupTranslation"("locale", "variantGroupId");

-- CreateIndex
CREATE UNIQUE INDEX "VariantGroupTranslation_locale_slug_key" ON "VariantGroupTranslation"("locale", "slug");

-- CreateIndex
CREATE INDEX "VariantGroup_type_idx" ON "VariantGroup"("type");

-- CreateIndex
CREATE INDEX "VariantOptionTranslation_locale_slug_idx" ON "VariantOptionTranslation"("locale", "slug");

-- CreateIndex
CREATE INDEX "VariantOptionTranslation_variantOptionId_idx" ON "VariantOptionTranslation"("variantOptionId");

-- CreateIndex
CREATE UNIQUE INDEX "VariantOptionTranslation_variantOptionId_locale_key" ON "VariantOptionTranslation"("variantOptionId", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "VariantOptionTranslation_locale_slug_key" ON "VariantOptionTranslation"("locale", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "VariantOption_assetId_key" ON "VariantOption"("assetId");

-- CreateIndex
CREATE INDEX "VariantOption_variantGroupId_idx" ON "VariantOption"("variantGroupId");

-- CreateIndex
CREATE INDEX "VariantOption_hexValue_idx" ON "VariantOption"("hexValue");

-- CreateIndex
CREATE INDEX "ProductTranslation_locale_slug_productId_idx" ON "ProductTranslation"("locale", "slug", "productId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductTranslation_locale_productId_key" ON "ProductTranslation"("locale", "productId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductTranslation_locale_slug_key" ON "ProductTranslation"("locale", "slug");

-- CreateIndex
CREATE INDEX "ProductPrice_productId_currency_idx" ON "ProductPrice"("productId", "currency");

-- CreateIndex
CREATE INDEX "ProductPrice_combinationId_currency_idx" ON "ProductPrice"("combinationId", "currency");

-- CreateIndex
CREATE UNIQUE INDEX "ProductPrice_productId_currency_key" ON "ProductPrice"("productId", "currency");

-- CreateIndex
CREATE UNIQUE INDEX "ProductPrice_combinationId_currency_key" ON "ProductPrice"("combinationId", "currency");

-- CreateIndex
CREATE INDEX "ProductAsset_productId_order_idx" ON "ProductAsset"("productId", "order");

-- CreateIndex
CREATE INDEX "ProductAsset_combinationId_order_idx" ON "ProductAsset"("combinationId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "ProductTagTranslation_locale_productTagId_key" ON "ProductTagTranslation"("locale", "productTagId");

-- CreateIndex
CREATE INDEX "ProductTagOnProduct_productId_idx" ON "ProductTagOnProduct"("productId");

-- CreateIndex
CREATE INDEX "ProductTagOnProduct_productTagId_idx" ON "ProductTagOnProduct"("productTagId");

-- CreateIndex
CREATE UNIQUE INDEX "Product_sku_key" ON "Product"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "Product_barcode_key" ON "Product"("barcode");

-- CreateIndex
CREATE INDEX "Product_brandId_idx" ON "Product"("brandId");

-- CreateIndex
CREATE INDEX "Product_taxonomyCategoryId_idx" ON "Product"("taxonomyCategoryId");

-- CreateIndex
CREATE INDEX "Product_active_idx" ON "Product"("active");

-- CreateIndex
CREATE INDEX "Product_sku_idx" ON "Product"("sku");

-- CreateIndex
CREATE INDEX "Product_barcode_idx" ON "Product"("barcode");

-- CreateIndex
CREATE INDEX "ProductVariantGroup_productId_idx" ON "ProductVariantGroup"("productId");

-- CreateIndex
CREATE INDEX "ProductVariantGroup_variantGroupId_idx" ON "ProductVariantGroup"("variantGroupId");

-- CreateIndex
CREATE INDEX "ProductVariantGroup_productId_order_idx" ON "ProductVariantGroup"("productId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "ProductVariantGroup_productId_variantGroupId_key" ON "ProductVariantGroup"("productId", "variantGroupId");

-- CreateIndex
CREATE INDEX "ProductVariantOption_productVariantGroupId_idx" ON "ProductVariantOption"("productVariantGroupId");

-- CreateIndex
CREATE INDEX "ProductVariantOption_variantOptionId_idx" ON "ProductVariantOption"("variantOptionId");

-- CreateIndex
CREATE INDEX "ProductVariantOption_productVariantGroupId_order_idx" ON "ProductVariantOption"("productVariantGroupId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "ProductVariantOption_productVariantGroupId_variantOptionId_key" ON "ProductVariantOption"("productVariantGroupId", "variantOptionId");

-- CreateIndex
CREATE INDEX "ProductVariantCombination_productId_idx" ON "ProductVariantCombination"("productId");

-- CreateIndex
CREATE INDEX "ProductVariantCombination_active_idx" ON "ProductVariantCombination"("active");

-- CreateIndex
CREATE UNIQUE INDEX "ProductVariantCombination_productId_sku_key" ON "ProductVariantCombination"("productId", "sku");

-- CreateIndex
CREATE UNIQUE INDEX "ProductVariantCombination_productId_barcode_key" ON "ProductVariantCombination"("productId", "barcode");

-- CreateIndex
CREATE INDEX "ProductVariantCombinationOption_combinationId_idx" ON "ProductVariantCombinationOption"("combinationId");

-- CreateIndex
CREATE INDEX "ProductVariantCombinationOption_productVariantOptionId_idx" ON "ProductVariantCombinationOption"("productVariantOptionId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductVariantCombinationOption_combinationId_productVarian_key" ON "ProductVariantCombinationOption"("combinationId", "productVariantOptionId");

-- CreateIndex
CREATE INDEX "ProductVariantTranslation_combinationId_locale_idx" ON "ProductVariantTranslation"("combinationId", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "ProductVariantTranslation_combinationId_locale_key" ON "ProductVariantTranslation"("combinationId", "locale");

-- CreateIndex
CREATE INDEX "CountryTranslation_countryId_idx" ON "CountryTranslation"("countryId");

-- CreateIndex
CREATE INDEX "CountryTranslation_locale_idx" ON "CountryTranslation"("locale");

-- CreateIndex
CREATE INDEX "CountryTranslation_name_idx" ON "CountryTranslation"("name");

-- CreateIndex
CREATE UNIQUE INDEX "CountryTranslation_locale_countryId_key" ON "CountryTranslation"("locale", "countryId");

-- CreateIndex
CREATE INDEX "Country_name_idx" ON "Country"("name");

-- CreateIndex
CREATE INDEX "Country_iso2_idx" ON "Country"("iso2");

-- CreateIndex
CREATE INDEX "Country_iso3_idx" ON "Country"("iso3");

-- CreateIndex
CREATE INDEX "Country_region_idx" ON "Country"("region");

-- CreateIndex
CREATE INDEX "Country_subregion_idx" ON "Country"("subregion");

-- CreateIndex
CREATE INDEX "Country_currency_idx" ON "Country"("currency");

-- CreateIndex
CREATE INDEX "State_countryId_idx" ON "State"("countryId");

-- CreateIndex
CREATE INDEX "State_name_idx" ON "State"("name");

-- CreateIndex
CREATE INDEX "State_stateCode_idx" ON "State"("stateCode");

-- CreateIndex
CREATE INDEX "State_countryId_name_idx" ON "State"("countryId", "name");

-- CreateIndex
CREATE INDEX "City_countryId_idx" ON "City"("countryId");

-- CreateIndex
CREATE INDEX "City_name_idx" ON "City"("name");

-- CreateIndex
CREATE INDEX "City_latitude_longitude_idx" ON "City"("latitude", "longitude");

-- CreateIndex
CREATE INDEX "District_cityId_idx" ON "District"("cityId");

-- CreateIndex
CREATE INDEX "CartItem_cartId_productId_variantId_idx" ON "CartItem"("cartId", "productId", "variantId");

-- CreateIndex
CREATE UNIQUE INDEX "CartItem_cartId_productId_variantId_key" ON "CartItem"("cartId", "productId", "variantId");

-- CreateIndex
CREATE INDEX "CartActivityLog_cartId_createdAt_idx" ON "CartActivityLog"("cartId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "CartActivityLog_cartItemId_idx" ON "CartActivityLog"("cartItemId");

-- CreateIndex
CREATE UNIQUE INDEX "CartPaymentCheckAttempts_cartId_key" ON "CartPaymentCheckAttempts"("cartId");

-- CreateIndex
CREATE INDEX "SliderItemSchema_isActive_idx" ON "SliderItemSchema"("isActive");

-- CreateIndex
CREATE INDEX "ProductListCarouselTranslation_productListCarouselId_idx" ON "ProductListCarouselTranslation"("productListCarouselId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductListCarouselTranslation_locale_productListCarouselId_key" ON "ProductListCarouselTranslation"("locale", "productListCarouselId");

-- CreateIndex
CREATE INDEX "ProductListCarouselItem_productListCarouselId_order_idx" ON "ProductListCarouselItem"("productListCarouselId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "ProductListCarouselItem_productListCarouselId_productId_var_key" ON "ProductListCarouselItem"("productListCarouselId", "productId", "variantId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductListCarouselItem_productListCarouselId_order_key" ON "ProductListCarouselItem"("productListCarouselId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "LayoutComponent_layoutId_order_key" ON "LayoutComponent"("layoutId", "order");

-- CreateIndex
CREATE INDEX "AddressSchema_userId_idx" ON "AddressSchema"("userId");

-- CreateIndex
CREATE INDEX "AddressSchema_countryId_idx" ON "AddressSchema"("countryId");

-- CreateIndex
CREATE INDEX "AddressSchema_stateId_idx" ON "AddressSchema"("stateId");

-- CreateIndex
CREATE INDEX "AddressSchema_cityId_idx" ON "AddressSchema"("cityId");

-- CreateIndex
CREATE UNIQUE INDEX "CountryDefaultSettings_countryId_key" ON "CountryDefaultSettings"("countryId");

-- CreateIndex
CREATE UNIQUE INDEX "Location_cargoZoneId_countryId_key" ON "Location"("cargoZoneId", "countryId");

-- CreateIndex
CREATE INDEX "CargoRule_ruleType_idx" ON "CargoRule"("ruleType");

-- CreateIndex
CREATE INDEX "Discount_startDate_endDate_idx" ON "Discount"("startDate", "endDate");

-- CreateIndex
CREATE UNIQUE INDEX "Coupon_code_key" ON "Coupon"("code");

-- CreateIndex
CREATE INDEX "Coupon_code_idx" ON "Coupon"("code");

-- CreateIndex
CREATE INDEX "Coupon_discountId_idx" ON "Coupon"("discountId");

-- CreateIndex
CREATE INDEX "DiscountTier_discountId_idx" ON "DiscountTier"("discountId");

-- CreateIndex
CREATE INDEX "DiscountConditionGroup_discountId_idx" ON "DiscountConditionGroup"("discountId");

-- CreateIndex
CREATE UNIQUE INDEX "DiscountUsage_orderId_key" ON "DiscountUsage"("orderId");

-- CreateIndex
CREATE INDEX "DiscountUsage_discountId_idx" ON "DiscountUsage"("discountId");

-- CreateIndex
CREATE INDEX "DiscountUsage_couponId_idx" ON "DiscountUsage"("couponId");

-- CreateIndex
CREATE INDEX "DiscountUsage_userId_idx" ON "DiscountUsage"("userId");

-- CreateIndex
CREATE INDEX "CampaignOffer_campaignId_idx" ON "CampaignOffer"("campaignId");

-- CreateIndex
CREATE INDEX "CampaignOffer_productId_idx" ON "CampaignOffer"("productId");

-- CreateIndex
CREATE INDEX "CampaignOffer_variantId_idx" ON "CampaignOffer"("variantId");

-- CreateIndex
CREATE UNIQUE INDEX "StorePaymentProvider_provider_key" ON "StorePaymentProvider"("provider");

-- CreateIndex
CREATE UNIQUE INDEX "OrderItemSchema_orderId_productId_variantId_key" ON "OrderItemSchema"("orderId", "productId", "variantId");

-- CreateIndex
CREATE UNIQUE INDEX "OrderSchema_orderNumber_key" ON "OrderSchema"("orderNumber");

-- CreateIndex
CREATE UNIQUE INDEX "OrderSchema_cartId_key" ON "OrderSchema"("cartId");

-- CreateIndex
CREATE INDEX "ErrorLog_context_idx" ON "ErrorLog"("context");

-- CreateIndex
CREATE INDEX "ErrorLog_createdAt_idx" ON "ErrorLog"("createdAt" DESC);

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_defaultAddressId_fkey" FOREIGN KEY ("defaultAddressId") REFERENCES "AddressSchema"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefreshTokens" ADD CONSTRAINT "RefreshTokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CategoryTranslation" ADD CONSTRAINT "CategoryTranslation_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_categoryGridComponentId_fkey" FOREIGN KEY ("categoryGridComponentId") REFERENCES "CategoryGridComponent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_parentCategoryId_fkey" FOREIGN KEY ("parentCategoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxonomyCategory" ADD CONSTRAINT "TaxonomyCategory_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "TaxonomyCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductCategory" ADD CONSTRAINT "ProductCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductCategory" ADD CONSTRAINT "ProductCategory_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrandTranslation" ADD CONSTRAINT "BrandTranslation_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Brand" ADD CONSTRAINT "Brand_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Brand" ADD CONSTRAINT "Brand_parentBrandId_fkey" FOREIGN KEY ("parentBrandId") REFERENCES "Brand"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VariantGroupTranslation" ADD CONSTRAINT "VariantGroupTranslation_variantGroupId_fkey" FOREIGN KEY ("variantGroupId") REFERENCES "VariantGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VariantOptionTranslation" ADD CONSTRAINT "VariantOptionTranslation_variantOptionId_fkey" FOREIGN KEY ("variantOptionId") REFERENCES "VariantOption"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VariantOption" ADD CONSTRAINT "VariantOption_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VariantOption" ADD CONSTRAINT "VariantOption_variantGroupId_fkey" FOREIGN KEY ("variantGroupId") REFERENCES "VariantGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductTranslation" ADD CONSTRAINT "ProductTranslation_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductPrice" ADD CONSTRAINT "ProductPrice_combinationId_fkey" FOREIGN KEY ("combinationId") REFERENCES "ProductVariantCombination"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductPrice" ADD CONSTRAINT "ProductPrice_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductAsset" ADD CONSTRAINT "ProductAsset_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductAsset" ADD CONSTRAINT "ProductAsset_combinationId_fkey" FOREIGN KEY ("combinationId") REFERENCES "ProductVariantCombination"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductAsset" ADD CONSTRAINT "ProductAsset_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductTagTranslation" ADD CONSTRAINT "ProductTagTranslation_productTagId_fkey" FOREIGN KEY ("productTagId") REFERENCES "ProductTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductTagOnProduct" ADD CONSTRAINT "ProductTagOnProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductTagOnProduct" ADD CONSTRAINT "ProductTagOnProduct_productTagId_fkey" FOREIGN KEY ("productTagId") REFERENCES "ProductTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_taxonomyCategoryId_fkey" FOREIGN KEY ("taxonomyCategoryId") REFERENCES "TaxonomyCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductVariantGroup" ADD CONSTRAINT "ProductVariantGroup_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductVariantGroup" ADD CONSTRAINT "ProductVariantGroup_variantGroupId_fkey" FOREIGN KEY ("variantGroupId") REFERENCES "VariantGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductVariantOption" ADD CONSTRAINT "ProductVariantOption_productVariantGroupId_fkey" FOREIGN KEY ("productVariantGroupId") REFERENCES "ProductVariantGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductVariantOption" ADD CONSTRAINT "ProductVariantOption_variantOptionId_fkey" FOREIGN KEY ("variantOptionId") REFERENCES "VariantOption"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductVariantCombination" ADD CONSTRAINT "ProductVariantCombination_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductVariantCombinationOption" ADD CONSTRAINT "ProductVariantCombinationOption_combinationId_fkey" FOREIGN KEY ("combinationId") REFERENCES "ProductVariantCombination"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductVariantCombinationOption" ADD CONSTRAINT "ProductVariantCombinationOption_productVariantOptionId_fkey" FOREIGN KEY ("productVariantOptionId") REFERENCES "ProductVariantOption"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductVariantTranslation" ADD CONSTRAINT "ProductVariantTranslation_combinationId_fkey" FOREIGN KEY ("combinationId") REFERENCES "ProductVariantCombination"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CountryTranslation" ADD CONSTRAINT "CountryTranslation_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "State" ADD CONSTRAINT "State_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "City" ADD CONSTRAINT "City_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "District" ADD CONSTRAINT "District_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "Cart"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariantCombination"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartActivityLog" ADD CONSTRAINT "CartActivityLog_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "Cart"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartActivityLog" ADD CONSTRAINT "CartActivityLog_cartItemId_fkey" FOREIGN KEY ("cartItemId") REFERENCES "CartItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cart" ADD CONSTRAINT "Cart_billingAddressId_fkey" FOREIGN KEY ("billingAddressId") REFERENCES "AddressSchema"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cart" ADD CONSTRAINT "Cart_cargoRuleId_fkey" FOREIGN KEY ("cargoRuleId") REFERENCES "CargoRule"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cart" ADD CONSTRAINT "Cart_shippingAddressId_fkey" FOREIGN KEY ("shippingAddressId") REFERENCES "AddressSchema"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cart" ADD CONSTRAINT "Cart_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartPaymentCheckAttempts" ADD CONSTRAINT "CartPaymentCheckAttempts_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "Cart"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FooterLinks" ADD CONSTRAINT "FooterLinks_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FooterLinks" ADD CONSTRAINT "FooterLinks_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FooterLinks" ADD CONSTRAINT "FooterLinks_footerLinkGroupId_fkey" FOREIGN KEY ("footerLinkGroupId") REFERENCES "FooterLinkGroups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FooterLinks" ADD CONSTRAINT "FooterLinks_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FooterLinkGroups" ADD CONSTRAINT "FooterLinkGroups_footerId_fkey" FOREIGN KEY ("footerId") REFERENCES "Footer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SliderItemSchema" ADD CONSTRAINT "SliderItemSchema_desktopAssetId_fkey" FOREIGN KEY ("desktopAssetId") REFERENCES "Asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SliderItemSchema" ADD CONSTRAINT "SliderItemSchema_mobileAssetId_fkey" FOREIGN KEY ("mobileAssetId") REFERENCES "Asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SliderItemSchema" ADD CONSTRAINT "SliderItemSchema_sliderSettingsId_fkey" FOREIGN KEY ("sliderSettingsId") REFERENCES "SliderSettings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductListCarouselTranslation" ADD CONSTRAINT "ProductListCarouselTranslation_productListCarouselId_fkey" FOREIGN KEY ("productListCarouselId") REFERENCES "ProductListCarousel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductListCarouselItem" ADD CONSTRAINT "ProductListCarouselItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductListCarouselItem" ADD CONSTRAINT "ProductListCarouselItem_productListCarouselId_fkey" FOREIGN KEY ("productListCarouselId") REFERENCES "ProductListCarousel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductListCarouselItem" ADD CONSTRAINT "ProductListCarouselItem_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariantCombination"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LayoutComponent" ADD CONSTRAINT "LayoutComponent_categoryGridComponentId_fkey" FOREIGN KEY ("categoryGridComponentId") REFERENCES "CategoryGridComponent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LayoutComponent" ADD CONSTRAINT "LayoutComponent_layoutId_fkey" FOREIGN KEY ("layoutId") REFERENCES "Layout"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LayoutComponent" ADD CONSTRAINT "LayoutComponent_marqueeId_fkey" FOREIGN KEY ("marqueeId") REFERENCES "MarqueeSchema"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LayoutComponent" ADD CONSTRAINT "LayoutComponent_productListCarouselId_fkey" FOREIGN KEY ("productListCarouselId") REFERENCES "ProductListCarousel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LayoutComponent" ADD CONSTRAINT "LayoutComponent_sliderId_fkey" FOREIGN KEY ("sliderId") REFERENCES "SliderSettings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AddressSchema" ADD CONSTRAINT "AddressSchema_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AddressSchema" ADD CONSTRAINT "AddressSchema_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AddressSchema" ADD CONSTRAINT "AddressSchema_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "District"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AddressSchema" ADD CONSTRAINT "AddressSchema_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "State"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AddressSchema" ADD CONSTRAINT "AddressSchema_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CountryDefaultSettings" ADD CONSTRAINT "CountryDefaultSettings_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Location" ADD CONSTRAINT "Location_cargoZoneId_fkey" FOREIGN KEY ("cargoZoneId") REFERENCES "CargoZone"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Location" ADD CONSTRAINT "Location_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CargoRule" ADD CONSTRAINT "CargoRule_cargoZoneId_fkey" FOREIGN KEY ("cargoZoneId") REFERENCES "CargoZone"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Coupon" ADD CONSTRAINT "Coupon_discountId_fkey" FOREIGN KEY ("discountId") REFERENCES "Discount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscountTier" ADD CONSTRAINT "DiscountTier_discountId_fkey" FOREIGN KEY ("discountId") REFERENCES "Discount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscountCustomer" ADD CONSTRAINT "DiscountCustomer_discountId_fkey" FOREIGN KEY ("discountId") REFERENCES "Discount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscountCustomer" ADD CONSTRAINT "DiscountCustomer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscountConditionGroup" ADD CONSTRAINT "DiscountConditionGroup_discountId_fkey" FOREIGN KEY ("discountId") REFERENCES "Discount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscountProduct" ADD CONSTRAINT "DiscountProduct_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "DiscountConditionGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscountProduct" ADD CONSTRAINT "DiscountProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscountCategory" ADD CONSTRAINT "DiscountCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscountCategory" ADD CONSTRAINT "DiscountCategory_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "DiscountConditionGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscountBrand" ADD CONSTRAINT "DiscountBrand_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscountBrand" ADD CONSTRAINT "DiscountBrand_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "DiscountConditionGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscountProductVariant" ADD CONSTRAINT "DiscountProductVariant_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "DiscountConditionGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscountProductVariant" ADD CONSTRAINT "DiscountProductVariant_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariantCombination"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscountUsage" ADD CONSTRAINT "DiscountUsage_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "Coupon"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscountUsage" ADD CONSTRAINT "DiscountUsage_discountId_fkey" FOREIGN KEY ("discountId") REFERENCES "Discount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscountUsage" ADD CONSTRAINT "DiscountUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignBuyableProduct" ADD CONSTRAINT "CampaignBuyableProduct_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignBuyableProduct" ADD CONSTRAINT "CampaignBuyableProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignBuyableVariant" ADD CONSTRAINT "CampaignBuyableVariant_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignBuyableVariant" ADD CONSTRAINT "CampaignBuyableVariant_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariantCombination"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignConditionProduct" ADD CONSTRAINT "CampaignConditionProduct_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignConditionProduct" ADD CONSTRAINT "CampaignConditionProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignConditionVariant" ADD CONSTRAINT "CampaignConditionVariant_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignConditionVariant" ADD CONSTRAINT "CampaignConditionVariant_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariantCombination"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignOffer" ADD CONSTRAINT "CampaignOffer_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignOffer" ADD CONSTRAINT "CampaignOffer_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignOffer" ADD CONSTRAINT "CampaignOffer_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariantCombination"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItemSchema" ADD CONSTRAINT "OrderItemSchema_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariantCombination"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItemSchema" ADD CONSTRAINT "OrderItemSchema_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItemSchema" ADD CONSTRAINT "OrderItemSchema_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "OrderSchema"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItemSchema" ADD CONSTRAINT "OrderItemSchema_shipmentId_fkey" FOREIGN KEY ("shipmentId") REFERENCES "Shipment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderSchema" ADD CONSTRAINT "OrderSchema_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "Cart"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderSchema" ADD CONSTRAINT "OrderSchema_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderSchema" ADD CONSTRAINT "OrderSchema_shippingAddressRecordId_fkey" FOREIGN KEY ("shippingAddressRecordId") REFERENCES "AddressSchema"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderSchema" ADD CONSTRAINT "OrderSchema_billingAddressRecordId_fkey" FOREIGN KEY ("billingAddressRecordId") REFERENCES "AddressSchema"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderSchema" ADD CONSTRAINT "OrderSchema_cargoRuleId_fkey" FOREIGN KEY ("cargoRuleId") REFERENCES "CargoRule"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderTransactionSchema" ADD CONSTRAINT "OrderTransactionSchema_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "OrderSchema"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shipment" ADD CONSTRAINT "Shipment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "OrderSchema"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
