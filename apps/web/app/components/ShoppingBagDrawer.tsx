"use client";
import { useCartV2 } from "@/context/cart-context/CartContextV2";
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
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { CartItemType } from "@repo/types";
import {
  IconMinus,
  IconPlus,
  IconShoppingBag,
  IconShoppingBagX,
  IconTrash,
} from "@tabler/icons-react";
import { usePathname, useRouter } from "next/navigation";
import ProductPriceFormatter from "../(user)/components/ProductPriceFormatter";
import CustomImage from "./CustomImage";

const ShoppingBagDrawer = () => {
  const pathname = usePathname();

  const [opened, { open, close }] = useDisclosure();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isTablet = useMediaQuery("(max-width: 1024px)");

  const {
    cart,
    removeItem,
    addItem,
    decreaseItemQuantity,
    increaseItemQuantity,
  } = useCartV2();
  const isEmpty = !cart || !cart.items || cart.items.length === 0;

  const productUrlCreator = (
    data: Pick<CartItemType, "productSlug" | "variantOptions">
  ) => {
    const basePath = `/${data.productSlug}`;
    if (!data.variantOptions || data.variantOptions.length === 0) {
      return basePath;
    }

    const searchParams = new URLSearchParams();
    data.variantOptions.forEach((option) => {
      searchParams.append(option.variantGroupSlug, option.variantOptionSlug);
    });
    return `${basePath}?${searchParams.toString()}`;
  };
  const { push } = useRouter();
  if (pathname.startsWith("/cart") || pathname.startsWith("/checkout")) {
    return (
      <ActionIcon variant="transparent">
        <IconShoppingBag size={28} />
      </ActionIcon>
    );
  }
  return (
    <>
      <ActionIcon variant="transparent" size={"xl"} onClick={open}>
        {cart && cart.items && cart.items.length > 0 ? (
          <Indicator
            label={cart.items.length}
            classNames={{
              indicator: "font-semibold",
            }}
            inline
            size={20}
            offset={3}
          >
            <IconShoppingBag size={28} />
          </Indicator>
        ) : (
          <IconShoppingBag size={28} />
        )}
      </ActionIcon>

      <Drawer.Root
        position="left"
        size={isMobile || isTablet ? "lg" : "md"}
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
                          justify="flex-start"
                          gap={"xs"}
                          py={0}
                          px={0}
                          onClick={() => {
                            close();
                            push(item.productUrl);
                          }}
                          h={"100%"}
                        >
                          <AspectRatio
                            ratio={1}
                            pos={"relative"}
                            className="h-full"
                            w={100}
                          >
                            {item.productAsset || item.variantAsset ? (
                              <CustomImage
                                src={
                                  item.variantAsset
                                    ? item.variantAsset.url
                                    : item.productAsset
                                      ? item.productAsset.url
                                      : ""
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
                              >
                                <ActionIcon
                                  variant="transparent"
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    if (item.quantity > 1) {
                                      await decreaseItemQuantity({
                                        itemId: item.itemId,
                                      });
                                    } else {
                                      await removeItem({ itemId: item.itemId });
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
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    await increaseItemQuantity({
                                      itemId: item.itemId,
                                    });
                                  }}
                                >
                                  <IconPlus size={16} />
                                </ActionIcon>
                              </Group>

                              <Stack gap="xs" align="flex-end">
                                {item.price !== item.discountedPrice && (
                                  <ProductPriceFormatter
                                    size="sm"
                                    td="line-through"
                                    c="dimmed"
                                    ta="end"
                                    price={item.price * item.quantity}
                                  />
                                )}
                                <ProductPriceFormatter
                                  ta={"end"}
                                  fw={600}
                                  price={item.discountedPrice * item.quantity}
                                />
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
                    <Text fz={"lg"} fw={700}>
                      Toplam
                    </Text>
                    <Stack gap="xs" align="flex-end">
                      <ProductPriceFormatter
                        fw={700}
                        fz={"lg"}
                        price={cart.totalDiscount} // İndirimli toplam fiyat
                      />
                    </Stack>
                  </Group>
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

export default ShoppingBagDrawer;
