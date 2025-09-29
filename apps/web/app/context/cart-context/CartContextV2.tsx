"use client";
import { LOCALE_CART_COOKIE } from "@lib/constants";
import { useLocalStorage } from "@mantine/hooks";
import { useQuery, useQueryClient } from "@repo/shared";
import {
  AddItemToCartV2,
  CartActionResponse,
  CartContextCartType,
  CartContextTypeV2,
  ItemIdOnlyParams,
} from "@repo/types";
import { createContext, ReactNode, useContext } from "react";

export const CartContextV2 = createContext<CartContextTypeV2 | null>(null);

export const CartProviderV2 = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();
  const [cartKey, setCartKey] = useLocalStorage<string | null>({
    key: LOCALE_CART_COOKIE,
    defaultValue: null,
  });

  const { data: cart } = useQuery({
    queryKey: ["get-cart-v2", cartKey],
    queryFn: async () => {
      if (!cartKey) return null;

      const cartReq = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/cart-v2/get-cart-v2/${cartKey}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (!cartReq?.ok) {
        setCartKey(null);
        return null;
      }

      const cartData = (await cartReq.json()) as CartActionResponse;

      if (!cartData.success || !cartData.newCart) {
        setCartKey(null);
        return null;
      }

      return cartData.newCart;
    },
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    enabled: !!cartKey,
  });

  // Helper function for recalculating cart totals
  const recalculateCartTotals = (
    items: CartContextCartType["items"],
    taxTotal: number = 0
  ) => {
    const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
    const subTotalPrice = items.reduce(
      (sum, i) => sum + (i.discountedPrice || i.price) * i.quantity,
      0
    );
    const totalDiscount = items.reduce(
      (sum, i) => sum + (i.price - (i.discountedPrice || i.price)) * i.quantity,
      0
    );
    const totalPrice = subTotalPrice + taxTotal;

    return { totalItems, subTotalPrice, totalDiscount, totalPrice };
  };

  const addItemToCart = async (
    params: AddItemToCartV2
  ): Promise<CartActionResponse> => {
    queryClient.setQueryData(
      ["get-cart-v2", cartKey],
      (oldCart: CartContextCartType | null): CartContextCartType | null => {
        if (!oldCart) return oldCart;

        // Aynı ürün var mı kontrol et
        const existingItemIndex = oldCart.items.findIndex(
          (i) =>
            i.productId === params.productId && i.variantId === params.variantId
        );

        // SADECE var olan item'sa optimistic update yap
        if (existingItemIndex !== -1) {
          const updatedItems = oldCart.items.map((i, idx) =>
            idx === existingItemIndex
              ? { ...i, quantity: i.quantity + params.quantity }
              : i
          );

          const totals = recalculateCartTotals(updatedItems, oldCart.taxTotal);

          return {
            ...oldCart,
            items: updatedItems,
            ...totals,
            lastActivityAt: new Date(),
          };
        }

        // Yeni item ise, optimistic update yapma - backend'i bekle
        return oldCart;
      }
    );

    try {
      const addItemReq = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/cart-v2/add-item`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...params,
            ...(cartKey ? { cartId: cartKey } : {}),
          }),
        }
      );

      if (!addItemReq?.ok) {
        await queryClient.invalidateQueries({
          queryKey: ["get-cart-v2", cartKey],
        });
        return {
          success: false,
          message: "Ürün sepete eklenirken bir hata oluştu",
        };
      }

      const addItemData = (await addItemReq.json()) as CartActionResponse;

      if (addItemData.success && addItemData.newCart) {
        queryClient.setQueryData(["get-cart-v2", cartKey], addItemData.newCart);
      }

      return addItemData;
    } catch (error) {
      await queryClient.invalidateQueries({
        queryKey: ["get-cart-v2", cartKey],
      });
      return {
        success: false,
        message: "Bir hata oluştu",
      };
    }
  };

  const increaseItemQuantity = async (
    params: ItemIdOnlyParams
  ): Promise<CartActionResponse> => {
    // Optimistic update
    queryClient.setQueryData(
      ["get-cart-v2", cartKey],
      (oldCart: CartContextCartType | null): CartContextCartType | null => {
        if (!oldCart) return oldCart;

        const updatedItem = oldCart.items.find(
          (i) => i.itemId === params.itemId
        );
        if (!updatedItem) return oldCart;

        const updatedItems = oldCart.items.map((i) =>
          i.itemId === params.itemId ? { ...i, quantity: i.quantity + 1 } : i
        );

        const totals = recalculateCartTotals(updatedItems, oldCart.taxTotal);

        return {
          ...oldCart,
          items: updatedItems,
          ...totals,
          lastActivityAt: new Date(),
        };
      }
    );

    try {
      const increaseReq = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/cart-v2/increase-item-quantity/${cartKey}`,
        {
          method: "POST",
          body: JSON.stringify(params),
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!increaseReq?.ok) {
        await queryClient.invalidateQueries({
          queryKey: ["get-cart-v2", cartKey],
        });
        return {
          success: false,
          message: "Adet artırılırken bir hata oluştu",
        };
      }

      const increaseData = (await increaseReq.json()) as CartActionResponse;

      if (increaseData.success && increaseData.newCart) {
        queryClient.setQueryData(
          ["get-cart-v2", cartKey],
          increaseData.newCart
        );
      }

      return increaseData;
    } catch (error) {
      await queryClient.invalidateQueries({
        queryKey: ["get-cart-v2", cartKey],
      });
      return {
        success: false,
        message: "Bir hata oluştu",
      };
    }
  };

  const decreaseItemQuantity = async (
    params: ItemIdOnlyParams
  ): Promise<CartActionResponse> => {
    // Optimistic update
    queryClient.setQueryData(
      ["get-cart-v2", cartKey],
      (oldCart: CartContextCartType | null): CartContextCartType | null => {
        if (!oldCart) return oldCart;

        const updatedItem = oldCart.items.find(
          (i) => i.itemId === params.itemId
        );
        if (!updatedItem) return oldCart;

        let updatedItems: CartContextCartType["items"];

        if (updatedItem.quantity <= 1) {
          // Quantity 1'se kaldır
          updatedItems = oldCart.items.filter(
            (i) => i.itemId !== params.itemId
          );
        } else {
          // Değilse azalt
          updatedItems = oldCart.items.map((i) =>
            i.itemId === params.itemId ? { ...i, quantity: i.quantity - 1 } : i
          );
        }

        const totals = recalculateCartTotals(updatedItems, oldCart.taxTotal);

        return {
          ...oldCart,
          items: updatedItems,
          ...totals,
          lastActivityAt: new Date(),
        };
      }
    );

    try {
      const decreaseReq = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/cart-v2/decrease-item-quantity/${cartKey}`,
        {
          method: "POST",
          body: JSON.stringify(params),
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!decreaseReq?.ok) {
        await queryClient.invalidateQueries({
          queryKey: ["get-cart-v2", cartKey],
        });
        return {
          success: false,
          message: "Adet azaltılırken bir hata oluştu",
        };
      }

      const decreaseData = (await decreaseReq.json()) as CartActionResponse;

      if (decreaseData.success && decreaseData.newCart) {
        queryClient.setQueryData(
          ["get-cart-v2", cartKey],
          decreaseData.newCart
        );
      }

      return decreaseData;
    } catch (error) {
      await queryClient.invalidateQueries({
        queryKey: ["get-cart-v2", cartKey],
      });
      return {
        success: false,
        message: "Bir hata oluştu",
      };
    }
  };

  const removeItem = async (
    params: ItemIdOnlyParams
  ): Promise<CartActionResponse> => {
    // Optimistic update
    queryClient.setQueryData(
      ["get-cart-v2", cartKey],
      (oldCart: CartContextCartType | null): CartContextCartType | null => {
        if (!oldCart) return oldCart;

        const filteredItems = oldCart.items.filter(
          (i) => i.itemId !== params.itemId
        );

        const totals = recalculateCartTotals(filteredItems, oldCart.taxTotal);

        return {
          ...oldCart,
          items: filteredItems,
          ...totals,
          lastActivityAt: new Date(),
        };
      }
    );

    try {
      const removeItemReq = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/cart-v2/remove-item/${cartKey}`,
        {
          method: "POST",
          body: JSON.stringify(params),
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!removeItemReq?.ok) {
        await queryClient.invalidateQueries({
          queryKey: ["get-cart-v2", cartKey],
        });
        return {
          success: false,
          message: "Ürün silinirken bir hata oluştu",
        };
      }

      const removeItemData = (await removeItemReq.json()) as CartActionResponse;

      if (removeItemData.success && removeItemData.newCart) {
        queryClient.setQueryData(
          ["get-cart-v2", cartKey],
          removeItemData.newCart
        );
      }

      return removeItemData;
    } catch (error) {
      await queryClient.invalidateQueries({
        queryKey: ["get-cart-v2", cartKey],
      });
      return {
        success: false,
        message: "Bir hata oluştu",
      };
    }
  };

  const clearCart = async (): Promise<CartActionResponse> => {
    // Optimistic update
    queryClient.setQueryData(
      ["get-cart-v2", cartKey],
      (oldCart: CartContextCartType | null): CartContextCartType | null => {
        if (!oldCart) return oldCart;

        return {
          ...oldCart,
          items: [],
          totalItems: 0,
          subTotalPrice: 0,
          totalDiscount: 0,
          totalPrice: oldCart.taxTotal,
          lastActivityAt: new Date(),
        };
      }
    );

    try {
      const clearCartReq = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/cart-v2/clear-cart/${cartKey}`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!clearCartReq?.ok) {
        await queryClient.invalidateQueries({
          queryKey: ["get-cart-v2", cartKey],
        });
        return {
          success: false,
          message: "Sepet temizlenirken bir hata oluştu",
        };
      }

      const clearCartData = (await clearCartReq.json()) as CartActionResponse;

      if (clearCartData.success && clearCartData.newCart) {
        queryClient.setQueryData(
          ["get-cart-v2", cartKey],
          clearCartData.newCart
        );
      }

      return clearCartData;
    } catch (error) {
      await queryClient.invalidateQueries({
        queryKey: ["get-cart-v2", cartKey],
      });
      return {
        success: false,
        message: "Bir hata oluştu",
      };
    }
  };

  const updateOrderNote = async (note: string): Promise<CartActionResponse> => {
    try {
      const updateNoteReq = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/cart-v2/update-order-note/${cartKey}`,
        {
          method: "POST",
          body: JSON.stringify({ note }),
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!updateNoteReq?.ok) {
        await queryClient.invalidateQueries({
          queryKey: ["get-cart-v2", cartKey],
        });
        return {
          success: false,
          message: "Not güncellenirken bir hata oluştu",
        };
      }

      const updateNoteData = (await updateNoteReq.json()) as CartActionResponse;

      if (updateNoteData.success && updateNoteData.newCart) {
        queryClient.setQueryData(
          ["get-cart-v2", cartKey],
          updateNoteData.newCart
        );
      }

      return updateNoteData;
    } catch (error) {
      await queryClient.invalidateQueries({
        queryKey: ["get-cart-v2", cartKey],
      });
      return {
        success: false,
        message: "Bir hata oluştu",
      };
    }
  };

  return (
    <CartContextV2.Provider
      value={{
        addItem: addItemToCart,
        cart: cart || null,
        increaseItemQuantity,
        decreaseItemQuantity,
        removeItem,
        clearCart,
        updateOrderNote,
      }}
    >
      {children}
    </CartContextV2.Provider>
  );
};

export function useCartV2() {
  const context = useContext(CartContextV2);
  if (!context) {
    throw new Error("useCartV2 must be used within a CartProviderV2");
  }
  return context;
}
