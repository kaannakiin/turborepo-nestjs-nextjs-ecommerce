import { useCartStore } from '@/context/cart-context/CartContext';
import { DataKeys } from '@lib/data-keys';
import fetchWrapper, { ApiError } from '@lib/wrappers/fetchWrapper';
import { recalculateCartTotals, useMutation, useQuery } from '@repo/shared';
import {
  AddCartItemZodType,
  CartContextUpdateResponse,
  CartType,
  ClearCartZodType,
  DecreaseCartItemQuantityZodType,
  IncreaseCartItemQuantityZodType,
  RemoveCartItemZodType,
  UpdateLocaleCartZodType,
} from '@repo/types';
import { useEffect } from 'react';

const cartApi = {
  get: async (): Promise<CartType> => {
    const response = await fetchWrapper.get<CartType>('/cart');
    if (!response.success) {
      const error = response as ApiError;
      throw new Error(error.error);
    }
    return response.data;
  },

  add: async (data: AddCartItemZodType): Promise<CartType> => {
    const response = await fetchWrapper.post<CartType>('/cart/add', data);
    if (!response.success) {
      const error = response as ApiError;
      throw new Error(error.error);
    }
    return response.data;
  },

  remove: async (data: RemoveCartItemZodType): Promise<CartType> => {
    const response = await fetchWrapper.post<CartType>('/cart/remove', data);
    if (!response.success) {
      const error = response as ApiError;
      throw new Error(error.error);
    }
    return response.data;
  },

  increase: async (
    data: IncreaseCartItemQuantityZodType,
  ): Promise<CartType> => {
    const response = await fetchWrapper.post<CartType>('/cart/increase', data);
    if (!response.success) {
      const error = response as ApiError;
      throw new Error(error.error);
    }
    return response.data;
  },

  decrease: async (
    data: DecreaseCartItemQuantityZodType,
  ): Promise<CartType> => {
    const response = await fetchWrapper.post<CartType>('/cart/decrease', data);
    if (!response.success) {
      const error = response as ApiError;
      throw new Error(error.error);
    }
    return response.data;
  },

  clear: async (data: ClearCartZodType): Promise<CartType> => {
    const response = await fetchWrapper.post<CartType>('/cart/clear', data);
    if (!response.success) {
      const error = response as ApiError;
      throw new Error(error.error);
    }
    return response.data;
  },

  updateContext: async (
    data: UpdateLocaleCartZodType,
  ): Promise<CartContextUpdateResponse> => {
    const response = await fetchWrapper.post<CartContextUpdateResponse>(
      '/cart/update-context',
      data,
    );
    if (!response.success) {
      const error = response as ApiError;
      throw new Error(error.error);
    }
    return response.data;
  },
};

export const useGetCart = () => {
  const setCart = useCartStore((state) => state.setCart);

  const query = useQuery({
    queryKey: DataKeys.cart.get,
    queryFn: cartApi.get,
  });

  useEffect(() => {
    if (query.data) {
      setCart(query.data);
    }
  }, [query.data, setCart]);

  return query;
};

export const useAddCartItem = () => {
  const setCart = useCartStore((state) => state.setCart);

  return useMutation({
    mutationKey: [DataKeys.cart.add],
    mutationFn: cartApi.add,
    onSuccess: (data) => {
      setCart(data);
    },
  });
};

export const useRemoveCartItem = () => {
  const cart = useCartStore((state) => state.cart);
  const setCart = useCartStore((state) => state.setCart);

  return useMutation({
    mutationKey: [DataKeys.cart.remove],
    mutationFn: cartApi.remove,
    onMutate: async (data) => {
      const previousCart = cart;
      if (cart) {
        const updatedItems = cart.items.filter(
          (item) => item.variantId !== data.itemId,
        );
        setCart(recalculateCartTotals(cart, updatedItems));
      }
      return { previousCart };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousCart) {
        setCart(context.previousCart);
      }
    },
    onSuccess: (data) => {
      setCart(data);
    },
  });
};

export const useIncreaseCartItemQuantity = () => {
  const cart = useCartStore((state) => state.cart);
  const setCart = useCartStore((state) => state.setCart);

  return useMutation({
    mutationKey: [DataKeys.cart.increase],
    mutationFn: cartApi.increase,
    onMutate: async (data) => {
      const previousCart = cart;
      if (cart) {
        const updatedItems = cart.items.map((item) =>
          item.variantId === data.itemId
            ? { ...item, quantity: item.quantity + data.quantity }
            : item,
        );
        setCart(recalculateCartTotals(cart, updatedItems));
      }
      return { previousCart };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousCart) {
        setCart(context.previousCart);
      }
    },
    onSuccess: (data) => {
      setCart(data);
    },
  });
};

export const useDecreaseCartItemQuantity = () => {
  const cart = useCartStore((state) => state.cart);
  const setCart = useCartStore((state) => state.setCart);

  return useMutation({
    mutationKey: [DataKeys.cart.decrease],
    mutationFn: cartApi.decrease,
    onMutate: async (data) => {
      const previousCart = cart;
      if (cart) {
        const updatedItems = cart.items.map((item) =>
          item.variantId === data.itemId
            ? { ...item, quantity: Math.max(1, item.quantity - data.quantity) }
            : item,
        );
        setCart(recalculateCartTotals(cart, updatedItems));
      }
      return { previousCart };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousCart) {
        setCart(context.previousCart);
      }
    },
    onSuccess: (data) => {
      setCart(data);
    },
  });
};

export const useClearCart = () => {
  const setCart = useCartStore((state) => state.setCart);

  return useMutation({
    mutationKey: [DataKeys.cart.clear],
    mutationFn: cartApi.clear,
    onSuccess: (data) => {
      setCart(data);
    },
  });
};

export const useUpdateCartContext = () => {
  const setCart = useCartStore((state) => state.setCart);

  return useMutation({
    mutationKey: [DataKeys.cart.updateContext],
    mutationFn: cartApi.updateContext,
    onSuccess: (data) => {
      setCart(data.cart);
    },
  });
};
