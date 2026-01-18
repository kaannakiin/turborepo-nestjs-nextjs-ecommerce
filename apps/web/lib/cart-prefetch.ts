import { cache } from 'react';
import { cookies } from 'next/headers';
import { ApiError, createServerFetch } from '@lib/wrappers/fetchWrapper';
import type { CartType } from '@repo/types';

export const getCartData = cache(async () => {
  try {
    const cookieStore = await cookies();
    const api = createServerFetch().setCookies(cookieStore);

    const response = await api.get<CartType>('/cart');

    if (response.success) {
      return response.data;
    }

    const error = response as ApiError;

    console.error('Cart fetch failed:', error.error);
    return null;
  } catch (error) {
    console.error('Cart fetch error:', error);
    return null;
  }
});
