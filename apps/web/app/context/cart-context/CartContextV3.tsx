"use client";

import { LOCALE_CART_COOKIE } from "@lib/constants";
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

export const CartContextV3 =
  createContext<
    Pick<
      CartV3ContextType,
      | "addNewItem"
      | "cart"
      | "isCartLoading"
      | "increaseItemQuantity"
      | "decreaseItemQuantity"
      | "removeItem"
      | "clearCart"
    >
  >(null);

export function CartProviderV3({ children }: { children: React.ReactNode }) {
  const [cartId, setCartId] = useLocalStorage<string | null>({
    key: LOCALE_CART_COOKIE,
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

      const res = await fetchWrapper.get<{ success: boolean; cart?: CartV3 }>(
        `/cart-v3/${cartId}`
      );
      if (!res.success) {
        console.error("Failed to fetch cart:");
        localStorage.removeItem(LOCALE_CART_COOKIE);
        throw new Error("Failed to fetch cart");
      }
      if (!res.data.success || !res.data.cart) {
        localStorage.removeItem(LOCALE_CART_COOKIE);
        throw new Error("No cart data found");
      }
      return res.data.cart;
    },

    enabled: !!cartId,
    staleTime: 5 * 60 * 1000,
  });

  const isCartLoading = isLoading || isFetching || isPending;

  const increaseItemQuantity = useMutation({
    mutationFn: async (params: { productId: string; variantId?: string }) => {
      if (!cartId) {
        throw new Error("Cart not found. Please add item first.");
      }

      const updateRes = await fetchWrapper.post<CartActionResponseV3>(
        "/cart-v3/increase-item",
        {
          ...params,
          cartId,
        }
      );

      if (!updateRes.success) {
        throw new Error("Failed to increase item quantity");
      }

      if (!updateRes.data.success || !updateRes.data.newCart) {
        throw new Error(
          updateRes.data.message || "Failed to increase item quantity"
        );
      }

      return updateRes.data.newCart;
    },

    onMutate: async (
      params,
      context
    ): Promise<{ previousCart: CartV3 | null }> => {
      await context.client.cancelQueries({ queryKey: ["cart-v3", cartId] });

      const previousCart = context.client.getQueryData<CartV3>([
        "cart-v3",
        cartId,
      ]);

      context.client.setQueryData(
        ["cart-v3", cartId],
        (old: CartV3 | null): CartV3 | null => {
          if (!old) {
            throw new Error("Cart not found");
          }

          const existingItemIndex = old.items.findIndex(
            (item) =>
              item.productId === params.productId &&
              item.variantId === params.variantId
          );

          if (existingItemIndex === -1) {
            throw new Error("Item not found in cart");
          }

          const updatedItems = [...old.items];
          const existingItem = updatedItems[existingItemIndex];

          updatedItems[existingItemIndex] = {
            ...existingItem,
            quantity: existingItem.quantity + 1,
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
      );

      return { previousCart: previousCart || null };
    },

    onError: (err, variables, onMutateResult, context) => {
      if (onMutateResult?.previousCart) {
        context.client.setQueryData(
          ["cart-v3", cartId],
          onMutateResult.previousCart
        );
      }
    },
    onSuccess: (data, variables, onMutateResult, context) => {
      const newCartId = data.cartId;
      if (newCartId) {
        context.client.setQueryData(["cart-v3", newCartId], data);
      }
    },
  });

  const decreaseItemQuantity = useMutation({
    mutationFn: async (params: { productId: string; variantId?: string }) => {
      const updateRes = await fetchWrapper.post<CartActionResponseV3>(
        "/cart-v3/decrease-item",
        {
          ...params,
          cartId,
        }
      );

      if (!updateRes.success) {
        throw new Error("Failed to decrease item quantity");
      }

      if (!updateRes.data.success || !updateRes.data.newCart) {
        throw new Error(
          updateRes.data.message || "Failed to decrease item quantity"
        );
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
          if (!old) {
            throw new Error("Cart not found");
          }

          const updatedItemIndex = old.items.findIndex(
            (item) =>
              item.productId === params.productId &&
              item.variantId === params.variantId
          );

          if (updatedItemIndex === -1) {
            throw new Error("Item not found in cart");
          }

          const existingItem = old.items[updatedItemIndex];

          if (existingItem.quantity <= 1) {
            const updatedItems = old.items.filter(
              (_, idx) => idx !== updatedItemIndex
            );
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

          const updatedItems = [...old.items];
          updatedItems[updatedItemIndex] = {
            ...existingItem,
            quantity: existingItem.quantity - 1,
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
      );

      return { previousCart };
    },

    onError: (err, variables, onMutateResult, context) => {
      if (onMutateResult?.previousCart) {
        context.client.setQueryData(
          ["cart-v3", cartId],
          onMutateResult.previousCart
        );
      }
    },

    onSuccess: (data, variables, onMutateResult, context) => {
      const newCartId = data.cartId;
      if (newCartId) {
        context.client.setQueryData(["cart-v3", newCartId], data);
      }
    },
  });

  const removeItem = useMutation({
    mutationFn: async (params: { productId: string; variantId?: string }) => {
      const updateRes = await fetchWrapper.post<CartActionResponseV3>(
        "/cart-v3/remove-item",
        {
          ...params,
          cartId,
        }
      );
      if (!updateRes.success) {
        throw new Error("Failed to remove item from cart");
      }
      if (!updateRes.data.success || !updateRes.data.newCart) {
        throw new Error(
          updateRes.data.message || "Failed to remove item from cart"
        );
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
          if (!old) {
            throw new Error("Cart not found");
          }
          const existingItemIndex = old.items.findIndex(
            (item) =>
              item.productId === params.productId &&
              item.variantId === params.variantId
          );
          if (existingItemIndex === -1) {
            throw new Error("Item not found in cart");
          }
          const updatedItems = old.items.filter(
            (_, idx) => idx !== existingItemIndex
          );
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

    onError: (err, variables, onMutateResult, context) => {
      if (onMutateResult?.previousCart) {
        context.client.setQueryData(
          ["cart-v3", cartId],
          onMutateResult.previousCart
        );
      }
    },

    onSuccess: (data, variables, onMutateResult, context) => {
      const newCartId = data.cartId;
      if (newCartId) {
        context.client.setQueryData(["cart-v3", newCartId], data);
      }
    },
  });

  const addNewItem = useMutation({
    mutationFn: async (params: CartItemV3) => {
      const updateRes = await fetchWrapper.post<CartActionResponseV3>(
        "/cart-v3/add-item",
        {
          ...params,
          cartId,
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

      if (newCartId && oldCartId !== newCartId) {
        if (oldCartId) {
          context.client.removeQueries({
            queryKey: ["cart-v3", oldCartId],
          });
        }
        setCartId(newCartId);
      }

      if (newCartId) {
        context.client.setQueryData(["cart-v3", newCartId], data);
      }
    },
  });

  const clearCart = useMutation({
    mutationFn: async (cartId: string) => {
      const updateRes = await fetchWrapper.post<CartActionResponseV3>(
        `/cart-v3/clear-cart/${cartId}`
      );
      if (!updateRes.success) {
        throw new Error("Failed to clear cart");
      }
      if (!updateRes.data.success || !updateRes.data.newCart) {
        throw new Error(updateRes.data.message || "Failed to clear cart");
      }
      return updateRes.data.newCart;
    },
    onMutate: async (cartId, context) => {
      await context.client.cancelQueries({ queryKey: ["cart-v3", cartId] });
      const previousCart = context.client.getQueryData<CartV3>([
        "cart-v3",
        cartId,
      ]);
      context.client.setQueryData(
        ["cart-v3", cartId],
        (old: CartV3 | undefined): null => {
          if (!old) {
            throw new Error("Cart not found");
          }
          return null;
        }
      );
      return { previousCart };
    },
    onError: (err, variables, onMutateResult, context) => {
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
      if (newCartId && oldCartId !== newCartId) {
        if (oldCartId) {
          context.client.removeQueries({
            queryKey: ["cart-v3", oldCartId],
          });
        }
      }
      if (newCartId) {
        context.client.setQueryData(["cart-v3", newCartId], data);
      }
      setCartId(null);
    },
  });

  return (
    <CartContextV3.Provider
      value={{
        cart,
        isCartLoading,
        // refreshCart: refetch,
        addNewItem,
        increaseItemQuantity,
        decreaseItemQuantity,
        removeItem,
        // updateItemQuantity,
        clearCart,
        // mergeCarts,
        // setOrderNote,
      }}
    >
      {children}
    </CartContextV3.Provider>
  );
}

// CartContextV3.tsx (en alttaki hook)

export function useCartV3() {
  const context = useContext(CartContextV3);
  if (!context) {
    throw new Error("useCartV3 must be used within a CartProviderV3");
  }

  const {
    cart,
    isCartLoading,
    addNewItem, // Bu artık 'UseMutationResult' objesi
    increaseItemQuantity, // Bu da öyle
    decreaseItemQuantity,
    removeItem,
    clearCart,
  } = context;

  return {
    cart,
    isCartLoading,
    // refreshCart,

    addNewItem: (params: CartItemV3) => {
      addNewItem.mutate(params);
    },

    increaseItem: (productId: string, variantId?: string) => {
      increaseItemQuantity.mutate({ productId, variantId });
    },

    decreaseItem: (productId: string, variantId?: string) => {
      decreaseItemQuantity.mutate({ productId, variantId });
    },

    removeItem: (productId: string, variantId?: string) => {
      removeItem.mutate({ productId, variantId });
    },

    // updateItemQuantity: (
    //   productId: string,
    //   quantity: number,
    //   variantId?: string
    // ) => {
    //   updateItemQuantity.mutate({ productId, quantity, variantId });
    // },

    clearCart: () => {
      if (cart?.cartId) {
        clearCart.mutate(cart.cartId);
      }
    },

    // Yüklenme durumları (UI'da spinner göstermek için)
    isAddingItem: addNewItem.isPending,
    isIncreasingItem: increaseItemQuantity.isPending,
    isDecreasingItem: decreaseItemQuantity.isPending,
    isRemovingItem: removeItem.isPending,
    // isUpdatingQuantity: updateItemQuantity.isPending,
    isClearingCart: clearCart.isPending,

    // Genel bir güncelleme durumu
    isCartUpdating:
      addNewItem.isPending ||
      increaseItemQuantity.isPending ||
      decreaseItemQuantity.isPending ||
      removeItem.isPending ||
      // updateItemQuantity.isPending ||
      clearCart.isPending,
  };
}
