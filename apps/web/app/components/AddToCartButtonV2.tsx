"use client";

import { useCartV3 } from "@/context/cart-context/CartContextV3";
import { Button, ButtonProps } from "@mantine/core";
import { CartItemV3 } from "@repo/types";

interface AddToCartButtonV2Props {
  data: CartItemV3;
  props?: Omit<ButtonProps, "onClick">;
}

const AddToCartButtonV2 = ({
  data: { productId, variantId, ...rest },
  props = {
    fullWidth: true,
    radius: "xl",
    size: "lg",
    variant: "filled",
  },
}: AddToCartButtonV2Props) => {
  const { addNewItem, cart, increaseItem } = useCartV3();
  const handleAddToCart = () => {
    if (cart) {
      const existingItem = cart.items.find(
        (item) => item.variantId === variantId && item.productId === productId
      );

      if (existingItem) {
        increaseItem(
          existingItem.productId,
          existingItem.variantId || undefined
        );
      } else {
        addNewItem({ productId, variantId, quantity: 1, ...rest });
      }
    } else {
      addNewItem({ productId, variantId, quantity: 1, ...rest });
    }
  };

  return (
    <Button
      key={`${productId}-${variantId || "default"}`}
      onClick={handleAddToCart}
      {...props}
    >
      Sepete Ekle
    </Button>
  );
};

export default AddToCartButtonV2;
