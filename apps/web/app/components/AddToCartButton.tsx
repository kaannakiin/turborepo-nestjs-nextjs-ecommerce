"use client";

import { Button } from "@mantine/core";
import { useCart } from "../context/cart-context/CartContext";

interface AddToCartButtonProps {
  productId: string;
  variantId?: string;
  quantity?: number;
}

const AddToCartButton = ({
  productId,
  variantId,
  quantity = 1,
}: AddToCartButtonProps) => {
  const { addItem } = useCart();
  return (
    <Button
      fullWidth
      onClick={async () => {
        await addItem({
          productId,
          variantId,
          quantity,
          cartId: null,
          userId: null,
        });
      }}
      radius={"xl"}
      size="lg"
      variant="filled"
    >
      Sepete Ekle
    </Button>
  );
};

export default AddToCartButton;
