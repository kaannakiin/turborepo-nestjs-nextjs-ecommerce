"use client";

import ProductPriceFormatter from "@/(user)/components/ProductPriceFormatter";
import CustomImage from "@/components/CustomImage";
import GlobalLoadingOverlay from "@/components/GlobalLoadingOverlay";
import { RestoreFocus } from "@dnd-kit/core/dist/components/Accessibility";
import fetchWrapper from "@lib/fetchWrapper";
import {
  getOrderStatusColor,
  getOrderStatusInfos,
  getPaymentStatusColor,
  getPaymentStatusInfos,
} from "@lib/helpers";
import {
  AspectRatio,
  Avatar,
  Badge,
  Card,
  Divider,
  Grid,
  Group,
  ScrollArea,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { DateFormatter, useQuery } from "@repo/shared";
import {
  BuyedVariant,
  GetOrderReturnType,
  NonThreeDSRequest,
  ProductSnapshotForVariant,
} from "@repo/types";
import { IconMail, IconPhone } from "@tabler/icons-react";
import { useParams } from "next/navigation";

const AdminOrderPage = () => {
  const params = useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-order", params.slug],
    queryFn: async (): Promise<GetOrderReturnType> => {
      const res = await fetchWrapper.get<GetOrderReturnType>(
        "/admin/orders/" + params.slug
      );
      if (!res.success || !res.data.success || !res.data.order) {
        return {
          message: " Sipariş bulunamadı",
          success: false,
        };
      }

      return res.data;
    },
  });
  if (!data || isLoading) {
    return <GlobalLoadingOverlay />;
  }
  if (!data.success || !data.order) {
    return <Text>Sipariş Bulunamadı</Text>;
  }
  const { shippingAddress, billingAddress, orderItems, ...restOrderDetails } =
    data.order;

  const formattedShippingAddress = JSON.parse(
    JSON.stringify(shippingAddress)
  ) as NonThreeDSRequest["shippingAddress"];

  const formattedBillingAddress = JSON.parse(
    JSON.stringify(billingAddress)
  ) as NonThreeDSRequest["billingAddress"];

  return (
    <Stack gap={"xs"}>
      <Group gap={"lg"} align="center" justify="space-between">
        <Text fz={"md"} fw={700}>
          {restOrderDetails.orderNumber}
        </Text>
        <Group gap={"xs"}>
          <Badge
            color={getOrderStatusColor(restOrderDetails.orderStatus)}
            size="lg"
          >
            {getOrderStatusInfos(restOrderDetails.orderStatus)}
          </Badge>
          <Badge
            color={getPaymentStatusColor(restOrderDetails.paymentStatus)}
            size="lg"
          >
            {getPaymentStatusInfos(restOrderDetails.paymentStatus)}
          </Badge>
        </Group>
      </Group>
      <Divider my={"xs"} />
      <SimpleGrid
        cols={{
          xs: 2,
          md: 4,
        }}
      >
        <Group
          className="border border-gray-400 rounded-2xl"
          p={"lg"}
          justify="center"
        >
          <Text fz={"md"} fw={700}>
            Sipariş Tarihi
          </Text>
          <Text fz={"md"} fw={500}>
            {DateFormatter.withTime(restOrderDetails.createdAt)}
          </Text>
        </Group>
        <Group
          justify="center"
          className="border border-gray-400 rounded-2xl"
          p={"lg"}
        >
          <Text fz={"md"} fw={700}>
            Toplam Tutar
          </Text>
          <ProductPriceFormatter
            fz={"md"}
            fw={500}
            price={restOrderDetails.totalAmount}
          />
        </Group>
        <Group
          justify="center"
          className="border border-gray-400 rounded-2xl"
          p={"lg"}
        >
          <Text fz={"md"} fw={700}>
            Kazanılan Tutar
          </Text>
          <ProductPriceFormatter fz={"md"} fw={500} price={500} />
          (TBD)
        </Group>
        <Group
          justify="center"
          className="border border-gray-400 rounded-2xl"
          p={"lg"}
        >
          <Text fz={"md"} fw={700}>
            Ödeme Yöntemi
          </Text>
          <Text fz={"md"} fw={500}>
            {restOrderDetails.cardType === "CREDIT_CARD"
              ? "Kredi Kartı"
              : restOrderDetails.cardType === "BANK_TRANSFER"
                ? "Banka Transferi"
                : "Diğer"}
          </Text>
        </Group>
      </SimpleGrid>
      <Grid gutter={"lg"}>
        <Grid.Col
          span={{
            xs: 12,
            md: 8,
          }}
        >
          <Card withBorder className="rounded-2xl">
            <Card.Section p={"sm"} className="border-b border-b-gray-400">
              <Title order={4}>
                Satın Alınan Ürünler ({orderItems.length})
              </Title>
            </Card.Section>
            <ScrollArea h={480} offsetScrollbars>
              <Stack gap={"md"} py={"md"}>
                {orderItems &&
                  orderItems.length > 0 &&
                  orderItems.map((item) => {
                    const isVariant = item.variantId && item.buyedVariants;
                    if (isVariant) {
                      const buyedVariant = JSON.parse(
                        JSON.stringify(item.buyedVariants)
                      ) as BuyedVariant;
                      const productDetail = JSON.parse(
                        JSON.stringify(item.productSnapshot)
                      ) as ProductSnapshotForVariant;
                      const asset =
                        productDetail.assets?.[0]?.asset ||
                        productDetail.product.assets?.[0]?.asset;

                      return (
                        <Group key={item.id} gap={"xs"} align="start" px={"xs"}>
                          {asset && (
                            <AspectRatio ratio={1} pos={"relative"} w={160}>
                              {asset.type === "IMAGE" ? (
                                <CustomImage src={asset.url} />
                              ) : (
                                <video src={asset.url} />
                              )}
                            </AspectRatio>
                          )}
                          <Group
                            align="start"
                            className="w-full flex-1"
                            justify="space-between"
                          >
                            <div className="flex flex-col gap-1">
                              <Text fz={"md"} fw={700}>
                                {productDetail.product.translations?.[0]
                                  ?.name || "İsimsiz Ürün"}
                              </Text>
                              <div className="flex flex-col gap-[1px]">
                                {buyedVariant &&
                                  buyedVariant.map((opt) => (
                                    <Group key={opt.id}>
                                      <Text fz={"xs"}>
                                        {opt.variantGroup.translations?.[0]
                                          ?.name || "Seçenek"}
                                        :{" "}
                                      </Text>
                                      <Text fz={"xs"}>
                                        {opt.translations?.[0]?.name ||
                                          "Seçenek Değeri"}
                                      </Text>
                                    </Group>
                                  ))}
                              </div>
                            </div>
                            <Stack gap={"xs"}>
                              <div className="flex flex-row items-end gap-1">
                                <ProductPriceFormatter
                                  fz={"md"}
                                  fw={700}
                                  price={item.buyedPrice}
                                />
                                <Text fz={"sm"} color="dimmed">
                                  x{item.quantity}
                                </Text>
                              </div>
                            </Stack>
                          </Group>
                        </Group>
                      );
                    }

                    return <Group key={item.id}></Group>;
                  })}
              </Stack>
            </ScrollArea>
          </Card>
        </Grid.Col>
        <Grid.Col
          span={{
            xs: 12,
            md: 4,
          }}
        >
          <Stack gap={"xs"}>
            {restOrderDetails.user && (
              <Card className="rounded-2xl" withBorder>
                <Card.Section
                  p={"sm"}
                  className="border-b border-b-gray-400 font-semibold"
                >
                  Müşteri Bilgileri
                </Card.Section>
                <Stack gap={"xs"} py={"md"}>
                  <Group gap={"xs"}>
                    <Avatar size={"md"} radius={"xl"} />
                    <div className="flex-1 flex flex-col gap-[1px] ">
                      <Group gap={"xs"}>
                        <Text tt={"capitalize"}>
                          {restOrderDetails.user.name}{" "}
                          {restOrderDetails.user.surname}
                        </Text>
                        {restOrderDetails.user.successfulOrderCount > 1 && (
                          <Text fz={"xs"} c={"dimmed"}>
                            ({restOrderDetails.user.successfulOrderCount}{" "}
                            Sipariş)
                          </Text>
                        )}
                      </Group>
                    </div>
                  </Group>
                  {restOrderDetails.user.email && (
                    <Group gap={"xs"} px={"2px"}>
                      <ThemeIcon variant="transparent" c={"dimmed"} size={"sm"}>
                        <IconMail />
                      </ThemeIcon>
                      <Text fz={"xs"} c="dimmed">
                        {restOrderDetails.user.email}
                      </Text>
                    </Group>
                  )}
                  {restOrderDetails.user.phone && (
                    <Group gap={"xs"} px={"2px"}>
                      <ThemeIcon variant="transparent" c={"dimmed"} size={"sm"}>
                        <IconPhone />
                      </ThemeIcon>
                      <Text fz={"xs"} c="dimmed">
                        {restOrderDetails.user.phone}
                      </Text>
                    </Group>
                  )}
                </Stack>
              </Card>
            )}
          </Stack>
        </Grid.Col>
      </Grid>
    </Stack>
  );
};

export default AdminOrderPage;
