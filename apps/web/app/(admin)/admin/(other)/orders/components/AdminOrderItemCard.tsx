"use client";
import {
  AspectRatio,
  Badge,
  Card,
  Group,
  Image,
  Stack,
  Text,
} from "@mantine/core";
import { OrderItemWithSnapshot } from "@repo/types";
import { Locale, Currency } from "@repo/database/client";
import ProductPriceFormatter from "@/(user)/components/ProductPriceFormatter";
import CustomImage from "@/components/CustomImage";

interface AdminOrderItemCardProps {
  item: OrderItemWithSnapshot;
  locale?: Locale;
  currency?: Currency;
}

const AdminOrderItemCard = ({
  item,
  locale = "TR",
  currency = "TRY",
}: AdminOrderItemCardProps) => {
  const getProductName = () => {
    const translation = item.productSnapshot.translations.find(
      (t) => t.locale === locale
    );
    return (
      translation?.name ||
      item.productSnapshot.translations[0]?.name ||
      "İsimsiz Ürün"
    );
  };

  const getVariantOptions = () => {
    if (!item.variantSnapshot?.options) return null;

    return item.variantSnapshot.options
      .map((option) => {
        const variantOption = option.productVariantOption.variantOption;
        const translation = variantOption.translations.find(
          (t) => t.locale === locale
        );
        return translation?.name || variantOption.translations[0]?.name;
      })
      .filter(Boolean)
      .join(" - ");
  };

  const getFullProductName = () => {
    const productName = getProductName();
    const variantOptions = getVariantOptions();

    if (variantOptions) {
      return `${productName} - ${variantOptions}`;
    }

    return productName;
  };

  const getImageUrl = () => {
    if (
      item.variantSnapshot?.assets &&
      item.variantSnapshot.assets.length > 0
    ) {
      return item.variantSnapshot.assets[0].asset.url;
    }

    if (item.productSnapshot.assets && item.productSnapshot.assets.length > 0) {
      return item.productSnapshot.assets[0].asset.url;
    }

    return null;
  };

  const imageUrl = getImageUrl();
  const fullProductName = getFullProductName();

  return (
    <Card shadow="sm" padding="md" radius="md" withBorder>
      <Group wrap="nowrap" gap="md">
        {imageUrl && (
          <AspectRatio ratio={1} pos={"relative"} maw={200}>
            <CustomImage src={imageUrl} />
          </AspectRatio>
        )}
        <Stack gap="xs" style={{ flex: 1 }}>
          <Text size="sm" fw={600} lineClamp={2}>
            {fullProductName}
          </Text>

          {item.variantSnapshot?.options && (
            <Group gap="xs">
              {item.variantSnapshot.options.map((option, index) => {
                const variantOption = option.productVariantOption.variantOption;
                const groupType = variantOption.variantGroup.type;

                if (groupType === "COLOR" && variantOption.hexValue) {
                  return (
                    <div
                      key={index}
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        backgroundColor: variantOption.hexValue,
                        border: "1px solid #e0e0e0",
                      }}
                    />
                  );
                }

                if (variantOption.asset) {
                  return (
                    <Image
                      key={index}
                      src={variantOption.asset.url}
                      alt={variantOption.translations[0]?.name || ""}
                      width={20}
                      height={20}
                      radius="sm"
                    />
                  );
                }

                return null;
              })}
            </Group>
          )}

          {(item.productSnapshot.sku || item.variantSnapshot?.sku) && (
            <Text size="xs" c="dimmed">
              SKU: {item.variantSnapshot?.sku || item.productSnapshot.sku}
            </Text>
          )}
        </Stack>

        <Stack gap="xs" align="flex-end" style={{ minWidth: 120 }}>
          <Badge size="lg" variant="filled" color="blue">
            {item.quantity} Adet
          </Badge>

          <Stack gap={4} align="flex-end">
            <ProductPriceFormatter
              price={item.buyedPrice}
              currency={currency}
              size="sm"
              fw={600}
            />

            <ProductPriceFormatter
              price={item.totalFinalPrice}
              currency={currency}
              size="xs"
              c="dimmed"
            />

            {/* İndirim Varsa */}
            {item.discountAmount && Number(item.discountAmount) > 0 && (
              <Group gap={4}>
                <Text size="xs" td="line-through" c="dimmed">
                  <ProductPriceFormatter
                    price={item.totalPrice}
                    currency={currency}
                  />
                </Text>
                <Badge size="xs" color="green" variant="light">
                  -{" "}
                  <ProductPriceFormatter
                    price={item.discountAmount}
                    currency={currency}
                  />
                </Badge>
              </Group>
            )}
          </Stack>
        </Stack>
      </Group>
    </Card>
  );
};

export default AdminOrderItemCard;
