"use client";

import ProductPriceFormatter from "@/(user)/components/ProductPriceFormatter";
import CustomImage from "@/components/CustomImage";
import GlobalLoadingOverlay from "@/components/GlobalLoadingOverlay";
import fetchWrapper from "@lib/fetchWrapper";
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
  CardAssociation,
  GetOrderReturnType,
  NonThreeDSRequest,
  ProductSnapshot,
  ProductSnapshotForVariant,
} from "@repo/types";
import { IconMail, IconPhone } from "@tabler/icons-react";
import { useParams } from "next/navigation";
import OrderStatusStepper from "../components/OrderStatusStepper";
import {
  getCartAssociationUrl,
  getPaymentStatusColor,
  getPaymentStatusInfos,
} from "@lib/helpers";

const AdminOrderPage = () => {
  const params = useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-order", params.slug],
    queryFn: async (): Promise<GetOrderReturnType> => {
      if (!params.slug) {
        throw new Error("Sipariş numarası URL'de bulunamadı.");
      }
      const res = await fetchWrapper.get<GetOrderReturnType>(
        `/admin/orders/${params.slug}`
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
      <SimpleGrid
        cols={{
          xs: 2,
          md: 6,
        }}
      >
        <Group
          className="border border-gray-400 rounded-2xl"
          justify="center"
          wrap="nowrap"
        >
          <Text fz={"md"} fw={700}>
            {restOrderDetails.orderNumber}
          </Text>
        </Group>
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
          (TODO)
        </Group>
      </SimpleGrid>
      <Grid gutter={"lg"}>
        <Grid.Col
          span={{
            xs: 12,
            md: 8,
          }}
        >
          <Stack gap={"lg"}>
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
                          <Group
                            key={item.id}
                            gap={"xs"}
                            align="start"
                            px={"xs"}
                          >
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
                                  <Text fz={"sm"} c="dimmed">
                                    x{item.quantity}
                                  </Text>
                                </div>
                              </Stack>
                            </Group>
                          </Group>
                        );
                      } else {
                        const productDetail = JSON.parse(
                          JSON.stringify(item.productSnapshot)
                        ) as ProductSnapshot;
                        const { assets, translations } = productDetail;
                        const asset = assets?.[0]?.asset || null;
                        const translation = translations?.[0] || null;
                        return (
                          <Group
                            key={item.id}
                            gap={"xs"}
                            align="start"
                            px={"xs"}
                          >
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
                                  {translation?.name || "İsimsiz Ürün"}
                                </Text>
                              </div>
                              <Stack gap={"xs"}>
                                <div className="flex flex-row items-end gap-1">
                                  <ProductPriceFormatter
                                    fz={"md"}
                                    fw={700}
                                    price={item.buyedPrice}
                                  />
                                  <Text fz={"sm"} c="dimmed">
                                    x{item.quantity}
                                  </Text>
                                </div>
                              </Stack>
                            </Group>
                          </Group>
                        );
                      }
                    })}
                </Stack>
              </ScrollArea>
            </Card>
            <Card withBorder className="rounded-2xl">
              <Card.Section p={"sm"} className="border-b border-b-gray-400">
                <Title order={4}>Ödeme Bilgileri</Title>
              </Card.Section>

              <Stack gap={"md"} py={"md"}>
                {/* Ödeme Durumu */}
                <Group justify="space-between" align="center" wrap="nowrap">
                  <Text fz={"sm"} c="dimmed">
                    Ödeme Durumu
                  </Text>
                  <Badge
                    color={getPaymentStatusColor(
                      restOrderDetails.paymentStatus
                    )}
                    size="lg"
                  >
                    {getPaymentStatusInfos(restOrderDetails.paymentStatus)}
                  </Badge>
                </Group>

                <Group justify="space-between" align="center" wrap="nowrap">
                  <Text fz={"sm"} c="dimmed">
                    Ödeme Yöntemi
                  </Text>
                  <Avatar
                    src={
                      getCartAssociationUrl(
                        restOrderDetails.cardAssociation as CardAssociation
                      ) || getCartAssociationUrl("AMERICAN_EXPRESS")
                    }
                    size={"lg"}
                    radius="0px"
                  />
                </Group>

                <Divider />

                {restOrderDetails.cardType && (
                  <>
                    <Group justify="space-between" align="center" wrap="nowrap">
                      <Text fz={"sm"} c="dimmed">
                        Kart Tipi
                      </Text>
                      <Text fz={"sm"} fw={500}>
                        {restOrderDetails.cardType === "CREDIT_CARD"
                          ? "Kredi Kartı"
                          : restOrderDetails.cardType === "DEBIT_CARD"
                            ? "Banka Kartı"
                            : restOrderDetails.cardType}
                      </Text>
                    </Group>

                    {restOrderDetails.cardAssociation && (
                      <Group
                        justify="space-between"
                        align="center"
                        wrap="nowrap"
                      >
                        <Text fz={"sm"} c="dimmed">
                          Kart Markası
                        </Text>
                        <Group gap={4}>
                          <Text fz={"sm"} fw={500} tt="uppercase">
                            {restOrderDetails.cardAssociation}
                          </Text>
                          {restOrderDetails.cardFamily && (
                            <Badge size="sm" variant="light">
                              {restOrderDetails.cardFamily}
                            </Badge>
                          )}
                        </Group>
                      </Group>
                    )}

                    {restOrderDetails.lastFourDigits && (
                      <Group
                        justify="space-between"
                        align="center"
                        wrap="nowrap"
                      >
                        <Text fz={"sm"} c="dimmed">
                          Kart Numarası
                        </Text>
                        <Text fz={"sm"} fw={500} className="font-mono">
                          {restOrderDetails.binNumber
                            ? `${restOrderDetails.binNumber}** **** ${restOrderDetails.lastFourDigits}`
                            : `**** **** **** ${restOrderDetails.lastFourDigits}`}
                        </Text>
                      </Group>
                    )}

                    <Divider />
                  </>
                )}

                {/* İşlem Bilgileri */}
                {restOrderDetails.paymentId && (
                  <Group justify="space-between" align="start" wrap="nowrap">
                    <Text fz={"sm"} c="dimmed">
                      İşlem ID
                    </Text>
                    <Text
                      fz={"xs"}
                      fw={500}
                      className="font-mono text-right break-all"
                      maw={200}
                    >
                      {restOrderDetails.paymentId}
                    </Text>
                  </Group>
                )}

                {restOrderDetails.conversationId && (
                  <Group justify="space-between" align="start" wrap="nowrap">
                    <Text fz={"sm"} c="dimmed">
                      Conversation ID
                    </Text>
                    <Text
                      fz={"xs"}
                      fw={500}
                      className="font-mono text-right break-all"
                      maw={200}
                    >
                      {restOrderDetails.conversationId}
                    </Text>
                  </Group>
                )}

                <Divider />

                {/* Fiyat Detayları */}
                <Stack gap={"xs"}>
                  <Group justify="space-between" align="center">
                    <Text fz={"sm"} c="dimmed">
                      Ara Toplam
                    </Text>
                    <ProductPriceFormatter
                      fz={"sm"}
                      fw={500}
                      price={restOrderDetails.subtotal}
                    />
                  </Group>

                  {restOrderDetails.shippingCost &&
                  restOrderDetails.shippingCost > 0 ? (
                    <Group justify="space-between" align="center">
                      <Text fz={"sm"} c="dimmed">
                        Kargo Ücreti
                      </Text>
                      <ProductPriceFormatter
                        fz={"sm"}
                        fw={500}
                        price={restOrderDetails.shippingCost}
                      />
                    </Group>
                  ) : (
                    <Group justify="space-between" align="center">
                      <div></div>
                      <Text>Ücretsiz Kargo</Text>
                    </Group>
                  )}

                  {restOrderDetails.discountAmount &&
                    restOrderDetails.discountAmount > 0 && (
                      <Group justify="space-between" align="center">
                        <Text fz={"sm"} c="red">
                          İndirim
                        </Text>
                        <Text fz={"sm"} fw={500} c="red">
                          -
                          <ProductPriceFormatter
                            price={restOrderDetails.discountAmount}
                          />
                        </Text>
                      </Group>
                    )}

                  {restOrderDetails.taxAmount &&
                    restOrderDetails.taxAmount > 0 && (
                      <Group justify="space-between" align="center">
                        <Text fz={"sm"} c="dimmed">
                          KDV
                        </Text>
                        <ProductPriceFormatter
                          fz={"sm"}
                          fw={500}
                          price={restOrderDetails.taxAmount}
                        />
                      </Group>
                    )}

                  <Divider />

                  <Group justify="space-between" align="center">
                    <Text fz={"md"} fw={700}>
                      Toplam Tutar
                    </Text>
                    <ProductPriceFormatter
                      fz={"lg"}
                      fw={700}
                      price={restOrderDetails.totalAmount}
                    />
                  </Group>
                </Stack>
              </Stack>
            </Card>
          </Stack>
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
                  <Title order={4}>Müşteri Bilgileri</Title>
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
            <Card className="rounded-2xl" withBorder>
              <Card.Section
                p={"sm"}
                className="border-b border-b-gray-400 font-semibold"
              >
                <Title order={4}>Teslimat Bilgileri</Title>
              </Card.Section>
              <Stack gap={"2px"} py={"xs"}>
                <Text fz={"sm"} fw={500}>
                  {formattedShippingAddress.contactName}
                </Text>
                <div>
                  <Text fz={"sm"} fw={500}>
                    {formattedShippingAddress.address}
                  </Text>
                  <Text fz={"sm"} fw={500}>
                    {formattedShippingAddress.city} /{" "}
                    {formattedShippingAddress.country}{" "}
                  </Text>
                </div>
              </Stack>
            </Card>
            {formattedBillingAddress && (
              <Card className="rounded-2xl" withBorder>
                <Card.Section
                  p={"sm"}
                  className="border-b border-b-gray-400 font-semibold"
                >
                  <Title order={4}>Fatura Bilgileri</Title>
                </Card.Section>
                <Stack gap={"2px"} py={"xs"}>
                  <Text fz={"sm"} fw={500}>
                    {formattedBillingAddress.contactName}
                  </Text>
                  <div>
                    <Text fz={"sm"} fw={500}>
                      {formattedBillingAddress.address}
                    </Text>
                    <Text fz={"sm"} fw={500}>
                      {formattedBillingAddress.city} /{" "}
                      {formattedBillingAddress.country}{" "}
                    </Text>
                  </div>
                </Stack>
              </Card>
            )}
            {(restOrderDetails.customerNotes ||
              restOrderDetails.adminNotes) && (
              <Card className="rounded-2xl" withBorder>
                <Card.Section
                  p={"sm"}
                  className="border-b border-b-gray-400 font-semibold"
                >
                  <Title order={4}>Sipariş Notları</Title>
                </Card.Section>
                <Stack gap={"2px"} py={"xs"}>
                  {restOrderDetails.customerNotes && (
                    <Text fz={"sm"}>{restOrderDetails.customerNotes}</Text>
                  )}
                  {restOrderDetails.adminNotes && (
                    <div>
                      <Text fz={"sm"}>Admin Notu:</Text>
                      <Text fz={"sm"}>{restOrderDetails.adminNotes}</Text>
                    </div>
                  )}
                </Stack>
              </Card>
            )}
            <Card className="rounded-2xl" withBorder>
              <Card.Section
                p={"sm"}
                className="border-b border-b-gray-400 font-semibold"
              >
                <Title order={4}>Sipariş Durumu</Title>
              </Card.Section>
              <Stack py={"md"}>
                <OrderStatusStepper status={restOrderDetails.orderStatus} />
              </Stack>
            </Card>
          </Stack>
        </Grid.Col>
      </Grid>
    </Stack>
  );
};

export default AdminOrderPage;
