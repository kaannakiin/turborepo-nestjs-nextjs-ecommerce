"use client";

import ProductPriceFormatter from "@/(user)/components/ProductPriceFormatter";
import AddToCartButtonV2 from "@/components/AddToCartButtonV2";
import CustomImage from "@/components/CustomImage";
import { getAspectRatioValue } from "@lib/helpers";
import {
  AspectRatio,
  Badge,
  Box,
  Card,
  Group,
  Stack,
  Text,
  useMantineTheme,
} from "@mantine/core";
import { useHover } from "@mantine/hooks";
import { getDiscountRateLabel } from "@repo/shared";
import { AspectRatio as AspectType, ProductCart } from "@repo/types";
import { IconShoppingBagCheck } from "@tabler/icons-react";
import { Route } from "next";
import Link from "next/link";

interface FirstThemeProductCartProps {
  data: ProductCart;
  aspectRatio: AspectType;
  showAddToCartButton: boolean;
}

const FirstThemeProductCart = ({
  data,
  aspectRatio = "3/4",
  showAddToCartButton = true,
}: FirstThemeProductCartProps) => {
  const theme = useMantineTheme();

  const { hovered, ref } = useHover();

  const primaryImage = data.images[0]?.url;
  const secondaryImage = data.images[1]?.url;

  const isHoverable = !!primaryImage && !!secondaryImage;

  const currentImage = isHoverable && hovered ? secondaryImage : primaryImage;

  if (!primaryImage) return null;

  return (
    <Card ref={ref} padding="0" radius="0">
      <Link
        href={data.url as Route}
        style={{ textDecoration: "none", color: "inherit" }}
      >
        <Box pos="relative">
          <AspectRatio ratio={getAspectRatioValue(aspectRatio)}>
            <CustomImage src={currentImage} alt={data.name} />
          </AspectRatio>

          {data.discountPrice && (
            <Badge
              pos="absolute"
              top={theme.spacing.xl}
              left={0}
              py={"md"}
              color="primary"
              radius="0"
            >
              {getDiscountRateLabel(data.price, data.discountPrice)}
            </Badge>
          )}
        </Box>

        <Stack p="sm" gap={4}>
          <Text fw={500} lineClamp={1} size="sm" title={data.name}>
            {data.name}
          </Text>

          <Group gap={8}>
            {data.discountPrice ? (
              <>
                <ProductPriceFormatter
                  price={data.discountPrice}
                  fw={700}
                  c="red"
                  size="md"
                />
                <ProductPriceFormatter
                  price={data.price}
                  size="sm"
                  c="dimmed"
                  td="line-through"
                />
              </>
            ) : (
              <ProductPriceFormatter price={data.price} fw={700} size="md" />
            )}
          </Group>
        </Stack>
      </Link>
      {showAddToCartButton && (
        <AddToCartButtonV2
          props={{
            size: "sm",
            radius: "sm",
            mx: "sm",
            variant: "outline",
            leftSection: <IconShoppingBagCheck />,
          }}
          data={{
            productId: data.id,
            price: data.price,
            productName: data.name,
            productSlug: data.url,
            quantity: 1,
            whereAdded: "PRODUCT_PAGE",
          }}
        />
      )}
    </Card>
  );
};

export default FirstThemeProductCart;
