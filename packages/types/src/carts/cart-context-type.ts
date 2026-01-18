import { CartType } from "./cart-prisma-types";

export interface CartState {
  cart: CartType | null;
}

export interface CartStoreActions {
  setCart: (cart: CartType | null) => void;
  clearCartState: () => void;
}

export type CartStore = CartState & CartStoreActions;
