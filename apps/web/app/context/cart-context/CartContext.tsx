'use client';

import { CartStore } from '@repo/types';
import { create } from 'zustand';

export const useCartStore = create<CartStore>((set) => ({
  cart: null,
  setCart: (cart) => set({ cart }),
  clearCartState: () => set({ cart: null }),
}));
