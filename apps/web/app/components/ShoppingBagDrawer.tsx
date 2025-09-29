"use client";
import { useCartV2 } from "@/context/cart-context/CartContextV2";
import {
  ActionIcon,
  Anchor,
  AspectRatio,
  Avatar,
  Box,
  Button,
  CloseButton,
  Drawer,
  Group,
  Indicator,
  Popover,
  ScrollArea,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { useDisclosure, useMediaQuery, useWindowScroll } from "@mantine/hooks";
import {
  IconCheck,
  IconMinus,
  IconPlus,
  IconShoppingBag,
  IconShoppingBagX,
  IconTrash,
} from "@tabler/icons-react";
import { usePathname, useRouter } from "next/navigation";
import ProductPriceFormatter from "../(user)/components/ProductPriceFormatter";
import CustomImage from "./CustomImage";
import { useEffect, useState } from "react";
import { useTheme } from "@/(admin)/admin/(theme)/ThemeContexts/ThemeContext";

const ShoppingBagDrawer = () => {
  const pathname = usePathname();
  const [opened, { open, close, toggle }] = useDisclosure();
  const { media } = useTheme();
  const {
    cart,
    removeItem,
    decreaseItemQuantity,
    increaseItemQuantity,
    popoverOpened,
    closePopover,
    lastAddedItem,
  } = useCartV2();

  const isEmpty = !cart || !cart.items || cart.items.length === 0;

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
      <Popover
        withArrow={false}
        offset={16}
        opened={Boolean(lastAddedItem) && popoverOpened}
        position={
          media === "mobile" || media === "tablet" ? "bottom" : "bottom-start"
        }
        onClose={closePopover}
        withOverlay
        overlayProps={{ zIndex: 10000, blur: "8px" }}
        zIndex={100011}
        styles={{
          dropdown: {
            padding: 0,
            maxWidth:
              media === "mobile"
                ? "calc(100vw - 32px)"
                : media === "tablet"
                  ? "calc(100vw - 64px)"
                  : "400px",
            width:
              media === "mobile"
                ? "calc(100vw - 32px)"
                : media === "tablet"
                  ? "calc(100vw - 64px)"
                  : "400px",
          },
        }}
      >
        <Popover.Target>
          <ActionIcon variant="transparent" size={"xl"} onClick={toggle}>
            {cart && cart.items && cart.items.length > 0 ? (
              <Indicator
                label={cart.totalItems}
                classNames={{ indicator: "font-semibold" }}
                inline
                size={20}
                offset={3}
                withBorder={false}
                styles={{
                  indicator: {
                    minWidth: "20px",
                    height: "20px",
                    padding: "0 4px",
                    fontSize: "11px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  },
                }}
              >
                <IconShoppingBag size={28} />
              </Indicator>
            ) : (
              <IconShoppingBag size={28} />
            )}
          </ActionIcon>
        </Popover.Target>
        <Popover.Dropdown>
          {lastAddedItem && (
            <Stack gap={0} w={"100%"}>
              {/* Header - Primary Background */}
              <Group justify="space-between" align="center" p={"md"}>
                <Group gap="xs">
                  <ThemeIcon
                    variant="primary"
                    size={media === "mobile" ? "sm" : "md"}
                    radius="xl"
                    color="primary"
                  >
                    <IconCheck size={media === "mobile" ? 14 : 18} />
                  </ThemeIcon>
                  <Text
                    fw={600}
                    c="primary"
                    size={media === "mobile" ? "xs" : "sm"}
                  >
                    ÜRÜN SEPETE EKLENDİ
                  </Text>
                </Group>
                <CloseButton
                  size={media === "mobile" ? "sm" : "md"}
                  c="primary"
                  onClick={closePopover}
                  styles={{
                    root: {
                      "&:hover": {
                        backgroundColor: "rgba(255, 255, 255, 0.1)",
                      },
                    },
                  }}
                />
              </Group>

              {/* Content */}
              <Stack gap="md" p={media === "mobile" ? "sm" : "lg"}>
                <Group
                  gap={media === "mobile" ? "sm" : "md"}
                  align="flex-start"
                >
                  <AspectRatio ratio={1} w={media === "mobile" ? 60 : 80}>
                    <CustomImage
                      src={
                        lastAddedItem.variantAsset?.url ||
                        lastAddedItem.productAsset?.url ||
                        ""
                      }
                      alt={lastAddedItem.productName}
                      className="rounded-md"
                    />
                  </AspectRatio>

                  <Stack gap="xs" style={{ flex: 1, minWidth: 0 }}>
                    <Text
                      fw={600}
                      size={media === "mobile" ? "xs" : "sm"}
                      lineClamp={2}
                    >
                      {lastAddedItem.productName}
                    </Text>

                    {lastAddedItem.variantOptions &&
                      lastAddedItem.variantOptions.length > 0 && (
                        <Text
                          size="xs"
                          c="dimmed"
                          tt="capitalize"
                          lineClamp={1}
                        >
                          {lastAddedItem.variantOptions
                            .map((vo) => `${vo.variantOptionName}`)
                            .join(", ")}
                        </Text>
                      )}

                    <Group gap="xs" wrap="nowrap">
                      <Text size="xs" c="dimmed">
                        Adet: {lastAddedItem.quantity}
                      </Text>
                      <Text size="xs" c="dimmed">
                        •
                      </Text>
                      <ProductPriceFormatter
                        size="xs"
                        fw={600}
                        price={
                          (lastAddedItem.discountedPrice ||
                            lastAddedItem.price) * lastAddedItem.quantity
                        }
                      />
                    </Group>
                  </Stack>
                </Group>

                {/* Buttons */}
                <Stack gap="sm">
                  <Button
                    variant="default"
                    size={media === "mobile" ? "xs" : "sm"}
                    radius="xl"
                    fullWidth
                    onClick={() => {
                      closePopover();
                      push("/cart");
                    }}
                  >
                    SEPETİM ({cart?.totalItems || 0})
                  </Button>
                  <Button
                    size={media === "mobile" ? "xs" : "sm"}
                    radius="xl"
                    fullWidth
                    onClick={() => {
                      closePopover();
                      push(`/checkout${cart?.cartId ? `/${cart.cartId}` : ""}`);
                    }}
                  >
                    ÖDEME
                  </Button>
                </Stack>
              </Stack>
            </Stack>
          )}
        </Popover.Dropdown>
      </Popover>
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
                        price={
                          cart.totalDiscount > 0
                            ? cart.totalDiscount + cart.totalPrice
                            : cart.totalPrice
                        }
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
                          price={cart.totalPrice}
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

export default ShoppingBagDrawer;
