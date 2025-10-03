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

  const handleAddToCart = async () => {
    // Eğer sepet varsa ve ürün sepette varsa
    if (cart) {
      const existingItem = cart.items.find((item) =>
        variantId ? item.variantId === variantId : item.productId === productId
      );

      if (existingItem) {
        // Ürün zaten sepette, miktarı artır
        await increaseItemQuantity({ itemId: existingItem.itemId });
      } else {
        // Ürün sepette yok, yeni ekle
        await addItem({
          productId,
          variantId,
          quantity: 1,
          whereAdded: "PRODUCT_PAGE",
          // cartId'yi kaldırdık çünkü context zaten kendi cartKey'ini kullanıyor
        });
      }
    } else {
      // Sepet yoksa yeni sepet oluştur ve ekle
      await addItem({
        productId,
        variantId,
        quantity: 1,
        whereAdded: "PRODUCT_PAGE",
      });
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

export default AddToCartButton;
