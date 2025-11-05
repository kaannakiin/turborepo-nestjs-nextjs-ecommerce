"use client";
import { useTheme } from "@/(admin)/admin/(theme)/ThemeContexts/ThemeContext";
import ProductPriceFormatter from "@/(user)/components/ProductPriceFormatter";
import { useCartV3 } from "@/context/cart-context/CartContextV3";
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
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconMinus,
  IconPlus,
  IconShoppingBag,
  IconShoppingBagX,
  IconTrash,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import CustomImage from "./CustomImage";

const ShoppingBagDrawerV2 = () => {
  const [opened, { close, toggle }] = useDisclosure();
  const { cart, decreaseItem, increaseItem, removeItem } = useCartV3();
  const isEmpty = !cart || cart.items.length === 0;
  const { media } = useTheme();
  const { push } = useRouter();

  return (
    <>
      <Indicator
        inline
        label={cart?.items.length}
        size={20}
        offset={2}
        withBorder={false}
        className="cursor-pointer"
        disabled={!cart}
        onClick={toggle}
      >
        <IconShoppingBag size={28} color="var(--mantine-primary-color-5)" />
      </Indicator>
      <Drawer.Root
        position="left"
        size={media === "mobile" || media === "tablet" ? "lg" : "md"}
        opened={opened}
        onClose={close}
        styles={{
          root: { overflowY: "hidden" },
          content: {
            display: "flex",
            flexDirection: "column",
            height: "100vh",
          },
          body: {
            display: "flex",
            flexDirection: "column",
            flexGrow: 1,
            height: "calc(100vh - 60px)",
          },
        }}
        removeScrollProps={{
          allowPinchZoom: true,
        }}
      >
        <Drawer.Overlay />
        <Drawer.Content className="overflow-y-hidden">
          <Drawer.Header className="border-b border-b-[var(--mantine-color-dimmed)] ">
            <Drawer.Title fz={"h3"} fw={700}>
              Sepet
            </Drawer.Title>
            <Drawer.CloseButton />
          </Drawer.Header>

          <Drawer.Body px={0} py={"lg"}>
            {isEmpty ? (
              <Stack
                align="center"
                justify="center"
                gap="lg"
                style={{
                  height: "calc(100% - 115px)",
                  textAlign: "center",
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
                  className="max-w-[100%] w-full"
                  type="scroll"
                  py={"md"}
                  style={{ height: "calc(100% - 115px)" }}
                  scrollbars="y"
                  scrollbarSize={6}
                  px={"xs"}
                >
                  <Stack gap={"lg"}>
                    {cart.items.map((item, index) => {
                      return (
                        <Group
                          key={index}
                          align="flex-start"
                          className="cursor-pointer"
                          justify="flex-start"
                          gap={"xs"}
                          py={0}
                          px={0}
                          onClick={() => {
                            close();
                            if (item.variantId && item.variantOptions) {
                              const searchParams = new URLSearchParams();
                              item.variantOptions.forEach((vo) => {
                                searchParams.append(
                                  vo.variantGroupSlug,
                                  vo.variantOptionSlug
                                );
                              });
                              push(
                                `/${item.productSlug}?${searchParams.toString()}`
                              );
                              return;
                            } else {
                              push(`/${item.productSlug}`);
                            }
                          }}
                          h={"100%"}
                        >
                          <AspectRatio
                            ratio={1}
                            pos={"relative"}
                            className="h-full"
                            w={100}
                          >
                            {item.productAsset ? (
                              <CustomImage
                                src={
                                  item.productAsset ? item.productAsset.url : ""
                                }
                                alt={item.productName}
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
                              <Title order={5}>{item.productName}</Title>
                              {item.variantOptions && (
                                <Group>
                                  {item.variantOptions.map((vo) => (
                                    <Text
                                      tt={"capitalize"}
                                      fz={"sm"}
                                      fw={700}
                                      key={
                                        vo.variantGroupSlug +
                                        vo.variantOptionSlug
                                      }
                                    >
                                      {vo.variantGroupName}:{" "}
                                      {vo.variantOptionName}
                                    </Text>
                                  ))}
                                </Group>
                              )}
                            </div>
                            <div className="flex flex-col justify-between h-full gap-1">
                              <Group
                                gap={"xs"}
                                justify="center"
                                h={"100%"}
                                align="center"
                                wrap="nowrap"
                              >
                                <ActionIcon
                                  variant="transparent"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (item.quantity > 1) {
                                      decreaseItem(
                                        item.productId,
                                        item.variantId || undefined
                                      );
                                    } else {
                                      removeItem(
                                        item.productId,
                                        item.variantId || undefined
                                      );
                                    }
                                  }}
                                  size={"md"}
                                  c={item.quantity > 1 ? "primary" : "red"}
                                >
                                  {item.quantity > 1 ? (
                                    <IconMinus size={16} />
                                  ) : (
                                    <IconTrash size={16} />
                                  )}
                                </ActionIcon>
                                <Text fz={"sm"} fw={700}>
                                  {item.quantity}
                                </Text>
                                <ActionIcon
                                  variant="transparent"
                                  size={"md"}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    increaseItem(
                                      item.productId,
                                      item.variantId || undefined
                                    );
                                  }}
                                >
                                  <IconPlus size={16} />
                                </ActionIcon>
                              </Group>

                              <Stack gap="xs" align="flex-end">
                                {item.discountedPrice &&
                                item.discountedPrice < item.price ? (
                                  <>
                                    <ProductPriceFormatter
                                      size="sm"
                                      td="line-through"
                                      c="dimmed"
                                      ta="end"
                                      price={item.price * item.quantity}
                                    />
                                    <ProductPriceFormatter
                                      size="md"
                                      fw={700}
                                      ta={"end"}
                                      price={
                                        item.discountedPrice * item.quantity
                                      }
                                    />
                                  </>
                                ) : (
                                  <ProductPriceFormatter
                                    size="md"
                                    fw={700}
                                    ta={"end"}
                                    price={item.price * item.quantity}
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
                  className="sticky bottom-0 border-t border-t-[var(--mantine-color-dimmed)] bg-white flex flex-col gap-3"
                  px={"xs"}
                  py={"lg"}
                >
                  <Group
                    align="center"
                    className="w-full"
                    justify="space-between"
                    px={"xs"}
                  >
                    <Text fz={"md"} fw={500} c={"dimmed"}>
                      {cart.totalDiscount > 0 ? "Ara Toplam" : "Toplam"}
                    </Text>
                    <Stack gap="xs" align="flex-end">
                      <ProductPriceFormatter
                        fz={"md"}
                        fw={500}
                        c={"dimmed"}
                        price={cart.totalPrice}
                      />
                    </Stack>
                  </Group>

                  {cart.totalDiscount > 0 && (
                    <Group
                      align="center"
                      className="w-full"
                      justify="space-between"
                      px={"xs"}
                    >
                      <Text fz={"md"} fw={500} c={"dimmed"}>
                        İndirim
                      </Text>
                      <Stack gap="xs" align="flex-end">
                        <ProductPriceFormatter
                          fz={"md"}
                          fw={500}
                          c={"dimmed"}
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
                      px={"xs"}
                    >
                      <Text fz={"md"} fw={500} c={"dimmed"}>
                        Toplam
                      </Text>
                      <Stack gap="xs" align="flex-end">
                        <ProductPriceFormatter
                          fz={"md"}
                          fw={500}
                          c={"dimmed"}
                          price={cart.totalPrice - cart.totalDiscount}
                        />
                      </Stack>
                    </Group>
                  )}
                  <Button
                    fullWidth
                    onClick={() => {
                      close();
                      push("/cart");
                    }}
                    variant="outline"
                    size="md"
                    radius={"xl"}
                  >
                    Sepete Git
                  </Button>
                  <Button
                    fullWidth
                    radius={"xl"}
                    size="md"
                    onClick={() => {
                      close();
                      push(`/checkout${cart?.cartId ? `/${cart.cartId}` : ""}`);
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

export default ShoppingBagDrawerV2;
