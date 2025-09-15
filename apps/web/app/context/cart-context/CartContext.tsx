"use client ";
import { useLocalStorage } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import {
  $Enums,
  AddCartItemToCartBodyType,
  CartContextType,
  CartType,
} from "@repo/types";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { fetchWrapper } from "../../../lib/fetchWrapper";

export const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartType | null>(null);
  const [cartId, setCartId] = useLocalStorage<string | null>({
    key: "cartId",
    defaultValue: null,
  });

  useEffect(() => {
    const loadCart = async () => {
      if (cartId) {
        try {
          const response = await fetchWrapper.get(
            `/cart/user-get-cart/${cartId}`,
            {
              credentials: "include",
              cache: "no-store",
            }
          );

          if (response.success && response.data) {
            setCart(response.data as CartType);
          }
        } catch (error) {
          console.error("Cart loading error:", error);
          setCartId(null);
        }
      }
    };

    loadCart();
  }, [cartId, setCartId]);

  const addItem = useCallback(
    async (data: AddCartItemToCartBodyType): Promise<CartType> => {
      try {
        // Eğer cartId varsa data'ya ekle
        const requestData = {
          ...data,
          cartId: cartId || undefined,
        };

        const addItemRes = await fetchWrapper.post(
          `/cart/add-item-to-cart`,
          JSON.stringify(requestData),
          {
            credentials: "include",
            cache: "no-store",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!addItemRes.success || !addItemRes.data) {
          throw new Error(
            addItemRes.message || "Sepete eklenirken bir hata oluştu"
          );
        }

        const updatedCart = addItemRes.data as CartType;

        // Cart ID'yi localStorage'a kaydet (yeni cart oluşturulduysa)
        if (!cartId && updatedCart.cartId) {
          setCartId(updatedCart.cartId);
        }

        // State'i güncelle
        setCart(updatedCart);

        notifications.show({
          title: "Başarılı",
          message: "Ürün sepete eklendi",
          position: "bottom-right",
          color: "green",
          autoClose: 2000,
        });

        return updatedCart;
      } catch (error) {
        notifications.show({
          title: "Hata",
          message:
            error instanceof Error
              ? error.message
              : "Sepete eklenirken bir hata oluştu",
          position: "bottom-right",
          color: "red",
          autoClose: 3000,
        });

        // Fallback cart return et
        return (
          cart || {
            cartId: "",
            userId: null,
            totalItems: 0,
            createdAt: new Date(),
            currency: "TRY" as $Enums.Currency,
            locale: "TR" as $Enums.Locale,
            items: [],
            totalDiscount: 0,
            totalPrice: 0,
            totalDiscountedPrice: 0,
          }
        );
      }
    },
    [cartId, setCartId, cart]
  );

  const removeItem = useCallback(
    async (
      data: Pick<
        AddCartItemToCartBodyType,
        "cartId" | "productId" | "variantId" | "quantity"
      >
    ): Promise<CartType | null> => {
      if (!cartId) {
        notifications.show({
          title: "Hata",
          message: "Sepet bulunamadı",
          position: "bottom-right",
          color: "red",
          autoClose: 3000,
        });
        return null;
      }

      try {
        const requestData = {
          ...data,
          cartId,
          quantity: data.quantity, // Negatif quantity ile azaltma
        };

        const removeItemRes = await fetchWrapper.post(
          `/cart/increment-item-or-delete-item`,
          JSON.stringify(requestData),
          {
            credentials: "include",
            cache: "no-store",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!removeItemRes.success) {
          throw new Error(
            removeItemRes.message || "Ürün silinirken bir hata oluştu"
          );
        }

        const updatedCart = removeItemRes.data as CartType;
        setCart(updatedCart);

        notifications.show({
          title: "Başarılı",
          message: "Ürün sepetten çıkarıldı",
          position: "bottom-right",
          color: "green",
          autoClose: 2000,
        });

        return updatedCart;
      } catch (error) {
        console.error("Remove item error:", error);
        notifications.show({
          title: "Hata",
          message:
            error instanceof Error
              ? error.message
              : "Ürün silinirken bir hata oluştu",
          position: "bottom-right",
          color: "red",
          autoClose: 3000,
        });
        return cart;
      }
    },
    [cartId, cart]
  );

  const clearCart = useCallback(async (): Promise<null> => {
    if (!cartId) return null;

    try {
      await fetchWrapper.post(
        `/cart/clear-cart`,
        JSON.stringify({ data: cartId }),
        {
          credentials: "include",
          cache: "no-store",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      setCart(null);
      setCartId(null);

      notifications.show({
        title: "Başarılı",
        message: "Sepet temizlendi",
        position: "bottom-right",
        color: "green",
        autoClose: 2000,
      });

      return null;
    } catch (error) {
      notifications.show({
        title: "Hata",
        message: "Sepet temizlenirken bir hata oluştu",
        position: "bottom-right",
        color: "red",
        autoClose: 3000,
      });
      return null;
    }
  }, [cartId, setCartId]);

  const switchLocale = useCallback(
    async (locale: $Enums.Locale): Promise<CartType | null> => {
      if (!cartId) return cart;

      try {
        const switchRes = await fetchWrapper.post(
          `/cart/switch-cart-locale/${cartId}/${locale}`,
          JSON.stringify({ cartId, locale }),
          {
            credentials: "include",
            cache: "no-store",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!switchRes.success || !switchRes.data) {
          throw new Error(
            switchRes.message || "Dil değiştirilirken bir hata oluştu"
          );
        }

        const updatedCart = switchRes.data as CartType;
        setCart(updatedCart);

        notifications.show({
          title: "Başarılı",
          message: "Dil başarıyla değiştirildi",
          position: "bottom-right",
          color: "green",
          autoClose: 2000,
        });

        return updatedCart;
      } catch (error) {
        notifications.show({
          title: "Hata",
          message:
            error instanceof Error
              ? error.message
              : "Dil değiştirilirken bir hata oluştu",
          position: "bottom-right",
          color: "red",
          autoClose: 3000,
        });
        return cart;
      }
    },
    [cartId, cart]
  );

  const switchCurrency = useCallback(
    async (currency: $Enums.Currency): Promise<CartType | null> => {
      if (!cartId) return cart;

      try {
        const switchRes = await fetchWrapper.post(
          `/cart/switch-cart-currency/${cartId}/${currency}`,
          JSON.stringify({ cartId, currency }),
          {
            credentials: "include",
            cache: "no-store",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!switchRes.success || !switchRes.data) {
          throw new Error(
            switchRes.message || "Para birimi değiştirilirken bir hata oluştu"
          );
        }

        const updatedCart = switchRes.data as CartType;
        setCart(updatedCart);

        notifications.show({
          title: "Başarılı",
          message: "Para birimi başarıyla değiştirildi",
          position: "bottom-right",
          color: "green",
          autoClose: 2000,
        });

        return updatedCart;
      } catch (error) {
        notifications.show({
          title: "Hata",
          message:
            error instanceof Error
              ? error.message
              : "Para birimi değiştirilirken bir hata oluştu",
          position: "bottom-right",
          color: "red",
          autoClose: 3000,
        });
        return cart;
      }
    },
    [cartId, cart]
  );

  const contextValue: CartContextType = {
    addItem,
    removeItem,
    clearCart,
    switchLocale,
    switchCurrency,
    cart,
  };

  return (
    <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>
  );
}

// Custom hook to use cart context
export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

// Helper functions
export function useCartHelpers() {
  const { cart } = useCart();

  return {
    isEmpty: !cart || cart.items.length === 0,
    itemCount: cart?.totalItems || 0,
    subtotal: cart?.totalPrice || 0,
    totalSavings: cart?.totalDiscount || 0,
    findItem: (productId: string, variantId: string | null) => {
      return cart?.items.find(
        (item) => item.productId === productId && item.variantId === variantId
      );
    },
    hasItem: (productId: string, variantId: string | null) => {
      return (
        cart?.items.some(
          (item) => item.productId === productId && item.variantId === variantId
        ) || false
      );
    },
    getItemQuantity: (productId: string, variantId: string | null) => {
      return (
        cart?.items.find(
          (item) => item.productId === productId && item.variantId === variantId
        )?.quantity || 0
      );
    },
  };
}
