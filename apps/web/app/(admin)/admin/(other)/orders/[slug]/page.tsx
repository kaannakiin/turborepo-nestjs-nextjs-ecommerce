"use client";

import ProductPriceFormatter from "@/(user)/components/ProductPriceFormatter";
import CustomImage from "@/components/CustomImage";
import GlobalLoadingOverlay from "@/components/GlobalLoadingOverlay";
import fetchWrapper, { ApiError } from "@lib/fetchWrapper";

import { getPaymentStatusLabel, getPaymentTypeLabel } from "@lib/helpers";
import {
  AspectRatio,
  Badge,
  Grid,
  Group,
  Image,
  ScrollArea, // DEĞİŞİKLİK: ScrollArea import edildi
  SimpleGrid,
  Stack,
  Table,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { DateFormatter, useQuery } from "@repo/shared";
import { AdminGetOrderReturnType } from "@repo/types";
import { IconMail, IconPhone, IconUser } from "@tabler/icons-react";
import { useParams } from "next/navigation";
import FormCard from "../../store/discounts/components/FormCard";
import AdminOrderAddressCard from "../components/AdminOrderAddressCard";

const AdminOrderViewPage = () => {
  const { slug } = useParams();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-order", slug],
    queryFn: async () => {
      const res = await fetchWrapper.get<AdminGetOrderReturnType>(
        `/admin/orders/${slug}`
      );

      if (!res.success) {
        const error = res as ApiError;
        throw new Error(error.error || "Failed to fetch order");
      }

      return res.data.order;
    },
    enabled: !!slug,
  });

  if (!slug) {
    return <div>Order not found</div>;
  }

  if (!data && !isLoading) {
    return <div>Order not found</div>;
  }

  if (isLoading) {
    return <GlobalLoadingOverlay />;
  }

  const {
    currency,
    locale,
    itemSchema,
    cargoRuleSnapshot,
    billingAddressSnapshot,
    shippingAddressSnapshot,
    user,
  } = data;

  const customerInfo = {
    name: user?.name || shippingAddressSnapshot?.name || "",
    surname: user?.surname || shippingAddressSnapshot?.surname || "",
    email: user?.email || shippingAddressSnapshot?.email || null,
    phone: user?.phone || shippingAddressSnapshot?.phone || null,
  };

  const fullName = `${customerInfo.name} ${customerInfo.surname}`.trim();

  return (
    <Stack gap={"lg"}>
      <Grid className="max-w-8xl w-full lg:mx-auto">
        <Grid.Col
          span={{
            base: 12,
            md: 9,
          }}
        >
          <Stack gap={"lg"}>
            <FormCard title="Sipariş Detayları">
              <Table.ScrollContainer minWidth={800} mah={600}>
                <Table verticalSpacing={"md"} withRowBorders>
                  <Table.Thead bg={"gray.1"}>
                    <Table.Tr>
                      <Table.Th>Ürün</Table.Th>
                      <Table.Th>Adet</Table.Th>
                      <Table.Th>Birim Fiyat</Table.Th>
                      <Table.Th>Toplam Tutar</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  {itemSchema && itemSchema.length > 0 && (
                    <Table.Tbody>
                      {itemSchema.map((item) => {
                        const productName =
                          item.productSnapshot.translations.find(
                            (t) => t.locale === locale
                          )?.name ||
                          item.productSnapshot.translations[0]?.name ||
                          "İsimsiz Ürün";

                        const isVariant = item.variantId !== null;

                        const variantOptions = isVariant
                          ? item.variantSnapshot?.options
                              .map((opt) => {
                                const translation =
                                  opt.productVariantOption.variantOption.translations.find(
                                    (t) => t.locale === locale
                                  );
                                return (
                                  translation?.name ||
                                  opt.productVariantOption.variantOption
                                    .translations[0]?.name ||
                                  "Seçenek"
                                );
                              })
                              .join(" - ")
                          : null;

                        const fullProductName = variantOptions
                          ? `${productName} ~ ${variantOptions}`
                          : productName;

                        const getImages = () => {
                          if (
                            isVariant &&
                            item.variantSnapshot?.assets &&
                            item.variantSnapshot.assets.length > 0
                          ) {
                            return item.variantSnapshot.assets.filter(
                              (asset) => asset.asset.type === "IMAGE"
                            );
                          }
                          return item.productSnapshot.assets.filter(
                            (asset) => asset.asset.type === "IMAGE"
                          );
                        };

                        const images = getImages();
                        const imageUrl =
                          images && images.length > 0
                            ? images[0].asset.url
                            : null;

                        return (
                          <Table.Tr key={item.id}>
                            <Table.Td>
                              <Group gap="md" wrap="nowrap">
                                <AspectRatio ratio={1} w={80} pos={"relative"}>
                                  {imageUrl ? (
                                    <CustomImage
                                      src={imageUrl}
                                      alt={fullProductName}
                                    />
                                  ) : (
                                    <Image
                                      src="https://placehold.co/80x80?text=No+Image"
                                      alt="Placeholder"
                                    />
                                  )}
                                </AspectRatio>
                                <Stack gap={4}>
                                  <Text size="sm" fw={500} lineClamp={2}>
                                    {fullProductName}
                                  </Text>
                                  {item.productSnapshot.sku && (
                                    <Text size="xs" c="dimmed">
                                      SKU:{" "}
                                      {item.variantSnapshot?.sku ||
                                        item.productSnapshot.sku}
                                    </Text>
                                  )}
                                </Stack>
                              </Group>
                            </Table.Td>

                            <Table.Td>
                              <Badge size="lg" variant="light" color="blue">
                                {item.quantity}
                              </Badge>
                            </Table.Td>

                            <Table.Td>
                              <Stack gap={4}>
                                <ProductPriceFormatter
                                  price={item.buyedPrice}
                                  currency={currency}
                                  fw={500}
                                />
                                {item.discountAmount &&
                                  Number(item.discountAmount) > 0 && (
                                    <Text
                                      size="xs"
                                      td="line-through"
                                      c="dimmed"
                                    >
                                      <ProductPriceFormatter
                                        price={
                                          Number(item.totalPrice) /
                                          item.quantity
                                        }
                                        currency={currency}
                                      />
                                    </Text>
                                  )}
                              </Stack>
                            </Table.Td>

                            <Table.Td>
                              <Stack gap={4}>
                                <ProductPriceFormatter
                                  price={item.totalFinalPrice}
                                  currency={currency}
                                  fw={600}
                                  size="sm"
                                />
                                {item.discountAmount &&
                                  Number(item.discountAmount) > 0 && (
                                    <Group gap={4}>
                                      <Text
                                        size="xs"
                                        td="line-through"
                                        c="dimmed"
                                      >
                                        <ProductPriceFormatter
                                          price={item.totalPrice}
                                          currency={currency}
                                        />
                                      </Text>
                                      <Badge
                                        size="xs"
                                        color="green"
                                        variant="light"
                                      >
                                        -
                                        <ProductPriceFormatter
                                          price={item.discountAmount}
                                          currency={currency}
                                        />
                                      </Badge>
                                    </Group>
                                  )}
                              </Stack>
                            </Table.Td>
                          </Table.Tr>
                        );
                      })}
                    </Table.Tbody>
                  )}
                </Table>
              </Table.ScrollContainer>
            </FormCard>

            <FormCard
              title={
                <Group gap={"xs"} p={"md"}>
                  <ThemeIcon c={"black"} variant="transparent">
                    <IconUser />
                  </ThemeIcon>
                  <Title order={4}>Müşteri ve Adres Bilgileri</Title>
                </Group>
              }
            >
              <SimpleGrid
                cols={{
                  base: 1,
                  sm: 2,
                  lg: 3,
                }}
              >
                <FormCard title="Müşteri Bilgileri">
                  <Stack gap="sm">
                    <Group gap="xs" wrap="nowrap" align="flex-start">
                      <IconUser size={16} color="gray" />
                      <Text size="sm" fw={500}>
                        {fullName || "Misafir Kullanıcı"}
                      </Text>
                    </Group>

                    {customerInfo.email && (
                      <Group gap="xs" wrap="nowrap" align="flex-start">
                        <IconMail size={16} color="gray" />
                        <Text size="sm">{customerInfo.email}</Text>
                      </Group>
                    )}

                    {customerInfo.phone && (
                      <Group gap="xs" wrap="nowrap" align="flex-start">
                        <IconPhone size={16} color="gray" />
                        <Text size="sm">{customerInfo.phone}</Text>
                      </Group>
                    )}

                    {user?.id && (
                      <Text size="xs" c="dimmed">
                        Kayıtlı Müşteri
                      </Text>
                    )}

                    {!user?.id && (
                      <Text size="xs" c="dimmed">
                        Misafir Alışveriş
                      </Text>
                    )}
                  </Stack>
                </FormCard>

                {shippingAddressSnapshot && (
                  <AdminOrderAddressCard
                    shippingAddress={shippingAddressSnapshot}
                  />
                )}

                {billingAddressSnapshot && (
                  <AdminOrderAddressCard
                    shippingAddress={billingAddressSnapshot}
                    isBilling={true}
                    title="Fatura Adresi"
                  />
                )}
              </SimpleGrid>
            </FormCard>
          </Stack>
        </Grid.Col>
        <Grid.Col
          span={{
            base: 12,
            md: 3,
          }}
        >
          <Stack gap={"lg"}>
            <FormCard title="Sipariş Özeti">
              <Text>{DateFormatter.withTime(data.createdAt, locale)}</Text>
              <Group justify="space-between">
                <Text fz={"md"}>Ara Toplam </Text>
                <ProductPriceFormatter price={data.totalPrice} />
              </Group>
              {cargoRuleSnapshot.price > 0 ? (
                <Group justify="space-between">
                  <Text fz={"md"}>Kargo Ücreti ({cargoRuleSnapshot.name})</Text>
                  <ProductPriceFormatter price={cargoRuleSnapshot.price} />
                </Group>
              ) : (
                <Group justify="space-between">
                  <Text fz={"md"}>
                    Kargo Ücreti{" "}
                    {cargoRuleSnapshot.name
                      ? `(${cargoRuleSnapshot.name})`
                      : ""}
                  </Text>
                  <Text fz={"md"}>Ücretsiz</Text>
                </Group>
              )}
              <Group justify="space-between">
                <Text fz={"md"}>Toplam</Text>
                <ProductPriceFormatter price={data.totalFinalPrice} />
              </Group>
            </FormCard>
            {data.transactions && data.transactions.length > 0 && (
              <FormCard title="Ödemeler">
                <ScrollArea h={400} type="auto" p="xs">
                  <div className="space-y-4">
                    {[...data.transactions]
                      .sort((a, b) => {
                        if (a.status === "PAID" && b.status !== "PAID")
                          return -1;
                        if (a.status !== "PAID" && b.status === "PAID")
                          return 1;
                        return (
                          new Date(b.createdAt).getTime() -
                          new Date(a.createdAt).getTime()
                        );
                      })
                      .map((transaction) => {
                        const gatewayResponse =
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          transaction.gatewayResponse as any;
                        const hasCustomMessage = gatewayResponse?.message;

                        return (
                          <div
                            key={transaction.id}
                            className={`border rounded-lg p-4 ${
                              transaction.status === "PAID"
                                ? "border-green-500 bg-green-50"
                                : transaction.status === "FAILED"
                                  ? "border-red-500 bg-red-50"
                                  : "border-yellow-500 bg-yellow-50"
                            }`}
                          >
                            {/* Üst Kısım: Temel Bilgiler */}
                            <div className="grid grid-cols-2 gap-4 mb-3">
                              <div>
                                <p className="text-xs text-gray-500">Durum</p>
                                <p className="font-semibold">
                                  {getPaymentStatusLabel(transaction.status)}
                                </p>
                              </div>

                              <div>
                                <p className="text-xs text-gray-500">Tutar</p>
                                <p className="font-semibold">
                                  {Number(transaction.amount).toFixed(2)} ₺
                                </p>
                              </div>

                              <div>
                                <p className="text-xs text-gray-500">
                                  Ödeme Yöntemi
                                </p>
                                <Text fw={700}>
                                  {getPaymentTypeLabel(transaction.paymentType)}
                                </Text>
                              </div>

                              <div>
                                <p className="text-xs text-gray-500">
                                  Sağlayıcı
                                </p>
                                <p className="font-semibold">
                                  {transaction.provider}
                                </p>
                              </div>
                            </div>

                            {/* Kart Bilgileri (varsa) */}
                            {transaction.binNumber &&
                              transaction.lastFourDigits && (
                                <div className="border-t pt-3 mb-3">
                                  <div className="flex flex-col gap-1">
                                    <div>
                                      <p className="text-xs text-gray-500">
                                        Kart
                                      </p>
                                      <p className="font-mono">
                                        {transaction.binNumber}******
                                        {transaction.lastFourDigits}
                                      </p>
                                    </div>

                                    {transaction.cardAssociation && (
                                      <div>
                                        <p className="text-xs text-gray-500">
                                          Kart Tipi
                                        </p>
                                        <p>{transaction.cardAssociation}</p>
                                      </div>
                                    )}

                                    {transaction.cardFamilyName && (
                                      <div>
                                        <p className="text-xs text-gray-500">
                                          Kart Ailesi
                                        </p>
                                        <p>{transaction.cardFamilyName}</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            {transaction.providerTransactionId && (
                              <div className="border-t pt-3 mb-3">
                                <p className="text-xs text-gray-500">
                                  İşlem ID
                                </p>
                                <p className="font-mono text-sm">
                                  {transaction.providerTransactionId}
                                </p>
                              </div>
                            )}

                            {/* Admin Mesajı (varsa) */}
                            {hasCustomMessage && (
                              <div className="border-t pt-3">
                                <div className="bg-blue-50 border border-blue-200 rounded p-3">
                                  <p className="text-xs text-blue-600 font-semibold mb-1">
                                    📝 Admin Notu:
                                  </p>
                                  <p className="text-sm text-blue-900">
                                    {gatewayResponse.message}
                                  </p>
                                </div>
                              </div>
                            )}

                            {/* Tarih */}
                            <div className="border-t pt-3 mt-3">
                              <p className="text-xs text-gray-500">
                                {new Date(transaction.createdAt).toLocaleString(
                                  "tr-TR",
                                  {
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </ScrollArea>
              </FormCard>
            )}
          </Stack>
        </Grid.Col>
      </Grid>
    </Stack>
  );
};

export default AdminOrderViewPage;
