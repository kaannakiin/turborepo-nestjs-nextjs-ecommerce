'use client';
import {
  getProductImageForCart,
  getProductSlugForCart,
} from '../../lib/product-helper';
import PriceFormatter from '@/(user)/components/PriceFormatter';
import { useCartStore } from '@/context/cart-context/CartContext';
import { useTheme } from '@/context/theme-context/ThemeContext';
import {
  useDecreaseCartItemQuantity,
  useGetCart,
  useIncreaseCartItemQuantity,
  useRemoveCartItem,
} from '@hooks/useCart';
import { CartLoadingSkeleton } from './skeletons/CartLoadingSkeleton';
import {
  ActionIcon,
  AspectRatio,
  Box,
  Button,
  Drawer,
  Group,
  Indicator,
  ScrollArea,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconMinus,
  IconPlus,
  IconShoppingBag,
  IconShoppingBagX,
  IconTrash,
} from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import Image from './Image';

const CartDrawer = () => {
  const cart = useCartStore((state) => state.cart);
  const { isLoading, isFetching } = useGetCart();
  const [opened, { close, toggle }] = useDisclosure();

  const showSkeleton = isLoading || (isFetching && !cart);
  const isEmpty = !cart || cart.items.length === 0;
  const { actualMedia: media } = useTheme();
  const { push } = useRouter();

  const decreaseItemMutation = useDecreaseCartItemQuantity();
  const increaseItemMutation = useIncreaseCartItemQuantity();
  const removeItemMutation = useRemoveCartItem();

  return (
    <>
      <Indicator
        inline
        label={cart?.totalProducts || 0}
        size={20}
        offset={2}
        withBorder={false}
        className="cursor-pointer"
        disabled={!cart || cart.items.length === 0}
        onClick={toggle}
      >
        <IconShoppingBag size={28} color="var(--mantine-primary-color-5)" />
      </Indicator>
      <Drawer.Root
        position="left"
        size={media === 'mobile' || media === 'tablet' ? 'lg' : 'md'}
        opened={opened}
        onClose={close}
        styles={{
          root: { overflowY: 'hidden' },
          content: {
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
          },
          body: {
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 1,
            height: 'calc(100vh - 60px)',
          },
        }}
        removeScrollProps={{
          allowPinchZoom: true,
        }}
      >
        <Drawer.Overlay />
        <Drawer.Content className="overflow-y-hidden">
          <Drawer.Header className="border-b border-b-(--mantine-color-dimmed) ">
            <Drawer.Title fz={'h3'} fw={700}>
              Sepet
            </Drawer.Title>
            <Drawer.CloseButton />
          </Drawer.Header>

          <Drawer.Body px={0} py={'lg'}>
            {showSkeleton ? (
              <CartLoadingSkeleton />
            ) : isEmpty ? (
              <Stack
                align="center"
                justify="center"
                gap="lg"
                style={{
                  height: 'calc(100% - 115px)',
                  textAlign: 'center',
                }}
                px="md"
              >
                <IconShoppingBagX
                  size={64}
                  color="var(--mantine-color-gray-6)"
                />
                <Stack gap="sm" align="center">
                  <Title order={4} c="dimmed">
                    Sepetiniz Boş
                  </Title>
                  <Text size="sm" c="dimmed" maw={300}>
                    Sepetinize henüz bir ürün eklenmedi. Alışverişe devam etmek
                    için ürünleri keşfedin.
                  </Text>
                </Stack>
                <Button onClick={close} variant="light" size="md">
                  Alışverişe Devam Et
                </Button>
              </Stack>
            ) : (
              <>
                <ScrollArea.Autosize
                  className="max-w-full w-full"
                  type="scroll"
                  py={'md'}
                  style={{ height: 'calc(100% - 115px)' }}
                  scrollbars="y"
                  scrollbarSize={6}
                  px={'xs'}
                >
                  <Stack gap={'lg'}>
                    {cart.items.map((item) => {
                      const price = item.variant.prices[0];
                      const productName =
                        item.variant.product.translations[0]?.name || '';
                      const productSlug = getProductSlugForCart(item);
                      const productImage = getProductImageForCart(item);

                      return (
                        <Group
                          key={item.id}
                          align="flex-start"
                          className="cursor-pointer"
                          justify="flex-start"
                          gap={'xs'}
                          py={0}
                          px={0}
                          onClick={() => {
                            close();
                            push(`/${productSlug}`);
                          }}
                          h={'100%'}
                        >
                          <AspectRatio
                            ratio={1}
                            pos={'relative'}
                            className="h-full"
                            w={100}
                          >
                            {productImage ? (
                              <Image
                                src={productImage}
                                alt={productName}
                                className="rounded-md"
                              />
                            ) : null}
                          </AspectRatio>
                          <Group
                            justify="space-between"
                            className="flex-1 h-full"
                            align="flex-start"
                            wrap="nowrap"
                          >
                            <div className="flex flex-col gap-1">
                              <Title order={5}>{productName}</Title>
                              {item.variant.options.length > 0 && (
                                <Group>
                                  {item.variant.options.map((vo) => (
                                    <Text
                                      tt={'capitalize'}
                                      fz={'sm'}
                                      fw={700}
                                      key={vo.productVariantOption.id}
                                    >
                                      {
                                        vo.productVariantOption.variantOption
                                          .variantGroup?.translations?.[0]?.name
                                      }
                                      :{' '}
                                      {
                                        vo.productVariantOption.variantOption
                                          .translations?.[0]?.name
                                      }
                                    </Text>
                                  ))}
                                </Group>
                              )}
                            </div>
                            <div className="flex flex-col justify-between h-full gap-1">
                              <Group
                                gap={'xs'}
                                justify="center"
                                h={'100%'}
                                align="center"
                                wrap="nowrap"
                              >
                                <ActionIcon
                                  variant="transparent"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (item.quantity > 1) {
                                      decreaseItemMutation.mutate({
                                        itemId: item.variantId,
                                        quantity: 1,
                                      });
                                    } else {
                                      removeItemMutation.mutate({
                                        itemId: item.variantId,
                                      });
                                    }
                                  }}
                                  size={'md'}
                                  c={item.quantity > 1 ? 'primary' : 'red'}
                                >
                                  {item.quantity > 1 ? (
                                    <IconMinus size={16} />
                                  ) : (
                                    <IconTrash size={16} />
                                  )}
                                </ActionIcon>
                                <Text fz={'sm'} fw={700}>
                                  {item.quantity}
                                </Text>
                                <ActionIcon
                                  variant="transparent"
                                  size={'md'}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    increaseItemMutation.mutate({
                                      itemId: item.variantId,
                                      quantity: 1,
                                    });
                                  }}
                                >
                                  <IconPlus size={16} />
                                </ActionIcon>
                              </Group>

                              <Stack gap="xs" align="flex-end">
                                {price?.discountedPrice &&
                                price.discountedPrice < price.price ? (
                                  <>
                                    <PriceFormatter
                                      size="sm"
                                      td="line-through"
                                      c="dimmed"
                                      ta="end"
                                      price={price.price * item.quantity}
                                    />
                                    <PriceFormatter
                                      size="md"
                                      fw={700}
                                      ta={'end'}
                                      price={
                                        price.discountedPrice * item.quantity
                                      }
                                    />
                                  </>
                                ) : (
                                  <PriceFormatter
                                    size="md"
                                    fw={700}
                                    ta={'end'}
                                    price={
                                      price ? price.price * item.quantity : 0
                                    }
                                  />
                                )}
                              </Stack>
                            </div>
                          </Group>
                        </Group>
                      );
                    })}
                  </Stack>
                </ScrollArea.Autosize>

                <Box
                  className="sticky bottom-0 border-t border-t-(--mantine-color-dimmed) bg-white flex flex-col gap-3"
                  px={'xs'}
                  py={'lg'}
                >
                  <Group
                    align="center"
                    className="w-full"
                    justify="space-between"
                    px={'xs'}
                  >
                    <Text fz={'md'} fw={500} c={'dimmed'}>
                      {cart.totalDiscount > 0 ? 'Ara Toplam' : 'Toplam'}
                    </Text>
                    <Stack gap="xs" align="flex-end">
                      <PriceFormatter
                        fz={'md'}
                        fw={500}
                        c={'dimmed'}
                        price={cart.totalAmount}
                      />
                    </Stack>
                  </Group>

                  {cart.totalDiscount > 0 && (
                    <Group
                      align="center"
                      className="w-full"
                      justify="space-between"
                      px={'xs'}
                    >
                      <Text fz={'md'} fw={500} c={'dimmed'}>
                        İndirim
                      </Text>
                      <Stack gap="xs" align="flex-end">
                        <PriceFormatter
                          fz={'md'}
                          fw={500}
                          c={'dimmed'}
                          price={cart.totalDiscount}
                        />
                      </Stack>
                    </Group>
                  )}

                  {cart.totalDiscount > 0 && (
                    <Group
                      align="center"
                      className="w-full"
                      justify="space-between"
                      px={'xs'}
                    >
                      <Text fz={'md'} fw={500} c={'dimmed'}>
                        Toplam
                      </Text>
                      <Stack gap="xs" align="flex-end">
                        <PriceFormatter
                          fz={'md'}
                          fw={500}
                          c={'dimmed'}
                          price={cart.totalAmount - cart.totalDiscount}
                        />
                      </Stack>
                    </Group>
                  )}
                  <Button
                    fullWidth
                    onClick={() => {
                      close();
                      push('/cart');
                    }}
                    variant="outline"
                    size="md"
                    radius={'xl'}
                  >
                    Sepete Git
                  </Button>
                  <Button
                    fullWidth
                    radius={'xl'}
                    size="md"
                    onClick={() => {
                      close();
                      push(`/checkout${cart?.cartId ? `/${cart.cartId}` : ''}`);
                    }}
                  >
                    Ödeme Yap
                  </Button>
                </Box>
              </>
            )}
          </Drawer.Body>
        </Drawer.Content>
      </Drawer.Root>
    </>
  );
};

export default CartDrawer;
