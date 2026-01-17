'use client';

import { useCartStore } from '@/context/cart-context/CartContext';
import { useAddCartItem } from '@hooks/useCart';
import { Button, ButtonProps } from '@mantine/core';
import { WhereAdded } from '@repo/database/client';

interface AddCartButtonProps extends Omit<ButtonProps, 'onClick'> {
  itemId: string;
  whereAdded: WhereAdded;
  quantity: number;
}

const AddCartButton = ({
  itemId,
  whereAdded,
  quantity,
  ...props
}: AddCartButtonProps) => {
  const { isPending, data, mutate, isSuccess } = useAddCartItem();
  const cart = useCartStore((store) => store.cart);

  return (
    <Button
      onClick={() => {
        mutate({ itemId, whereAdded, quantity });
      }}
      {...props}
    >
      Sepete Ekle
    </Button>
  );
};

export default AddCartButton;
