"use client";

import { useCartV3 } from "@/context/cart-context/CartContextV3";

const ShoppingBagDrawerV2 = () => {
  const { addNewItem, cart } = useCartV3();
  return <div>{cart?.totalItems || 0}</div>;
};

export default ShoppingBagDrawerV2;
