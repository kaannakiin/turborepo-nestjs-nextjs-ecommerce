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
  const { increaseItemQuantity, addItem, cart } = useCartV2();
  return (
    <Button
      fullWidth
      onClick={async () => {
        if (cart) {
          const isItemInCart = cart.items.find((item) =>
            item.variantId
              ? item.variantId === variantId
              : item.productId === productId
          );
          if (isItemInCart) {
            await increaseItemQuantity({ itemId: isItemInCart.itemId });
          } else {
            await addItem({
              productId: productId,
              variantId,
              quantity,
              whereAdded: "PRODUCT_PAGE",
              cartId: cart.cartId,
            });
          }
        } else {
          await addItem({
            productId: productId,
            variantId,
            quantity,
            whereAdded: "PRODUCT_PAGE",
          });
        }
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
