"use client";

import { useCartV3 } from "@/context/cart-context/CartContextV3";
import { Button } from "@mantine/core";
import { CartItemV3 } from "@repo/types";

interface AddToCartButtonV2Props {
  data: CartItemV3;
}
const AddToCartButtonV2 = ({
  data: { productId, variantId, ...rest },
}: AddToCartButtonV2Props) => {
  const { addNewItem, cart, increaseItemQuantity } = useCartV3();
  const handleAddToCart = async () => {
    if (cart) {
      const existingItem = cart.items.find(
        (item) => item.variantId === variantId && item.productId === productId
      );
      if (existingItem) {
        await increaseItemQuantity(
          existingItem.productId,
          existingItem.variantId || undefined
        );
      } else {
        await addNewItem({ productId, variantId, quantity: 1, ...rest });
      }
    } else {
      await addNewItem({ productId, variantId, quantity: 1, ...rest });
    }
  };

  return (
    <Button
      key={`${productId}-${variantId || "default"}`}
      fullWidth
      onClick={handleAddToCart}
      radius="xl"
      size="lg"
      variant="filled"
    >
      Sepete Ekle
    </Button>
  );
};

export default AddToCartButtonV2;
