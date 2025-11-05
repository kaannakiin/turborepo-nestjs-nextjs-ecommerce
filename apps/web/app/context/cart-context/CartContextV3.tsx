"use client";

import { LOCALE_CART_COOKIE } from "@lib/constants";
import fetchWrapper, { ApiError } from "@lib/fetchWrapper";
import { createId, useMutation, useQuery } from "@repo/shared";
import {
  CartActionResponse,
  CartItemV3,
  CartV3,
  CartV3ContextType,
} from "@repo/types";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

const helperCart = (
  items: CartItemV3[]
): {
  totalPrice: number;
  totalDiscount: number;
  totalItems: number;
} => {
  const { totalPrice, totalDiscount } = items.reduce(
    (acc, item) => {
      const finalPrice = item.discountedPrice ?? item.price;
      const discountAmount = item.discountedPrice
        ? (item.price - item.discountedPrice) * item.quantity
        : 0;

      acc.totalPrice += finalPrice * item.quantity;
      acc.totalDiscount += discountAmount;
      return acc;
    },
    { totalPrice: 0, totalDiscount: 0 }
  );

  return {
    totalDiscount,
    totalItems: items.length,
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
      | "mergeCarts"
    >
  >(null);

export function CartProviderV3({ children }: { children: React.ReactNode }) {
  const [cartId, setCartId] = useState<string | null>(null);

  useEffect(() => {
    const storedCartId = localStorage.getItem(LOCALE_CART_COOKIE);
    if (storedCartId) {
      setCartId(storedCartId);
    }
  }, []);

  const setCartIdAndPersist = useCallback((newId: string | null) => {
    setCartId(newId);
    if (newId) {
      localStorage.setItem(LOCALE_CART_COOKIE, newId);
    } else {
      localStorage.removeItem(LOCALE_CART_COOKIE);
    }
  }, []);

  const {
    data: cart,
    isLoading,
    isFetching,
    isPending,
    isError,
    error,
  } = useQuery({
    queryKey: ["cart", cartId],
    queryFn: async () => {
      if (!cartId) return null; // 'cartId' state'i 'null' ise istek atma
      const res = await fetchWrapper.get<{ success: boolean; cart?: CartV3 }>(
        `/cart/${cartId}`
      );
      if (!res.success) {
        throw new Error("NetworkError: Failed to fetch cart");
      }
      if (!res.data.success || !res.data.cart) {
        throw new Error("NotFound: No cart data found from API");
      }
      return res.data.cart;
    },
    enabled: !!cartId,
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error.message.includes("No cart data found")) {
        return false;
      }
      return failureCount < 2;
    },
  });

  useEffect(() => {
    if (isError && error?.message.includes("NotFound")) {
      console.warn(
        "Cart query returned 404 (NotFound), clearing invalid cartId."
      );
      setCartIdAndPersist(null);
    }
  }, [isError, error, setCartIdAndPersist]);

  const isCartLoading = isLoading || isFetching || isPending;

  const increaseItemQuantity = useMutation({
    mutationFn: async (params: { productId: string; variantId?: string }) => {
      if (!cartId) {
        throw new Error("Cart not found. Please add item first.");
      }

      const updateRes = await fetchWrapper.post<CartActionResponse>(
        "/cart/increase-item",
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
      await context.client.cancelQueries({ queryKey: ["cart", cartId] });

      const previousCart = context.client.getQueryData<CartV3>([
        "cart",
        cartId,
      ]);

      context.client.setQueryData(
        ["cart", cartId],
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
          ["cart", cartId],
          onMutateResult.previousCart
        );
      }
    },
    onSuccess: (data, variables, onMutateResult, context) => {
      const newCartId = data.cartId;
      if (newCartId) {
        context.client.setQueryData(["cart", newCartId], data);
      }
    },
  });

  const decreaseItemQuantity = useMutation({
    mutationFn: async (params: { productId: string; variantId?: string }) => {
      const updateRes = await fetchWrapper.post<CartActionResponse>(
        "/cart/decrease-item",
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
      await context.client.cancelQueries({ queryKey: ["cart", cartId] });

      const previousCart = context.client.getQueryData<CartV3>([
        "cart",
        cartId,
      ]);

      context.client.setQueryData(
        ["cart", cartId],
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
          ["cart", cartId],
          onMutateResult.previousCart
        );
      }
    },
    onSuccess: (data, variables, onMutateResult, context) => {
      const newCartId = data.cartId;
      if (newCartId) {
        context.client.setQueryData(["cart", newCartId], data);
      }
    },
  });

  const removeItem = useMutation({
    mutationFn: async (params: { productId: string; variantId?: string }) => {
      const updateRes = await fetchWrapper.post<CartActionResponse>(
        "/cart/remove-item",
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
      await context.client.cancelQueries({ queryKey: ["cart", cartId] });
      const previousCart = context.client.getQueryData<CartV3>([
        "cart",
        cartId,
      ]);
      context.client.setQueryData(
        ["cart", cartId],
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
          ["cart", cartId],
          onMutateResult.previousCart
        );
      }
    },
    onSuccess: (data, variables, onMutateResult, context) => {
      const newCartId = data.cartId;
      if (newCartId) {
        context.client.setQueryData(["cart", newCartId], data);
      }
    },
  });

  const addNewItem = useMutation({
    mutationFn: async (params: CartItemV3) => {
      const updateRes = await fetchWrapper.post<CartActionResponse>(
        "/cart/add-item",
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
        setCartIdAndPersist(updateRes.data.newCart.cartId);
      }

      return updateRes.data.newCart;
    },

    onMutate: async (params, context) => {
      await context.client.cancelQueries({ queryKey: ["cart", cartId] });

      const previousCart = context.client.getQueryData<CartV3>([
        "cart",
        cartId,
      ]);

      context.client.setQueryData(
        ["cart", cartId],
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
          ["cart", cartId],
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
            queryKey: ["cart", oldCartId],
          });
        }

        setCartIdAndPersist(newCartId);
      }

      if (newCartId) {
        context.client.setQueryData(["cart", newCartId], data);
      }
    },
  });

  const clearCart = useMutation({
    mutationFn: async (cartId: string) => {
      const updateRes = await fetchWrapper.post<CartActionResponse>(
        `/cart/clear-cart/${cartId}`
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
      await context.client.cancelQueries({ queryKey: ["cart", cartId] });
      const previousCart = context.client.getQueryData<CartV3>([
        "cart",
        cartId,
      ]);
      context.client.setQueryData(
        ["cart", cartId],
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
          ["cart", cartId],
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
            queryKey: ["cart", oldCartId],
          });
        }
      }
      if (newCartId) {
        context.client.setQueryData(["cart", newCartId], data);
      }

      setCartIdAndPersist(null);
    },
  });

  const mergeCarts = useMutation({
    mutationFn: async (sourceCartId: string) => {
      const mergeRes = await fetchWrapper.get<CartActionResponse>(
        `/cart/merge-carts/${sourceCartId}`
      );
      if (!mergeRes.success) {
        const errorRes = mergeRes as ApiError;
        throw new Error(
          `Failed to merge carts: ${errorRes.error || "Unknown error"}`
        );
      }
      if (!mergeRes.data.success || !mergeRes.data.newCart) {
        throw new Error(mergeRes.data.message || "Failed to merge carts");
      }
      return mergeRes.data.newCart;
    },

    onError: (error) => {
      console.error("Cart merge failed:", error.message);
    },

    onSuccess: (newCart, sourceCartId, onMutateResult, context) => {
      const newCartId = newCart.cartId;
      if (newCartId && sourceCartId !== newCartId) {
        setCartIdAndPersist(newCartId);
        context.client.removeQueries({
          queryKey: ["cart", sourceCartId],
        });
        context.client.setQueryData(["cart", newCartId], newCart);
      } else if (newCartId) {
        context.client.setQueryData(["cart", newCartId], newCart);
      }
    },
  });

  return (
    <CartContextV3.Provider
      value={{
        cart,
        isCartLoading,
        addNewItem,
        increaseItemQuantity,
        decreaseItemQuantity,
        removeItem,
        clearCart,
        mergeCarts,
      }}
    >
      {children}
    </CartContextV3.Provider>
  );
}

export function useCartV3() {
  const context = useContext(CartContextV3);
  if (!context) {
    throw new Error("useCartV3 must be used within a CartProviderV3");
  }

  const {
    cart,
    isCartLoading,
    addNewItem,
    increaseItemQuantity,
    decreaseItemQuantity,
    removeItem,
    clearCart,
  } = context;

  return {
    cart,
    isCartLoading,
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

    clearCart: () => {
      if (cart?.cartId) {
        clearCart.mutate(cart.cartId);
      }
    },

    isAddingItem: addNewItem.isPending,
    isIncreasingItem: increaseItemQuantity.isPending,
    isDecreasingItem: decreaseItemQuantity.isPending,
    isRemovingItem: removeItem.isPending,

    isClearingCart: clearCart.isPending,

    isCartUpdating:
      addNewItem.isPending ||
      increaseItemQuantity.isPending ||
      decreaseItemQuantity.isPending ||
      removeItem.isPending ||
      clearCart.isPending,
  };
}
