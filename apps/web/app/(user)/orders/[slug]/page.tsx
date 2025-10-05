"use client";

import ProductPriceFormatter from "@/(user)/components/ProductPriceFormatter";
import CustomImage from "@/components/CustomImage";
import GlobalLoadingOverlay from "@/components/GlobalLoadingOverlay";
import fetchWrapper from "@lib/fetchWrapper";
import { getOrderStatusInfos } from "@lib/helpers";
import {
  AspectRatio,
  Badge,
  Box,
  Card,
  Divider,
  Group,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { useQuery } from "@repo/shared";
import { OrderPageGetOrderReturnType } from "@repo/types";
import Link from "next/link";
import { useParams } from "next/navigation";

const OrdersPage = () => {
  const params = useParams();
  const { data, isLoading, isFetching, isPending } = useQuery({
    queryKey: ["get-order", params.slug],
    queryFn: async () => {
      const fetchRes = await fetchWrapper.get<OrderPageGetOrderReturnType>(
        "/orders/get-order/" + params.slug
      );
      if (!fetchRes.success) {
        return null;
      }

      if (!fetchRes.data.success) {
        return null;
      }

      return fetchRes.data.order;
    },
  });

  if (isLoading || isFetching || isPending) {
    return <GlobalLoadingOverlay />;
  }

  if (!data) {
    return <div>Order not found</div>;
  }

  // Sipariş özeti hesaplamaları
  const subtotal = data.orderItems.reduce(
    (sum, item) => sum + item.totalPrice,
    0
  );
  const shippingCost = data.shippingCost || 0;
  const taxAmount = data.taxAmount || 0;
  const discountAmount = data.discountAmount || 0;

  return (
    <Stack gap={"lg"} className="max-w-[1500px]    w-full lg:mx-auto px-4 py-8">
      <Group justify="space-between" align="center" className="w-full">
        <Text fw={500} tt="capitalize">
          {data.orderNumber}
        </Text>
        <Badge size="lg" color={"primary"} radius={"xl"} variant="dot">
          {getOrderStatusInfos(data.orderStatus)}
        </Badge>
      </Group>
      <Divider size={"md"} />

      <SimpleGrid cols={{ xs: 1, md: 2 }} spacing={{ xs: "md", md: "xl" }}>
        <Stack gap={"md"}>
          <Title order={4}>Satın Alınan Ürünler</Title>
          {data.orderItems.map((item) => {
            // Helper function for Turkish translations
            const getTurkishTranslation = (translations) =>
              translations?.find((tr) => tr.locale === "TR");

            // Asset selection
            const productAsset = item.productSnapshot.assets[0]?.asset || null;
            const variantAsset = item.buyedVariants?.assets[0]?.asset || null;
            const asset = variantAsset || productAsset;

            // Product translation
            const productTranslation = getTurkishTranslation(
              item.productSnapshot.translations
            );

            // Build product slug with query params
            const buildProductSlug = () => {
              const baseSlug = productTranslation?.slug;
              if (!baseSlug) return "/";

              if (!item.variantId || !item.buyedVariants) {
                return `/${baseSlug}`;
              }

              const queryParams = new URLSearchParams();

              item.buyedVariants.options.forEach((vo) => {
                const optionTranslation = getTurkishTranslation(
                  vo.productVariantOption.variantOption.translations
                );
                const groupTranslation = getTurkishTranslation(
                  vo.productVariantOption.variantOption.variantGroup
                    .translations
                );

                if (optionTranslation && groupTranslation) {
                  queryParams.append(
                    groupTranslation.slug,
                    optionTranslation.slug
                  );
                }
              });

              const queryString = queryParams.toString();
              return `/${baseSlug}${queryString ? `?${queryString}` : ""}`;
            };

            const productSlug = buildProductSlug();

            return (
              <Link
                key={item.id}
                href={productSlug}
                className="no-underline text-inherit"
              >
                <Group align="flex-start" gap="lg" wrap="nowrap">
                  <Box className="cursor-pointer relative">
                    <Badge
                      size="md"
                      variant="filled"
                      color="black"
                      circle
                      style={{
                        position: "absolute",
                        zIndex: 10000,
                        top: -8,
                        right: -8,
                        padding: 0,
                        minWidth: 24,
                        height: 24,
                      }}
                    >
                      {item.quantity}
                    </Badge>
                    {asset?.type === "IMAGE" ? (
                      <AspectRatio ratio={1} maw={120}>
                        <CustomImage
                          src={asset.url}
                          alt={productTranslation?.name || "Ürün"}
                        />
                      </AspectRatio>
                    ) : (
                      <div className="w-full h-full bg-gray-100 rounded-md flex items-center justify-center min-h-[120px]">
                        <Text size="xs" c="dimmed">
                          Resim Yok
                        </Text>
                      </div>
                    )}
                  </Box>

                  <div className="flex-1">
                    <Stack gap="xs">
                      <div>
                        <Title
                          order={4}
                          lineClamp={2}
                          className="hover:underline"
                        >
                          {productTranslation?.name || "İsimsiz Ürün"}
                        </Title>
                        {item.buyedVariants && (
                          <Group gap="md" mt={4}>
                            {item.buyedVariants.options.map((vo) => {
                              const optionTranslation = getTurkishTranslation(
                                vo.productVariantOption.variantOption
                                  .translations
                              );
                              const groupTranslation = getTurkishTranslation(
                                vo.productVariantOption.variantOption
                                  .variantGroup.translations
                              );

                              if (!optionTranslation || !groupTranslation)
                                return null;

                              return (
                                <Text
                                  key={`${vo.productVariantOption.variantOption.id}-${vo.productVariantOption.variantOption.variantGroup.id}`}
                                  size="sm"
                                  c="dimmed"
                                  tt="capitalize"
                                >
                                  {groupTranslation.name}:{" "}
                                  {optionTranslation.name}
                                </Text>
                              );
                            })}
                          </Group>
                        )}
                      </div>
                    </Stack>
                  </div>

                  <Stack gap="xs">
                    <ProductPriceFormatter
                      price={item.buyedPrice * item.quantity}
                      fz="md"
                      fw={700}
                    />
                  </Stack>
                </Group>
              </Link>
            );
          })}
        </Stack>
        <SimpleGrid
          className="w-full"
          spacing={"xl"}
          cols={{
            xs: 1,
            sm: 2,
          }}
        >
          <Card px="xs" py={"lg"} shadow="sm" radius={"sm"} withBorder>
            <Card.Section
              inheritPadding
              className="border-b py-1 border-gray-600"
            >
              <Title order={5}>Teslimat Adresi</Title>
            </Card.Section>
            <div className="flex flex-col gap-1 py-2">
              <div className="flex justify-between items-start">
                <span className="text-sm font-bold text-gray-700">
                  Ad Soyad
                </span>
                <span className="text-sm capitalize text-right line-clamp-3 text-black max-w-[150px]">
                  {data.shippingAddress.contactName}
                </span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-sm font-bold text-gray-700">Adres</span>
                <span className="text-sm capitalize text-right line-clamp-3 max-w-[150px]">
                  {data.shippingAddress.address} {data.shippingAddress.city} /{" "}
                  {data.shippingAddress.country}
                </span>
              </div>
              {data.shippingAddress.email && (
                <div className="flex justify-between items-start">
                  <span className="text-sm font-bold text-gray-700">Email</span>
                  <span className="text-sm  text-right line-clamp-3 max-w-[150px]">
                    {data.shippingAddress.email}
                  </span>
                </div>
              )}
              {data.shippingAddress.gsmNumber && (
                <div className="flex justify-between items-start">
                  <span className="text-sm font-bold text-gray-700">
                    Telefon
                  </span>
                  <span className="text-sm  text-right line-clamp-3 max-w-[150px]">
                    {data.shippingAddress.gsmNumber}
                  </span>
                </div>
              )}
            </div>
          </Card>

          <Card px="xs" py={"lg"} shadow="sm" radius={"sm"} withBorder>
            <Card.Section
              inheritPadding
              className="border-b border-gray-600 py-1"
            >
              <Title order={5}>Fatura Adresi</Title>
            </Card.Section>
            <div className="flex flex-col gap-1 py-2">
              <div className="flex justify-between items-start">
                <span className="text-sm font-bold text-gray-700">
                  Ad Soyad
                </span>
                <span className="text-sm capitalize text-right line-clamp-3 max-w-[150px]">
                  {data.billingAddress.contactName}
                </span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-sm font-bold text-gray-700">Adres</span>
                <span className="text-sm capitalize text-right line-clamp-3 max-w-[150px]">
                  {data.billingAddress.address} {data.billingAddress.city} /{" "}
                  {data.billingAddress.country}
                </span>
              </div>
              {data.billingAddress.email && (
                <div className="flex justify-between items-start">
                  <span className="text-sm font-bold text-gray-700">Email</span>
                  <span className="text-sm  text-right line-clamp-3 max-w-[150px]">
                    {data.billingAddress.email}
                  </span>
                </div>
              )}
              {data.billingAddress.gsmNumber && (
                <div className="flex justify-between items-start">
                  <span className="text-sm font-bold text-gray-700">
                    Telefon
                  </span>
                  <span className="text-sm  text-right line-clamp-3 max-w-[150px]">
                    {data.billingAddress.gsmNumber}
                  </span>
                </div>
              )}
            </div>
          </Card>

          <Card px="xs" py={"lg"} shadow="sm" radius={"sm"} withBorder>
            <Card.Section
              inheritPadding
              className="border-b py-1 border-gray-600"
            >
              <Title order={5}>Kart Bilgileri</Title>
            </Card.Section>
            <div className="flex flex-col gap-1 py-2">
              <div className="flex justify-between items-start">
                <span className="text-sm font-bold text-gray-700">
                  Kart Türü
                </span>
                <span className="text-sm text-right line-clamp-3 max-w-[150px]">
                  {data.cardType === "DEBIT_CARD"
                    ? "Banka Kartı"
                    : "Kredi Kartı"}
                </span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-sm font-bold text-gray-700">
                  Kart Ailesi
                </span>
                <span className="text-sm text-right line-clamp-3 max-w-[150px]">
                  {data.cardFamily}
                </span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-sm font-bold text-gray-700">
                  Kart Ağı
                </span>
                <span className="text-sm text-right line-clamp-3 max-w-[150px]">
                  {data.cardAssociation}
                </span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-sm font-bold text-gray-700">Kart No</span>
                <span className="text-sm text-right line-clamp-3 max-w-[150px]">
                  {data.binNumber}** **** {data.lastFourDigits}
                </span>
              </div>
            </div>
          </Card>

          <Card px="xs" py={"lg"} shadow="sm" radius={"sm"} withBorder>
            <Card.Section
              inheritPadding
              className="border-b border-gray-600 py-1"
            >
              <Title order={5}>Sipariş Özeti</Title>
            </Card.Section>
            <div className="flex flex-col gap-1 py-2">
              <div className="flex justify-between items-center">
                <Text size="sm" c="dimmed">
                  Ara Toplam
                </Text>
                <ProductPriceFormatter price={subtotal} fz="sm" fw={500} />
              </div>

              {shippingCost > 0 && (
                <div className="flex justify-between items-center">
                  <Text size="sm" c="dimmed">
                    Kargo Ücreti
                  </Text>
                  <ProductPriceFormatter
                    price={shippingCost}
                    fz="sm"
                    fw={500}
                  />
                </div>
              )}

              {taxAmount > 0 && (
                <div className="flex justify-between items-center">
                  <Text size="sm" c="dimmed">
                    KDV
                  </Text>
                  <ProductPriceFormatter price={taxAmount} fz="sm" fw={500} />
                </div>
              )}

              {discountAmount > 0 && (
                <div className="flex justify-between items-center">
                  <Text size="sm" c="red">
                    İndirim
                  </Text>
                  <ProductPriceFormatter
                    price={-discountAmount}
                    fz="sm"
                    fw={500}
                  />
                </div>
              )}

              <div className="flex justify-between items-center">
                <Text size="md" fw={700}>
                  Toplam
                </Text>
                <ProductPriceFormatter
                  price={data.totalAmount}
                  fz="md"
                  fw={700}
                />
              </div>
            </div>
          </Card>
        </SimpleGrid>
      </SimpleGrid>
    </Stack>
  );
};

export default OrdersPage;
