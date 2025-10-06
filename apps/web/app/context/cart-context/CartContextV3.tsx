"use client";

import GlobalLoadingOverlay from "@/components/GlobalLoadingOverlay";
import fetchWrapper from "@lib/fetchWrapper";
import { useLocalStorage } from "@mantine/hooks";
import { createId, useMutation, useQuery } from "@repo/shared";
import {
  CartActionResponseV3,
  CartItemV3,
  CartV3,
  CartV3ContextType,
} from "@repo/types";
import { createContext, useContext } from "react";

const helperCart = (
  items: CartItemV3[]
): {
  totalPrice: number;
  totalDiscount: number;
  totalItems: number;
} => {
  const totalPrice = items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  const totalDiscount = items.reduce((acc, item) => {
    if (item.discountedPrice) {
      return acc + (item.price - item.discountedPrice) * item.quantity;
    }
    return acc;
  }, 0);

  const totalItems: number = items.length;
  return {
    totalDiscount,
    totalItems,
    totalPrice,
  };
};

export const CartContextV3 = createContext<Pick<
  CartV3ContextType,
  "addNewItem" | "cart"
> | null>(null);

export function CartProviderV3({ children }: { children: React.ReactNode }) {
  const [cartId, setCartId] = useLocalStorage<string | null>({
    key: "cartIdV3",
    defaultValue: null,
  });
  const {
    data: cart,
    isLoading,
    isFetching,
    isPending,
  } = useQuery({
    queryKey: ["cart-v3", cartId],
    queryFn: async () => {
      if (!cartId) return null;

      const res = await fetchWrapper.get<CartV3>(`/cart-v3/${cartId}`);
      if (!res.success) {
        console.error("Failed to fetch cart:");
        throw new Error("Failed to fetch cart");
      }
      return res.data;
    },

    enabled: !!cartId,
    staleTime: 5 * 60 * 1000, // 5 dakika
  });

  const addNewItem = useMutation({
    mutationFn: async (params: CartItemV3) => {
      const updateRes = await fetchWrapper.post<CartActionResponseV3>(
        "/cart-v3/add-item",
        {
          body: JSON.stringify({ ...params, cartId }),
          method: "POST",
          credentials: "include",
        }
      );
      if (!updateRes.success) {
        throw new Error("Failed to add item to cart");
      }
      if (!updateRes.data.success || !updateRes.data.newCart) {
        throw new Error(updateRes.data.message || "Failed to add item to cart");
      }
      if (!cartId && updateRes.data.newCart.cartId) {
        setCartId(updateRes.data.newCart.cartId);
      }

      return updateRes.data.newCart;
    },

    onMutate: async (params, context) => {
      await context.client.cancelQueries({ queryKey: ["cart-v3", cartId] });

      const previousCart = context.client.getQueryData<CartV3>([
        "cart-v3",
        cartId,
      ]);

      context.client.setQueryData(
        ["cart-v3", cartId],
        (old: CartV3 | undefined): CartV3 => {
          // Durum 1: Cart yoksa (ilk item ekleniyor)
          if (!old || !old.items || old.items.length === 0) {
            const newCart: CartV3 = {
              cartId: cartId || createId(),
              items: [params],
              orderNote: "",
              ...helperCart([params]),
              currency: "TRY",
              locale: "TR",
              createdAt: new Date(),
              updatedAt: new Date(),
              lastActivityAt: new Date(),
            };
            return newCart;
          }

          const existingItemIndex = old.items.findIndex(
            (item) =>
              item.productId === params.productId &&
              item.variantId === params.variantId
          );

          if (existingItemIndex > -1) {
            const updatedItems = [...old.items];
            const existingItem = updatedItems[existingItemIndex];

            updatedItems[existingItemIndex] = {
              ...existingItem,
              quantity: existingItem.quantity + params.quantity,
              price: params.price,
              discountedPrice: params.discountedPrice,
            };

            const { totalPrice, totalDiscount, totalItems } =
              helperCart(updatedItems);

            return {
              ...old,
              items: updatedItems,
              totalPrice,
              totalDiscount,
              totalItems,
            };
          }

          const updatedItems = [...old.items, params];
          const { totalPrice, totalDiscount, totalItems } =
            helperCart(updatedItems);

          return {
            ...old,
            items: updatedItems,
            totalPrice,
            totalDiscount,
            totalItems,
          };
        }
      );

      return { previousCart };
    },

    onError: (err, newTodo, onMutateResult, context) => {
      if (onMutateResult?.previousCart) {
        context.client.setQueryData(
          ["cart-v3", cartId],
          onMutateResult.previousCart
        );
      }
    },

    onSuccess: (data, variables, onMutateResult, context) => {
      const newCartId = data.cartId;
      const oldCartId = onMutateResult?.previousCart?.cartId;

      // CartId değiştiyse (ilk item)
      if (newCartId && oldCartId !== newCartId) {
        // Eski cache temizle
        if (oldCartId) {
          context.client.removeQueries({
            queryKey: ["cart-v3", oldCartId],
          });
        }

        // Yeni cartId kaydet
        setCartId(newCartId);

        // Yeni cache set et
        context.client.setQueryData(["cart-v3", newCartId], data);
      } else if (newCartId) {
        // CartId aynı, sadece cache güncelle
        context.client.setQueryData(["cart-v3", newCartId], data);
      }
    },

    onSettled: (data, error, variables, onMutateResult, context) => {
      // Güncel cartId ile invalidate et
      const currentId = data?.cartId || cartId;
      if (currentId) {
        context?.client.invalidateQueries({
          queryKey: ["cart-v3", currentId],
        });
      }
    },
  });
  if (isLoading) {
    return <>loading</>;
  }
  return (
    <CartContextV3.Provider
      value={{
        addNewItem: async (params) => {
          try {
            const result = await addNewItem.mutateAsync(params);
            return { success: true, newCart: result };
          } catch (error) {
            return {
              success: false,
              message: error instanceof Error ? error.message : "Unknown error",
            };
          }
        },
        cart,
      }}
    >
      {children}
    </CartContextV3.Provider>
  );
}

export function useCartV3() {
  const context = useContext(CartContextV3);
  if (!context) {
    throw new Error("useCartV3 must be used within a CartProviderV2");
  }
  return context;
}
