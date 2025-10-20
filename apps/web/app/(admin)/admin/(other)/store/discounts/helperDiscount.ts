import { $Enums, MainDiscount } from "@repo/types";

export const safeTransformDiscountType = (
  currentValues: Partial<MainDiscount>,
  newType: $Enums.DiscountType
): Partial<MainDiscount> => {
  // Ortak alanlar - her zaman korunur
  const commonFields = {
    title: currentValues.title || "",
    isAllProducts: currentValues.isAllProducts ?? true,
    currencies: currentValues.currencies || ["TRY"],
    conditions: currentValues.conditions || null,
    allCustomers: currentValues?.allCustomers ?? true,
    otherCustomers: currentValues?.otherCustomers || null,
    addEndDate: currentValues?.addEndDate ?? false,
    startDate: currentValues?.startDate || null,
    coupons: currentValues?.coupons || [],
    endDate: currentValues?.endDate || null,
    addStartDate: currentValues?.addStartDate ?? false,
    isLimitPurchase: currentValues?.isLimitPurchase ?? false,
    minPurchaseAmount: currentValues?.minPurchaseAmount || null,
    maxPurchaseAmount: currentValues?.maxPurchaseAmount || null,
    isLimitItemQuantity: currentValues?.isLimitItemQuantity ?? false,
    minItemQuantity: currentValues?.minItemQuantity || null,
    maxItemQuantity: currentValues?.maxItemQuantity || null,
    allowDiscountedItems: currentValues?.allowDiscountedItems ?? false,
    allowedDiscountedItemsBy: currentValues?.allowedDiscountedItemsBy || null,
    isLimitTotalUsage: currentValues?.isLimitTotalUsage ?? false,
    isLimitTotalUsagePerCustomer:
      currentValues?.isLimitTotalUsagePerCustomer ?? false,
    mergeOtherCampaigns: currentValues?.mergeOtherCampaigns ?? false,
    totalUsageLimit: currentValues?.totalUsageLimit || null,
    totalUsageLimitPerCustomer:
      currentValues?.totalUsageLimitPerCustomer || null,
  };

  // Type'a göre sadece gerekli alanları ekle
  switch (newType) {
    case "PERCENTAGE":
      return {
        ...commonFields,
        type: "PERCENTAGE",
        discountValue: 0,
      };

    case "PERCENTAGE_GROW_QUANTITY":
      return {
        ...commonFields,
        type: "PERCENTAGE_GROW_QUANTITY",
        tiers: [],
      };

    case "PERCENTAGE_GROW_PRICE":
      return {
        ...commonFields,
        type: "PERCENTAGE_GROW_PRICE",
        tiers: [],
      };

    case "FIXED_AMOUNT":
      return {
        ...commonFields,
        type: "FIXED_AMOUNT",
        discountAmount: 0,
      };

    case "FIXED_AMOUNT_GROW_QUANTITY":
      return {
        ...commonFields,
        type: "FIXED_AMOUNT_GROW_QUANTITY",
        tiers: [],
      };

    case "FIXED_AMOUNT_GROW_PRICE":
      return {
        ...commonFields,
        type: "FIXED_AMOUNT_GROW_PRICE",
        tiers: [],
      };

    case "FREE_SHIPPING":
      return {
        ...commonFields,
        type: "FREE_SHIPPING",
      };

    case "BUY_X_GET_Y":
      return {
        ...commonFields,
        type: "BUY_X_GET_Y",
      };

    default:
      return {
        ...commonFields,
        type: newType,
      };
  }
};
