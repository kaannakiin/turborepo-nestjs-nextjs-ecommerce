import type { CartItemWithVariant, CartType } from "@repo/types";

export const recalculateCartTotals = (
  cart: CartType,
  items: CartItemWithVariant[],
): CartType => {
  let totalItems = 0;
  let totalAmount = 0;
  let totalDiscount = 0;

  for (const item of items) {
    totalItems += item.quantity;

    const price = item.variant.prices[0];
    if (price) {
      const itemTotal = price.price * item.quantity;
      totalAmount += itemTotal;

      if (price.discountedPrice && price.discountedPrice < price.price) {
        const discountPerItem = price.price - price.discountedPrice;
        totalDiscount += discountPerItem * item.quantity;
      }
    }
  }

  return {
    ...cart,
    items,
    totalItems,
    totalAmount,
    totalDiscount,
    totalProducts: items.length,
  };
};
