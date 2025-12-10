/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import ProductPriceFormatter from "@/(user)/components/ProductPriceFormatter";
import CustomImage from "@/components/CustomImage";
import GlobalLoadingOverlay from "@/components/GlobalLoadingOverlay";
import fetchWrapper, { ApiError } from "@lib/wrappers/fetchWrapper";
import {
  AspectRatio,
  Badge,
  Card,
  Divider,
  Group,
  Paper,
  ScrollArea,
  Stack,
  Text,
  Timeline,
  Title,
} from "@mantine/core";
import {
  DateFormatter,
  getActorTypeLabel,
  getCartActivityColor,
  getCartActivityLabel,
  getCurrencyFullLabel,
  getInvisibleCauseLabel,
  getWhereAddedLabel,
  useQuery,
} from "@repo/shared";
import { GetCartForAdminReturnType } from "@repo/types";
import {
  IconActivity,
  IconAlertCircle,
  IconCircleCheck,
  IconCircleX,
  IconClock,
  IconCreditCard,
  IconMapPin,
  IconPackage,
  IconShoppingCart,
  IconTrendingUp,
  IconUser,
} from "@tabler/icons-react";

import { useParams } from "next/navigation";
import React, { ReactNode } from "react";

const getStatusBadge = (status: string) => {
  const statusConfig = {
    ACTIVE: {
      color: "green",
      label: "Aktif",
      icon: IconCircleCheck,
    },
    ABANDONED: {
      color: "yellow",
      label: "Terk Edilmiş",
      icon: IconAlertCircle,
    },
    COMPLETED: {
      color: "blue",
      label: "Tamamlandı",
      icon: IconCircleCheck,
    },
    MERGED: {
      color: "violet",
      label: "Birleştirildi",
      icon: IconTrendingUp,
    },
  };

  const config =
    statusConfig[status as keyof typeof statusConfig] || statusConfig.ACTIVE;

  return (
    <Badge
      size="lg"
      variant="light"
      color={config.color}
      leftSection={<config.icon size={16} />}
    >
      {config.label}
    </Badge>
  );
};

const getActivityIcon = (type: string) => {
  const icons: Record<string, React.ReactNode> = {
    CART_CREATED: <IconShoppingCart />,
    ITEM_ADDED: <IconPackage />,
    ITEM_REMOVED: <IconCircleX />,
    ITEM_QUANTITY_CHANGED: <IconTrendingUp />,
    SHIPPING_ADDRESS_SET: <IconMapPin />,
    BILLING_ADDRESS_SET: <IconMapPin />,
    PAYMENT_ATTEMPT_SUCCESS: <IconCircleCheck />,
    PAYMENT_ATTEMPT_FAILED: <IconCircleX />,
    CART_MERGED: <IconTrendingUp />,
    CART_STATUS_CHANGED: <IconActivity />,
    ITEM_VISIBILITY_CHANGED: <IconAlertCircle />,
  };

  return icons[type] || <IconActivity />;
};

