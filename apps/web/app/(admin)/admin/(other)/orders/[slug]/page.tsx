"use client";

import ProductPriceFormatter from "@/(user)/components/ProductPriceFormatter";
import CustomImage from "@/components/CustomImage";
import GlobalLoadingOverlay from "@/components/GlobalLoadingOverlay";
import fetchWrapper, { ApiError } from "@lib/fetchWrapper";

import { getPaymentStatusLabel, getPaymentTypeLabel } from "@lib/helpers";
import {
  Alert,
  AspectRatio,
  Badge,
  Card,
  Divider,
  Grid,
  Group,
  HoverCard,
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
import { IconMail, IconNote, IconPhone, IconUser } from "@tabler/icons-react";
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
                <Text>Ara Toplam</Text>
                <ProductPriceFormatter price={data.totalPrice} fw={500} />
              </Group>

              {Number(data.discountAmount) > 0 && (
                <Group justify="space-between">
                  <Text c="green.7">İndirim Tutarı</Text>
                  <ProductPriceFormatter
                    price={Number(data.discountAmount)}
                    c="green.7"
                    fw={500}
                  />
                </Group>
              )}

              <Group justify="space-between">
                <Text>
                  Kargo Ücreti
                  {cargoRuleSnapshot.name && (
                    <Text component="span" c="dimmed" fz="sm" ml={4}>
                      ({cargoRuleSnapshot.name})
                    </Text>
                  )}
                </Text>
                {cargoRuleSnapshot.price > 0 ? (
                  <ProductPriceFormatter
                    price={cargoRuleSnapshot.price}
                    fw={500}
                  />
                ) : (
                  <Text c="green.7" fw={500}>
                    Ücretsiz
                  </Text>
                )}
              </Group>

              <Divider my="sm" />

              <Group justify="space-between">
                <Text fw={600} fz="lg">
                  Toplam
                </Text>
                <ProductPriceFormatter
                  price={data.totalFinalPrice}
                  fw={700}
                  fz="lg"
                />
              </Group>
            </FormCard>
            {data.transactions && data.transactions.length > 0 && (
              <FormCard title="Ödemeler">
                <ScrollArea h={400} type="auto">
                  <div className="flex flex-wrap gap-3 p-2">
                    {[...data.transactions]
                      .sort((a, b) => {
                        if (a.status === "PAID" && b.status !== "PAID")
                          return -1;
                        if (a.status !== "PAID" && b.status === "PAID")
                          return 1;
                      })
                      .map((transaction) => {
                        const gatewayResponse =
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          transaction.gatewayResponse as any;
                        const isPaid = transaction.status === "PAID";
                        const isFailed = transaction.status === "FAILED";

                        return (
                          <HoverCard
                            key={transaction.id}
                            width={320}
                            shadow="md"
                          >
                            <HoverCard.Target>
                              <Card
                                className="cursor-pointer transition-all hover:scale-105"
                                withBorder
                                p="md"
                                radius="md"
                                w={180}
                                style={{
                                  borderColor: isPaid
                                    ? "var(--mantine-color-green-6)"
                                    : isFailed
                                      ? "var(--mantine-color-red-6)"
                                      : "var(--mantine-color-yellow-6)",
                                  backgroundColor: isPaid
                                    ? "var(--mantine-color-green-0)"
                                    : isFailed
                                      ? "var(--mantine-color-red-0)"
                                      : "var(--mantine-color-yellow-0)",
                                }}
                              >
                                <Stack gap="xs">
                                  <Badge
                                    color={
                                      isPaid
                                        ? "green"
                                        : isFailed
                                          ? "red"
                                          : "yellow"
                                    }
                                    variant="light"
                                    size="sm"
                                  >
                                    {getPaymentStatusLabel(transaction.status)}
                                  </Badge>
                                  <ProductPriceFormatter
                                    price={transaction.amount}
                                    fw={700}
                                    fz="xl"
                                  />
                                  <Text size="xs" c="dimmed">
                                    {new Date(
                                      transaction.createdAt
                                    ).toLocaleDateString("tr-TR", {
                                      day: "2-digit",
                                      month: "short",
                                      year: "numeric",
                                    })}
                                  </Text>
                                </Stack>
                              </Card>
                            </HoverCard.Target>

                            <HoverCard.Dropdown>
                              <Stack gap="sm">
                                <Group justify="space-between">
                                  <Text size="sm" c="dimmed">
                                    Ödeme Yöntemi
                                  </Text>
                                  <Text size="sm" fw={600}>
                                    {getPaymentTypeLabel(
                                      transaction.paymentType
                                    )}
                                  </Text>
                                </Group>

                                <Group justify="space-between">
                                  <Text size="sm" c="dimmed">
                                    Sağlayıcı
                                  </Text>
                                  <Text size="sm" fw={600}>
                                    {transaction.provider}
                                  </Text>
                                </Group>

                                {transaction.binNumber &&
                                  transaction.lastFourDigits && (
                                    <>
                                      <Divider />
                                      <div>
                                        <Text size="xs" c="dimmed" mb={4}>
                                          Kart Bilgileri
                                        </Text>
                                        <Text size="sm" ff="monospace">
                                          {transaction.binNumber}******
                                          {transaction.lastFourDigits}
                                        </Text>
                                        {transaction.cardAssociation && (
                                          <Text size="xs" c="dimmed" mt={2}>
                                            {transaction.cardAssociation}
                                            {transaction.cardFamilyName &&
                                              ` - ${transaction.cardFamilyName}`}
                                          </Text>
                                        )}
                                      </div>
                                    </>
                                  )}

                                {transaction.providerTransactionId && (
                                  <>
                                    <Divider />
                                    <div>
                                      <Text size="xs" c="dimmed" mb={4}>
                                        İşlem ID
                                      </Text>
                                      <Text size="xs" ff="monospace">
                                        {transaction.providerTransactionId}
                                      </Text>
                                    </div>
                                  </>
                                )}

                                {gatewayResponse?.message && (
                                  <>
                                    <Divider />
                                    <Alert
                                      icon={<IconNote size={16} />}
                                      title="Admin Notu"
                                      color="blue"
                                      variant="light"
                                    >
                                      <Text size="sm">
                                        {gatewayResponse.message}
                                      </Text>
                                    </Alert>
                                  </>
                                )}

                                <Divider />
                                <Text size="xs" c="dimmed" ta="center">
                                  {new Date(
                                    transaction.createdAt
                                  ).toLocaleString("tr-TR", {
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </Text>
                              </Stack>
                            </HoverCard.Dropdown>
                          </HoverCard>
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
