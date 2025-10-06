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
  const { addNewItem, cart } = useCartV3();
  const handleAddToCart = async () => {
    if (cart) {
      const existingItem = cart.items.find(
        (item) => item.variantId === variantId && item.productId === productId
      );
      if (existingItem) {
        console.log("Item already in cart");
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
      AddToCartButtonV2
    </Button>
  );
};

export default AddToCartButtonV2;
