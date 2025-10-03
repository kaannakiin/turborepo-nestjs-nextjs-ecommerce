"use client";
import { LOCALE_CART_COOKIE } from "@lib/constants";
import fetchWrapper from "@lib/fetchWrapper";
import { useLocalStorage } from "@mantine/hooks";
import { useQuery, useQueryClient } from "@repo/shared";
import {
  AddItemToCartV2,
  CartActionResponse,
  CartContextCartItemType,
  CartContextCartType,
  CartContextTypeV2,
  ItemIdOnlyParams,
} from "@repo/types";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

export const CartContextV2 = createContext<CartContextTypeV2 | null>(null);

export const CartProviderV2 = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();
  const [lastAddedItem, setLastAddedItem] =
    useState<CartContextCartItemType | null>(null);
  const [popoverOpened, setPopoverOpened] = useState(false);

  const [cartKey, setCartKey] = useLocalStorage<string | null>({
    key: LOCALE_CART_COOKIE,
    defaultValue: null,
  });

  useEffect(() => {
    if (popoverOpened && lastAddedItem) {
      const timer = setTimeout(() => {
        setPopoverOpened(false);
        setLastAddedItem(null);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [popoverOpened, lastAddedItem]);

  const closePopover = () => {
    setPopoverOpened(false);
    setTimeout(() => setLastAddedItem(null), 300);
  };

  // ✅ GET CART - FetchWrapper ile
  const { data: cart } = useQuery({
    queryKey: ["get-cart-v2", cartKey],
    queryFn: async () => {
      if (!cartKey) return null;

      const response = await fetchWrapper.get<CartActionResponse>(
        `/cart-v2/get-cart-v2/${cartKey}`
      );

      if (!response.success || !response.data.newCart) {
        setCartKey(null);
        return null;
      }

      return response.data.newCart;
    },
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    enabled: !!cartKey,
  });

  const recalculateCartTotals = (
    items: CartContextCartType["items"],
    taxTotal: number = 0
  ) => {
    const subTotalPrice = items.reduce(
      (sum, i) => sum + (i.discountedPrice || i.price) * i.quantity,
      0
    );
    const totalDiscount = items.reduce(
      (sum, i) => sum + (i.price - (i.discountedPrice || i.price)) * i.quantity,
      0
    );
    const totalPrice = subTotalPrice + taxTotal;

    return {
      totalItems: items.length,
      subTotalPrice,
      totalDiscount,
      totalPrice,
    };
  };

  const addItemToCart = async (
    params: AddItemToCartV2
  ): Promise<CartActionResponse> => {
    const existingItem = cart?.items.find(
      (i) =>
        i.productId === params.productId && i.variantId === params.variantId
    );

    if (existingItem) {
      queryClient.setQueryData(
        ["get-cart-v2", cartKey],
        (oldCart: CartContextCartType | null): CartContextCartType | null => {
          if (!oldCart) return oldCart;

          const updatedItems = oldCart.items.map((i) =>
            i.itemId === existingItem.itemId
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
      );
    }

    try {
      const response = await fetchWrapper.post<CartActionResponse>(
        "/cart-v2/add-item",
        {
          body: JSON.stringify({
            ...params,
            ...(cartKey ? { cartId: cartKey } : {}),
          }),
        }
      );

      if (!response.success) {
        await queryClient.invalidateQueries({
          queryKey: ["get-cart-v2", cartKey],
        });
        return {
          success: false,
          message: "Ürün sepete eklenirken bir hata oluştu",
        };
      }

      const addItemData = response.data;

      if (addItemData.success && addItemData.newCart) {
        const newCartId = addItemData.newCart.cartId;
        const addedItem = addItemData.newCart.items.find(
          (i) =>
            i.productId === params.productId && i.variantId === params.variantId
        );

        if (addedItem) {
          setLastAddedItem(addedItem);
          setPopoverOpened(true);
        }

        // Gerçek data'yı set et
        queryClient.setQueryData(
          ["get-cart-v2", newCartId],
          addItemData.newCart
        );

        if (cartKey !== newCartId || !cartKey) {
          setCartKey(newCartId);

          if (cartKey && cartKey !== newCartId) {
            queryClient.removeQueries({ queryKey: ["get-cart-v2", cartKey] });
          }
        }
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

  // ✅ INCREASE QUANTITY - FetchWrapper ile
  const increaseItemQuantity = async (
    params: ItemIdOnlyParams
  ): Promise<CartActionResponse> => {
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
      const response = await fetchWrapper.post<CartActionResponse>(
        `/cart-v2/increase-item-quantity/${cartKey}`,
        {
          body: JSON.stringify(params),
        }
      );

      if (!response.success) {
        await queryClient.invalidateQueries({
          queryKey: ["get-cart-v2", cartKey],
        });
        return {
          success: false,
          message: "Adet artırılırken bir hata oluştu",
        };
      }

      const increaseData = response.data;

      if (increaseData.success && increaseData.newCart) {
        const newCartId = increaseData.newCart.cartId;
        queryClient.setQueryData(
          ["get-cart-v2", newCartId],
          increaseData.newCart
        );

        if (cartKey !== newCartId) {
          setCartKey(newCartId);
          if (cartKey) {
            queryClient.removeQueries({ queryKey: ["get-cart-v2", cartKey] });
          }
        }
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

  // ✅ DECREASE QUANTITY - FetchWrapper ile
  const decreaseItemQuantity = async (
    params: ItemIdOnlyParams
  ): Promise<CartActionResponse> => {
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
          updatedItems = oldCart.items.filter(
            (i) => i.itemId !== params.itemId
          );
        } else {
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
      const response = await fetchWrapper.post<CartActionResponse>(
        `/cart-v2/decrease-item-quantity/${cartKey}`,
        {
          body: JSON.stringify(params),
        }
      );

      if (!response.success) {
        await queryClient.invalidateQueries({
          queryKey: ["get-cart-v2", cartKey],
        });
        return {
          success: false,
          message: "Adet azaltılırken bir hata oluştu",
        };
      }

      const decreaseData = response.data;

      if (decreaseData.success && decreaseData.newCart) {
        const newCartId = decreaseData.newCart.cartId;
        queryClient.setQueryData(
          ["get-cart-v2", newCartId],
          decreaseData.newCart
        );

        if (cartKey !== newCartId) {
          setCartKey(newCartId);
          if (cartKey) {
            queryClient.removeQueries({ queryKey: ["get-cart-v2", cartKey] });
          }
        }
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

  // ✅ REMOVE ITEM - FetchWrapper ile
  const removeItem = async (
    params: ItemIdOnlyParams
  ): Promise<CartActionResponse> => {
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
      const response = await fetchWrapper.post<CartActionResponse>(
        `/cart-v2/remove-item/${cartKey}`,
        {
          body: JSON.stringify(params),
        }
      );

      if (!response.success) {
        await queryClient.invalidateQueries({
          queryKey: ["get-cart-v2", cartKey],
        });
        return {
          success: false,
          message: "Ürün silinirken bir hata oluştu",
        };
      }

      const removeItemData = response.data;

      if (removeItemData.success && removeItemData.newCart) {
        const newCartId = removeItemData.newCart.cartId;
        queryClient.setQueryData(
          ["get-cart-v2", newCartId],
          removeItemData.newCart
        );

        if (cartKey !== newCartId) {
          setCartKey(newCartId);
          if (cartKey) {
            queryClient.removeQueries({ queryKey: ["get-cart-v2", cartKey] });
          }
        }
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

  // ✅ CLEAR CART - FetchWrapper ile
  const clearCart = async (): Promise<CartActionResponse> => {
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
      const response = await fetchWrapper.post<CartActionResponse>(
        `/cart-v2/clear-cart/${cartKey}`
      );

      if (!response.success) {
        await queryClient.invalidateQueries({
          queryKey: ["get-cart-v2", cartKey],
        });
        return {
          success: false,
          message: "Sepet temizlenirken bir hata oluştu",
        };
      }

      const clearCartData = response.data;

      if (clearCartData.success && clearCartData.newCart) {
        const newCartId = clearCartData.newCart.cartId;
        queryClient.setQueryData(
          ["get-cart-v2", newCartId],
          clearCartData.newCart
        );

        if (cartKey !== newCartId) {
          setCartKey(newCartId);
          if (cartKey) {
            queryClient.removeQueries({ queryKey: ["get-cart-v2", cartKey] });
          }
        }
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

  // ✅ UPDATE ORDER NOTE - FetchWrapper ile
  const updateOrderNote = async (note: string): Promise<CartActionResponse> => {
    try {
      const response = await fetchWrapper.post<CartActionResponse>(
        `/cart-v2/update-order-note/${cartKey}`,
        {
          body: JSON.stringify({ note }),
        }
      );

      if (!response.success) {
        await queryClient.invalidateQueries({
          queryKey: ["get-cart-v2", cartKey],
        });
        return {
          success: false,
          message: "Not güncellenirken bir hata oluştu",
        };
      }

      const updateNoteData = response.data;

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

  // ✅ MERGE CARTS - FetchWrapper ile
  const mergeCarts = async (): Promise<CartActionResponse> => {
    if (!cartKey) {
      return {
        success: false,
        message: "Sepet bulunamadı",
      };
    }

    try {
      const response = await fetchWrapper.post<CartActionResponse>(
        "/cart-v2/merge-carts",
        {
          body: JSON.stringify({ cartId: cartKey }),
        }
      );

      if (!response.success) {
        return {
          success: false,
          message: "Sepet birleştirilirken bir hata oluştu",
        };
      }

      const mergeData = response.data;

      if (mergeData.success && mergeData.newCart) {
        const newCartId = mergeData.newCart.cartId;

        setCartKey(newCartId);

        queryClient.setQueryData(["get-cart-v2", newCartId], mergeData.newCart);

        if (cartKey !== newCartId) {
          queryClient.removeQueries({ queryKey: ["get-cart-v2", cartKey] });
        }
      }

      return mergeData;
    } catch (error) {
      console.error("Merge error:", error);
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
        mergeCarts,
        closePopover,
        lastAddedItem,
        popoverOpened,
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
