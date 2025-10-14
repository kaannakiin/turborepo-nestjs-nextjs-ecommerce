"use client";
import ProductPriceFormatter from "@/(user)/components/ProductPriceFormatter";
import CustomImage from "@/components/CustomImage";
import GlobalLoadingOverlay from "@/components/GlobalLoadingOverlay";
import fetchWrapper from "@lib/fetchWrapper";
import {
  getCartAssociationUrl,
  getOrderStatusInfos,
  getPaymentStatusInfos,
} from "@lib/helpers";
import {
  ActionIcon,
  AspectRatio,
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  Divider,
  Group,
  ScrollArea,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { ProductTranslation } from "@repo/database";
import { DateFormatter, useQuery } from "@repo/shared";
import {
  $Enums,
  BuyedVariant,
  CardAssociation,
  OrderPageReturnType,
  ProductSnapshot,
  ProductSnapshotForVariant,
  ThreeDSRequest,
  TokenPayload,
} from "@repo/types";
import {
  IconCreditCard,
  IconMapPin,
  IconPackage,
  IconReceipt,
  IconTruck,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";

const OrderClientPage = ({
  slug,
  session,
}: {
  slug: string;
  session: TokenPayload | null;
}) => {
  const { push } = useRouter();
  const { data, isLoading } = useQuery({
    queryKey: ["user-order", slug],
    queryFn: async () => {
      const orderRes = await fetchWrapper.get<OrderPageReturnType>(
        `/order/get-order/${slug}`
      );
      if (!orderRes.success) {
        throw new Error("Failed to fetch order");
      }
      if (!orderRes.data || !orderRes.data.order || !orderRes.data.success) {
        throw new Error("Order not found");
      }
      return orderRes.data.order;
    },
    gcTime: 5 * 60 * 1000,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return <GlobalLoadingOverlay />;
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center my-auto justify-center gap-3">
        <ActionIcon size={64} p={0} m={0} variant="transparent">
          <IconPackage size={64} />
        </ActionIcon>
        <Text fz={"lg"} fw={700} c={"primary"}>
          Sipariş bulunamadı
        </Text>
        <Button component="a" href="/" variant="outline">
          Anasayfaya Dön
        </Button>
      </div>
    );
  }

  if (data.userId !== null) {
    if (session) {
      push(`/dashboard/orders/${slug}`);
    } else {
      push(`/auth/login?redirectUri=/dashboard/orders/${slug}`);
    }
  }

  const {
    orderItems,
    shippingAddress: rawShippingAddress,
    billingAddress: rawBillingAddress,
  } = data;

  const shippingAddress = rawShippingAddress
    ? (JSON.parse(
        JSON.stringify(rawShippingAddress)
      ) as ThreeDSRequest["shippingAddress"])
    : null;

  const billingAddress = rawBillingAddress
    ? (JSON.parse(
        JSON.stringify(rawBillingAddress)
      ) as ThreeDSRequest["billingAddress"])
    : null;

  return (
    <div className="flex flex-col gap-3 w-full">
      <Group className="w-full" justify="space-between" wrap="wrap">
        <div>
          <Title order={3}>Sipariş Detayları</Title>
          <Text size="sm" c="dimmed">
            Sipariş No: {data.orderNumber}
          </Text>
          <Text size="xs" c="dimmed">
            {DateFormatter.withTime(data.createdAt)}
          </Text>
        </div>
        <Badge size="lg">{getOrderStatusInfos(data.orderStatus)}</Badge>
      </Group>

      <Stack gap="md">
        {orderItems.length > 0 && (
          <ScrollArea scrollbarSize={6} type="scroll">
            <Stack gap={"md"} px={"xs"}>
              {orderItems.map((item) => {
                const isVariantProduct = !!item.buyedVariants;
                const isCanBuyable = isVariantProduct
                  ? !!item.productId && !!item.variantId
                  : !!item.productId;

                const buyedVariants = item.buyedVariants
                  ? (JSON.parse(
                      JSON.stringify(item.buyedVariants)
                    ) as BuyedVariant)
                  : null;

                let productSnapshot:
                  | ProductSnapshot
                  | ProductSnapshotForVariant;
                let productAsset: {
                  url: string;
                  type: $Enums.AssetType;
                } | null = null;
                let productTranslation: ProductTranslation | null = null;

                if (isVariantProduct) {
                  const variantSnapshot = JSON.parse(
                    JSON.stringify(item.productSnapshot)
                  ) as ProductSnapshotForVariant;
                  productSnapshot = variantSnapshot;
                  productAsset =
                    variantSnapshot.assets?.[0]?.asset ||
                    variantSnapshot.product.assets?.[0]?.asset ||
                    null;
                  productTranslation =
                    variantSnapshot.product.translations.find(
                      (tr) => tr.locale === "TR"
                    ) || null;
                  if (!buyedVariants) return null;
                } else {
                  const simpleSnapshot = JSON.parse(
                    JSON.stringify(item.productSnapshot)
                  ) as ProductSnapshot;
                  productSnapshot = simpleSnapshot;
                  productAsset = simpleSnapshot.assets?.[0]?.asset || null;
                  productTranslation =
                    simpleSnapshot.translations.find(
                      (tr) => tr.locale === "TR"
                    ) || null;
                }

                if (!productSnapshot || !productTranslation) {
                  return null;
                }

                return (
                  <Box
                    key={item.id}
                    className="border border-gray-200 rounded-lg p-3"
                  >
                    {/* Desktop Layout */}
                    <div className="hidden sm:flex gap-3">
                      {productAsset && productAsset.type === "IMAGE" && (
                        <AspectRatio
                          ratio={1}
                          w={100}
                          className="flex-shrink-0"
                        >
                          <CustomImage src={productAsset.url} />
                        </AspectRatio>
                      )}

                      <div className="flex-1 min-w-0">
                        <Text fw={600} size="sm" lineClamp={2} mb="xs">
                          {productTranslation.name}
                        </Text>

                        {buyedVariants && buyedVariants.length > 0 && (
                          <Stack gap={4}>
                            {buyedVariants.map((variant, idx) => {
                              const variantGroupName =
                                variant.variantGroup.translations.find(
                                  (t) => t.locale === "TR"
                                )?.name || "";
                              const variantOptionName =
                                variant.translations.find(
                                  (t) => t.locale === "TR"
                                )?.name || "";

                              return (
                                <Text key={idx} size="xs" c="dimmed">
                                  {variantGroupName}: {variantOptionName}
                                </Text>
                              );
                            })}
                          </Stack>
                        )}

                        <Text size="xs" c="dimmed" mt="xs">
                          Adet: {item.quantity}
                        </Text>
                      </div>

                      <div className="flex flex-col items-end justify-between min-w-[120px]">
                        <div className="text-right">
                          <Text size="lg" fw={700}>
                            {item.totalPrice} TL
                          </Text>
                          <Text size="xs" c="dimmed">
                            {item.buyedPrice} TL / adet
                          </Text>
                        </div>

                        {isCanBuyable && (
                          <Button size="xs" variant="light" fullWidth>
                            Tekrar Al
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Mobile Layout */}
                    <div className="flex sm:hidden flex-col gap-3">
                      <div className="flex gap-3">
                        {productAsset && productAsset.type === "IMAGE" && (
                          <AspectRatio
                            ratio={1}
                            maw={100}
                            className="flex-shrink-0"
                          >
                            <CustomImage src={productAsset.url} />
                          </AspectRatio>
                        )}

                        <div className="flex-1 min-w-0">
                          <Text fw={600} size="sm" lineClamp={2} mb="xs">
                            {productTranslation.name}
                          </Text>

                          {buyedVariants && buyedVariants.length > 0 && (
                            <Stack gap={4}>
                              {buyedVariants.map((variant, idx) => {
                                const variantGroupName =
                                  variant.variantGroup.translations.find(
                                    (t) => t.locale === "TR"
                                  )?.name || "";
                                const variantOptionName =
                                  variant.translations.find(
                                    (t) => t.locale === "TR"
                                  )?.name || "";

                                return (
                                  <Text key={idx} size="xs" c="dimmed">
                                    {variantGroupName}: {variantOptionName}
                                  </Text>
                                );
                              })}
                            </Stack>
                          )}

                          <Text size="xs" c="dimmed" mt="xs">
                            Adet: {item.quantity}
                          </Text>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                          <div className="text-right">
                            <Text size="lg" fw={700}>
                              {item.totalPrice} TL
                            </Text>
                            <Text size="xs" c="dimmed">
                              {item.buyedPrice} TL / adet
                            </Text>
                          </div>
                        </div>

                        {isCanBuyable && (
                          <Button size="sm" variant="light" fullWidth>
                            Tekrar Al
                          </Button>
                        )}
                      </div>
                    </div>
                  </Box>
                );
              })}
            </Stack>
          </ScrollArea>
        )}
      </Stack>
      <Divider my={"md"} />
      <SimpleGrid cols={{ xs: 1, md: 2 }}>
        <Card withBorder shadow="sm" radius="md">
          <Card.Section className="border-b border-gray-200">
            <Group p="md">
              <IconReceipt size={20} />
              <Title order={5}>Sipariş Özeti</Title>
            </Group>
          </Card.Section>
          <Stack gap="xs" p="md">
            <Group justify="space-between">
              <Text size="sm" c="dimmed">
                Ara Toplam
              </Text>
              <ProductPriceFormatter price={data.subtotal} fz="sm" />
            </Group>
            {data.shippingCost && data.shippingCost > 0 ? (
              <Group justify="space-between">
                <Text size="sm" c="dimmed">
                  Kargo Ücreti
                </Text>
                <ProductPriceFormatter price={data.shippingCost} fz="sm" />
              </Group>
            ) : (
              <Text size="sm" c="dimmed">
                Ücretsiz Kargo
              </Text>
            )}
            {data.discountAmount && data.discountAmount > 0 && (
              <Group justify="space-between">
                <Text size="sm" c="red">
                  İndirim
                </Text>
                <Text size="sm" c="red" fw={500}>
                  -{data.discountAmount} TL
                </Text>
              </Group>
            )}
            <Divider my="xs" />
            <Group justify="space-between">
              <Text size="md" fw={700}>
                Toplam
              </Text>
              <ProductPriceFormatter
                price={data.totalAmount}
                fz="md"
                fw={700}
              />
            </Group>
          </Stack>
        </Card>
        <Card withBorder shadow="sm" radius="md">
          <Card.Section className="border-b border-gray-200">
            <Group justify="space-between" py={"xs"} px="xl">
              <Group>
                <IconCreditCard size={20} />
                <Title order={5}>Ödeme Bilgileri</Title>
              </Group>
              {data.cardAssociation && (
                <Avatar
                  radius={0}
                  size={"lg"}
                  src={getCartAssociationUrl(
                    data.cardAssociation as CardAssociation
                  )}
                />
              )}
            </Group>
          </Card.Section>
          <Stack gap="xs" p="md">
            <Group justify="space-between">
              <Text size="sm" c="dimmed">
                Ödeme Durumu
              </Text>
              <Badge
                size="lg"
                color={data.paymentStatus === "PAID" ? "green" : "yellow"}
              >
                {getPaymentStatusInfos(data.paymentStatus)}
              </Badge>
            </Group>
            <Divider my="xs" />

            <Group justify="space-between">
              <Text size="sm" c="dimmed">
                Kart
              </Text>
            </Group>
            <Group justify="space-between">
              <Text size="sm" c="dimmed">
                Kart Numarası
              </Text>
              <Text size="sm" fw={500} className="font-mono">
                {data.binNumber.slice(0, 4)} {data.binNumber.slice(-2)}** ****{" "}
                {data.lastFourDigits}
              </Text>
            </Group>
          </Stack>
        </Card>

        {shippingAddress && (
          <Card withBorder shadow="sm" radius="md">
            <Card.Section className="border-b border-gray-200">
              <Group p="md">
                <IconTruck size={20} />
                <Title order={5}>Teslimat Adresi</Title>
              </Group>
            </Card.Section>
            <Stack gap="1px" p="md">
              <Text size="sm" fw={600}>
                {shippingAddress.contactName}
              </Text>
              <Text size="sm" c="dimmed">
                {shippingAddress.address}
              </Text>
              <Group gap="xs">
                <Text size="sm" c="dimmed">
                  {shippingAddress.city} /
                </Text>
                <Text size="sm" c="dimmed">
                  {shippingAddress.country}
                </Text>
              </Group>
            </Stack>
          </Card>
        )}

        {billingAddress && (
          <Card withBorder shadow="sm" radius="md">
            <Card.Section className="border-b border-gray-200">
              <Group p="md">
                <IconMapPin size={20} />
                <Title order={5}>Fatura Adresi</Title>
              </Group>
            </Card.Section>
            <Stack gap="1px" p="md">
              <Text size="sm" fw={600}>
                {billingAddress.contactName}
              </Text>
              <Text size="sm" c="dimmed">
                {billingAddress.address}
              </Text>
              <Group gap="xs">
                <Text size="sm" c="dimmed">
                  {billingAddress.city} /
                </Text>
                <Text size="sm" c="dimmed">
                  {billingAddress.country}
                </Text>
              </Group>
            </Stack>
          </Card>
        )}
      </SimpleGrid>
    </div>
  );
};

export default OrderClientPage;
