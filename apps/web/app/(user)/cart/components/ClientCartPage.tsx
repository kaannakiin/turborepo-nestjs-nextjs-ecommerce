"use client";
import { useCartV2 } from "@/context/cart-context/CartContextV2";
import {
  Accordion,
  ActionIcon,
  AspectRatio,
  Box,
  Button,
  Container,
  Divider,
  Grid,
  Group,
  Paper,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import {
  IconMinus,
  IconPlus,
  IconShieldCheck,
  IconShoppingBagX,
  IconTrash,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import CustomImage from "../../../components/CustomImage";
import ProductPriceFormatter from "../../components/ProductPriceFormatter";

const ClientCartPage = () => {
  const { cart, removeItem, increaseItemQuantity, decreaseItemQuantity } =
    useCartV2();
  const { push } = useRouter();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isTablet = useMediaQuery("(max-width: 1024px)");
  const isEmpty = !cart || !cart.items || cart.items.length === 0;

  if (isEmpty) {
    return (
      <Container
        size="lg"
        className="min-h-[60vh] flex items-center justify-center"
      >
        <Stack align="center" gap="xl" className="text-center">
          <IconShoppingBagX size={120} color="var(--mantine-color-gray-5)" />
          <Stack gap="md" align="center">
            <Title order={2} c="dimmed">
              Sepetiniz Boş
            </Title>
            <Text size="lg" c="dimmed" maw={500}>
              Sepetinize henüz bir ürün eklenmedi. Alışverişe devam etmek için
              ürünleri keşfedin ve favorilerinizi sepetinize ekleyin.
            </Text>
          </Stack>
          <Button
            size="lg"
            radius="xl"
            onClick={() => push("/")}
            className="px-8"
          >
            Alışverişe Başla
          </Button>
        </Stack>
      </Container>
    );
  }

  return (
    <div className="w-full min-h-full max-w-[1250px] lg:mx-auto flex my-4 px-4">
      <Grid className="w-full" gutter={{ xs: "sm", sm: "md", lg: "xl" }}>
        <Grid.Col span={{ base: 12, lg: 8 }}>
          {isTablet || isMobile ? (
            <Accordion variant="default" defaultValue="cart">
              <Accordion.Item
                value="cart"
                classNames={{
                  item: "border-none!",
                }}
              >
                <Accordion.Control>
                  <Group justify="space-between" align="center">
                    <Title order={2}>Sepetim ({cart.items.length} ürün)</Title>
                  </Group>
                </Accordion.Control>
                <Accordion.Panel>
                  <Stack gap="md">
                    {cart.items.map((item, index) => {
                      return (
                        <Group
                          key={index}
                          align="flex-start"
                          gap="lg"
                          wrap="nowrap"
                        >
                          <Box style={{ cursor: "pointer" }}>
                            <AspectRatio ratio={1} w={120}>
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
                              ) : (
                                <div className="w-full h-full bg-gray-100 rounded-md flex items-center justify-center">
                                  <Text size="xs" c="dimmed">
                                    Resim Yok
                                  </Text>
                                </div>
                              )}
                            </AspectRatio>
                          </Box>

                          {/* Ürün Bilgileri */}
                          <div className="flex-1">
                            <Stack gap="sm">
                              <div style={{ cursor: "pointer" }}>
                                <Title order={4} lineClamp={2}>
                                  {item.productName}
                                </Title>
                                {item.variantOptions && (
                                  <Group gap="md" mt="xs">
                                    {item.variantOptions.map((vo) => (
                                      <Text
                                        key={
                                          vo.variantGroupSlug +
                                          vo.variantOptionSlug
                                        }
                                        size="sm"
                                        c="dimmed"
                                        tt="capitalize"
                                      >
                                        {vo.variantGroupName}:{" "}
                                        {vo.variantOptionName}
                                      </Text>
                                    ))}
                                  </Group>
                                )}
                              </div>

                              {/* Miktar ve Fiyat Kontrolleri */}
                              <Group justify="space-between" align="flex-end">
                                {/* Miktar Kontrolü */}
                                <Group gap="xs" align="center">
                                  <ActionIcon
                                    variant="transparent"
                                    size="lg"
                                    onClick={async () => {
                                      if (item.quantity > 0) {
                                        if (item.quantity === 1) {
                                          await removeItem({
                                            itemId: item.itemId,
                                          });
                                        } else {
                                          await decreaseItemQuantity({
                                            itemId: item.itemId,
                                          });
                                        }
                                      }
                                    }}
                                    color={
                                      item.quantity > 1 ? "primary" : "red"
                                    }
                                  >
                                    {item.quantity > 1 ? (
                                      <IconMinus size={18} />
                                    ) : (
                                      <IconTrash size={18} />
                                    )}
                                  </ActionIcon>

                                  <Text
                                    fw={600}
                                    size="lg"
                                    className="min-w-[2rem] text-center"
                                  >
                                    {item.quantity}
                                  </Text>

                                  <ActionIcon
                                    variant="transparent"
                                    size="lg"
                                    onClick={async () => {
                                      await increaseItemQuantity({
                                        itemId: item.itemId,
                                      });
                                    }}
                                  >
                                    <IconPlus size={18} />
                                  </ActionIcon>
                                </Group>

                                {/* Fiyat */}
                                <Stack gap="xs" align="flex-end">
                                  {item.discountedPrice &&
                                    item.price !== item.discountedPrice && (
                                      <ProductPriceFormatter
                                        size="sm"
                                        td="line-through"
                                        c="dimmed"
                                        price={item.price * item.quantity}
                                      />
                                    )}
                                  <ProductPriceFormatter
                                    fw={700}
                                    size="lg"
                                    price={
                                      (item.discountedPrice || item.price) *
                                      item.quantity
                                    }
                                  />
                                </Stack>
                              </Group>
                            </Stack>
                          </div>
                        </Group>
                      );
                    })}
                  </Stack>
                </Accordion.Panel>
              </Accordion.Item>
            </Accordion>
          ) : (
            <Stack gap={"lg"}>
              <Group justify="space-between" align="center">
                <Title order={2}>Sepetim ({cart.items.length} ürün)</Title>
              </Group>
              <Stack gap="md">
                {cart.items.map((item, index) => {
                  return (
                    <Group
                      key={index}
                      align="flex-start"
                      gap="lg"
                      wrap="nowrap"
                    >
                      <Box style={{ cursor: "pointer" }}>
                        <AspectRatio ratio={1} maw={120}>
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
                          ) : (
                            <div className="w-full h-full bg-gray-100 rounded-md flex items-center justify-center">
                              <Text size="xs" c="dimmed">
                                Resim Yok
                              </Text>
                            </div>
                          )}
                        </AspectRatio>
                      </Box>

                      {/* Ürün Bilgileri */}
                      <div className="flex-1">
                        <Stack gap="sm">
                          <div style={{ cursor: "pointer" }}>
                            <Title order={4} lineClamp={2}>
                              {item.productName}
                            </Title>
                            {item.variantOptions && (
                              <Group gap="md" mt="xs">
                                {item.variantOptions.map((vo) => (
                                  <Text
                                    key={
                                      vo.variantGroupSlug + vo.variantOptionSlug
                                    }
                                    size="sm"
                                    c="dimmed"
                                    tt="capitalize"
                                  >
                                    {vo.variantGroupName}:{" "}
                                    {vo.variantOptionName}
                                  </Text>
                                ))}
                              </Group>
                            )}
                          </div>

                          {/* Miktar ve Fiyat Kontrolleri */}
                          <Group justify="space-between" align="flex-end">
                            {/* Miktar Kontrolü */}
                            <Group gap="xs" align="center">
                              <ActionIcon
                                variant="transparent"
                                size="lg"
                                onClick={async () => {
                                  if (item.quantity > 0) {
                                    if (item.quantity === 1) {
                                      await removeItem({
                                        itemId: item.itemId,
                                      });
                                    } else {
                                      await decreaseItemQuantity({
                                        itemId: item.itemId,
                                      });
                                    }
                                  }
                                }}
                                color={item.quantity > 1 ? "primary" : "red"}
                              >
                                {item.quantity > 1 ? (
                                  <IconMinus size={18} />
                                ) : (
                                  <IconTrash size={18} />
                                )}
                              </ActionIcon>

                              <Text
                                fw={600}
                                size="lg"
                                className="min-w-[2rem] text-center"
                              >
                                {item.quantity}
                              </Text>

                              <ActionIcon
                                variant="transparent"
                                size="lg"
                                onClick={async () => {
                                  await increaseItemQuantity({
                                    itemId: item.itemId,
                                  });
                                }}
                              >
                                <IconPlus size={18} />
                              </ActionIcon>
                            </Group>

                            {/* Fiyat */}
                            <Stack gap="xs" align="flex-end">
                              {item.discountedPrice &&
                                item.price !== item.discountedPrice && (
                                  <ProductPriceFormatter
                                    size="sm"
                                    td="line-through"
                                    c="dimmed"
                                    price={item.price * item.quantity}
                                  />
                                )}
                              <ProductPriceFormatter
                                fw={700}
                                size="lg"
                                price={
                                  (item.discountedPrice || item.price) *
                                  item.quantity
                                }
                              />
                            </Stack>
                          </Group>
                        </Stack>
                      </div>
                    </Group>
                  );
                })}
              </Stack>
            </Stack>
          )}
        </Grid.Col>

        <Grid.Col span={{ base: 12, lg: 4 }} mt={"xl"}>
          <div className="sticky top-4">
            <Paper withBorder radius="0" p="xl">
              <Stack gap="lg">
                <Title order={3}>Sipariş Özeti</Title>

                <Divider />

                <Stack gap="sm">
                  <Group justify="space-between">
                    <Text>
                      {cart.totalDiscount > 0 ? "Ara Toplam" : "Toplam"} (
                      {cart.items.length} ürün)
                    </Text>
                    <ProductPriceFormatter
                      price={
                        cart.totalDiscount > 0
                          ? cart.totalDiscount + cart.totalPrice
                          : cart.totalPrice
                      }
                    />
                  </Group>
                </Stack>

                {cart.totalDiscount > 0 && (
                  <>
                    <Divider />
                    <Group justify="space-between" c="red">
                      <Text>İndirim</Text>
                      <ProductPriceFormatter
                        c="red"
                        fw={500}
                        price={cart.totalDiscount}
                      />
                    </Group>
                  </>
                )}

                {cart.totalDiscount > 0 && (
                  <>
                    <Divider />
                    <Group justify="space-between" className="text-lg">
                      <Text fw={700} size="lg">
                        Toplam
                      </Text>
                      <ProductPriceFormatter
                        fw={700}
                        size="xl"
                        price={cart.totalPrice}
                      />
                    </Group>
                  </>
                )}

                {/* Aksiyon Butonları */}
                <Stack gap="md">
                  <Button
                    size="lg"
                    radius="xl"
                    fullWidth
                    onClick={() =>
                      push(`/checkout${cart?.cartId ? `/${cart.cartId}` : ""}`)
                    }
                  >
                    Ödemeye Geç
                  </Button>
                </Stack>

                <Group justify="center">
                  <IconShieldCheck size={16} />
                  <Text size="xs" c="dimmed" ta="center">
                    256-bit SSL şifreleme ile güvenli ödeme
                  </Text>
                </Group>
              </Stack>
            </Paper>
          </div>
        </Grid.Col>
      </Grid>
    </div>
  );
};

export default ClientCartPage;
