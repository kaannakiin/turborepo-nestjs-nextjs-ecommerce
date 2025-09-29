"use client";

import { useCartV2 } from "@/context/cart-context/CartContextV2";
import { Button } from "@mantine/core";

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
  const { addItem } = useCartV2();
  return (
    <Button
      fullWidth
      onClick={async () => {
        await addItem({
          productId,
          variantId,
          quantity,
          whereAdded: "PRODUCT_PAGE",
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