const formatDate = (date: Date) => {
  return DateFormatter.withTime(date, "TR");
};
const CartViewPage = () => {
  const { slug } = useParams();

  const { data: cart, isLoading } = useQuery({
    queryKey: ["admin-cart", { slug }],
    queryFn: async () => {
      const response = await fetchWrapper.get<GetCartForAdminReturnType>(
        `/admin/carts/${slug}`
      );
      if (!response.success) {
        const error = response as ApiError;
        throw new Error(error.error || "Failed to fetch cart data");
      }
      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to fetch cart data");
      }
      return response.data.cart;
    },
    gcTime: 0,
    staleTime: 0,
  });

  if (isLoading) {
    return <GlobalLoadingOverlay />;
  }

  if (!cart) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <IconAlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900">
            Sepet bulunamadı
          </h2>
        </div>
      </div>
    );
  }

  const totalItems = cart.items.length;
  const totalPrice = cart.items.reduce((sum, item) => {
    const priceData =
      item.variant && item.variantId
        ? item.variant.prices
        : item.product.prices;
    const localePrice = priceData.find((p) => p.currency === cart.currency);
    const itemPrice = localePrice?.discountedPrice ?? localePrice?.price ?? 0;
    return sum + itemPrice * item.quantity;
  }, 0);

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl lg:mx-auto space-y-6">
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Group justify="space-between" mb="md">
            {getStatusBadge(cart.status)}
          </Group>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Paper p="md" radius="md" bg="gray.0">
              <Text size="sm" c="dimmed" mb={4}>
                Toplam Ürün
              </Text>
              <Text size="xl" fw={500}>
                {totalItems}
              </Text>
            </Paper>
            <Paper p="md" radius="md" bg="gray.0">
              <Text size="sm" c="dimmed" mb={4}>
                Toplam Tutar
              </Text>
              <ProductPriceFormatter
                price={totalPrice}
                currency={cart.currency}
                size="xl"
                fw={500}
              />
            </Paper>
            <Paper p="md" radius="md" bg="gray.0">
              <Text size="sm" c="dimmed" mb={4}>
                Aktivite Sayısı
              </Text>
              <Text size="xl" fw={500}>
                {cart.cartActivityLogs.length}
              </Text>
            </Paper>
            <Paper p="md" radius="md" bg="gray.0">
              <Text size="sm" c="dimmed" mb={4}>
                Sipariş Denemeleri
              </Text>
              <Text size="xl" fw={500}>
                {cart.orderAttempts.length}
              </Text>
            </Paper>
            <Paper p="md" radius="md" bg="gray.0">
              <Text size="sm" c="dimmed" mb={4}>
                Para Birimi
              </Text>
              <Text size="xl" fw={500}>
                {getCurrencyFullLabel(cart.currency)}
              </Text>
            </Paper>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 space-y-6">
            {cart.user && (
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Group mb="md">
                  <IconUser size={24} color="var(--mantine-color-gray-6)" />
                  <Title order={3}>Müşteri Bilgileri</Title>
                </Group>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Text size="sm" c="dimmed">
                      Ad Soyad
                    </Text>
                    <Text fw={500}>
                      {cart.user.name} {cart.user.surname}
                    </Text>
                  </div>
                  <div>
                    <Text size="sm" c="dimmed">
                      E-posta
                    </Text>
                    <Text fw={500}>{cart.user.email}</Text>
                  </div>
                  <div>
                    <Text size="sm" c="dimmed">
                      Telefon
                    </Text>
                    <Text fw={500}>{cart.user.phone}</Text>
                  </div>
                  <div>
                    <Text size="sm" c="dimmed">
                      Rol
                    </Text>
                    <Text fw={500}>{cart.user.role}</Text>
                  </div>
                </div>
              </Card>
            )}

            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Group mb="md">
                <IconPackage size={24} color="var(--mantine-color-gray-6)" />
                <Title order={3}>Sepetteki Ürünler</Title>
              </Group>
              <Stack gap="md">
                {cart.items.map((item) => {
                  const product = item.product;
                  const variant = item.variant;
                  const priceData =
                    item.variant && item.variantId
                      ? item.variant.prices
                      : item.product.prices;
                  const localePrice = priceData.find(
                    (p) => p.currency === cart.currency
                  );
                  const originalPrice = localePrice?.price || 0;
                  const discountedPrice = localePrice?.discountedPrice;
                  const finalPrice = discountedPrice ?? originalPrice;
                  const hasDiscount =
                    discountedPrice && discountedPrice < originalPrice;
                  const productName =
                    product?.translations?.[0]?.name || "İsimsiz Ürün";
                  const imageUrl =
                    product?.assets?.[0]?.asset?.url ||
                    variant?.assets?.[0]?.asset?.url;

                  return (
                    <Paper
                      key={item.id}
                      p="md"
                      radius="md"
                      withBorder
                      style={{
                        borderColor: item.isVisible
                          ? "var(--mantine-color-gray-3)"
                          : "var(--mantine-color-red-3)",
                        backgroundColor: item.isVisible
                          ? "white"
                          : "var(--mantine-color-red-0)",
                      }}
                    >
                      <Group align="flex-start" wrap="nowrap">
                        <AspectRatio ratio={1} w={80}>
                          {imageUrl && <CustomImage src={imageUrl} />}
                        </AspectRatio>
                        <Stack gap="xs" style={{ flex: 1 }}>
                          <Group justify="space-between" align="flex-start">
                            <Text fw={500}>
                              {productName}{" "}
                              {variant?.options
                                ?.map(
                                  (opt) =>
                                    opt.productVariantOption.variantOption
                                      .translations[0]?.name
                                )
                                .join(" - ")}
                            </Text>
                            <Stack gap={2} align="flex-end">
                              {hasDiscount && (
                                <ProductPriceFormatter
                                  price={originalPrice}
                                  currency={cart.currency}
                                  size="sm"
                                  c="dimmed"
                                  td="line-through" // Üstü çizili
                                />
                              )}
                              <ProductPriceFormatter
                                price={finalPrice}
                                fw={600}
                                currency={cart.currency}
                                c={hasDiscount ? "red" : undefined} // İndirimli ise kırmızı
                              />
                              <Text size="sm" c="dimmed">
                                Adet: {item.quantity}
                              </Text>
                            </Stack>
                          </Group>

                          {!item.isVisible && (
                            <Group gap="xs">
                              <IconAlertCircle
                                size={16}
                                color="var(--mantine-color-red-6)"
                              />
                              <Text size="sm" c="red">
                                Görünmez -{" "}
                                {getInvisibleCauseLabel(item.visibleCause) ||
                                  "Bilinmeyen sebep"}
                              </Text>
                            </Group>
                          )}
                        </Stack>
                      </Group>
                    </Paper>
                  );
                })}
              </Stack>
            </Card>

            {cart.cartPaymentCheckAttempts.length > 0 && (
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Group mb="md">
                  <IconCreditCard
                    size={24}
                    color="var(--mantine-color-gray-6)"
                  />
                  <Title order={3}>Ödeme Denemeleri</Title>
                </Group>
                <Stack gap="sm">
                  {cart.cartPaymentCheckAttempts.map((attempt) => (
                    <Paper
                      key={attempt.id}
                      p="md"
                      radius="md"
                      withBorder
                      style={{
                        borderColor: attempt.isSuccess
                          ? "var(--mantine-color-green-3)"
                          : "var(--mantine-color-red-3)",
                        backgroundColor: attempt.isSuccess
                          ? "var(--mantine-color-green-0)"
                          : "var(--mantine-color-red-0)",
                      }}
                    >
                      <Group
                        justify="space-between"
                        mb={attempt.message ? "xs" : 0}
                      >
                        <Group>
                          {attempt.isSuccess ? (
                            <IconCircleCheck
                              size={24}
                              color="var(--mantine-color-green-6)"
                            />
                          ) : (
                            <IconCircleX
                              size={24}
                              color="var(--mantine-color-red-6)"
                            />
                          )}
                          <Text
                            fw={500}
                            c={attempt.isSuccess ? "green.9" : "red.9"}
                          >
                            {attempt.isSuccess ? "Başarılı" : "Başarısız"}
                          </Text>
                        </Group>
                        <Text size="sm" c="dimmed">
                          {formatDate(attempt.createdAt)}
                        </Text>
                      </Group>
                      {attempt.message && (
                        <Text size="sm" c="dimmed">
                          {attempt.message}
                        </Text>
                      )}
                    </Paper>
                  ))}
                </Stack>
              </Card>
            )}
          </div>

          <Stack gap="md" className="lg:col-span-2">
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Group mb="md">
                <IconClock size={24} color="var(--mantine-color-gray-6)" />
                <Title order={3}>Aktivite Zaman Çizelgesi</Title>
              </Group>

              <ScrollArea h={500} type="auto" pr={"lg"}>
                <Timeline
                  active={cart.cartActivityLogs.length}
                  bulletSize={24}
                  lineWidth={2}
                >
                  {cart.cartActivityLogs.map((log, index) => {
                    const details = log.details as any;
                    const context = details?.context;

                    let color = getCartActivityColor(log.activityType);

                    if (
                      log.activityType === "ITEM_QUANTITY_CHANGED" &&
                      context?.oldQty !== undefined &&
                      context?.newQty !== undefined
                    ) {
                      color = context.newQty < context.oldQty ? "red" : "green";
                    }
                    return (
                      <Timeline.Item
                        key={log.id}
                        bullet={getActivityIcon(log.activityType)}
                        title={
                          <Group justify="space-between" wrap="nowrap">
                            <Text size="sm" fw={500}>
                              {getCartActivityLabel(log.activityType)}
                            </Text>
                            <Text size="xs" c="dimmed">
                              {formatDate(log.createdAt)}
                            </Text>
                          </Group>
                        }
                        color={color}
                      >
                        <Stack gap="xs" mt="xs">
                          {details?.message && (
                            <Text size="sm" c="dimmed">
                              {details.message}
                            </Text>
                          )}
                          <Badge variant="light" size="sm" color={color}>
                            {getActorTypeLabel(log.actorType)}
                          </Badge>
                        </Stack>
                      </Timeline.Item>
                    );
                  })}
                </Timeline>
              </ScrollArea>
            </Card>
          </Stack>
        </div>
      </div>
    </div>
  );
};

export default CartViewPage;
