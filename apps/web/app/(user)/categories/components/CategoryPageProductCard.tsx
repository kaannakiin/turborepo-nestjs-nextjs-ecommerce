"use client";
import ProductPriceFormatter from "@/(user)/components/ProductPriceFormatter";
import CustomImage from "@/components/CustomImage";
import { AspectRatio, Badge, Card, Stack, Text } from "@mantine/core";
import { useHover } from "@mantine/hooks";
import { AssetType } from "@repo/database/client";
import { GetCategoryProductsResponse } from "@repo/types";
import { useRouter } from "next/navigation";

interface CategoryPageProductCardProps {
  product: GetCategoryProductsResponse["products"][number];
}

const CategoryPageProductCard = ({ product }: CategoryPageProductCardProps) => {
  const { ref, hovered } = useHover();
  const { push } = useRouter();

  const isVariant = product.variantOptions && product.variantOptions.length > 0;

  const assets = isVariant
    ? [...(product.variantAssets || []), ...(product?.productAssets || [])]
    : product.productAssets;

  const sortedAssets = assets?.sort((a, b) => a.order - b.order) || [];
  const firstTwoAssets = sortedAssets.slice(0, 2);
  const displayAsset =
    hovered && firstTwoAssets.length > 1
      ? firstTwoAssets[1]
      : firstTwoAssets[0];

  const translation = product.productTranslations[0];

  const productSlug = isVariant
    ? `${translation.slug}?${product.variantOptions.map((vg) => `${vg.variantGroupSlug}=${vg.variantOptionSlug}`).join("&")}`
    : `${translation.slug}`;

  const discountedPrice = product.prices.find((price) => price.discountedPrice);
  const isDiscounted =
    !!discountedPrice &&
    discountedPrice.discountedPrice! < discountedPrice.price;

  let discountPercentage = 0;
  if (isDiscounted && discountedPrice) {
    discountPercentage = Math.round(
      ((discountedPrice.price - discountedPrice.discountedPrice!) /
        discountedPrice.price) *
        100
    );
  }

  const renderMedia = (asset: {
    order: number;
    url: string;
    type: AssetType;
  }) => {
    if (asset.type === "VIDEO") {
      return (
        <video
          src={asset.url}
          className="w-full h-full object-contain"
          autoPlay
          loop
          muted
          playsInline
        />
      );
    }
    return <CustomImage src={asset.url} alt={translation.name} />;
  };

  return (
    <Card ref={ref} p={0} onClick={() => push(`/${productSlug}`)}>
      <Card.Section pos="relative">
        <div className="absolute top-9 left-4 z-10 flex flex-col gap-2">
          {isDiscounted && (
            <Badge
              size="lg"
              py={"md"}
              radius="0"
              fz={"sm"}
              fw={700}
              styles={{
                root: {
                  textTransform: "none",
                },
              }}
            >
              %{discountPercentage}
            </Badge>
          )}
        </div>

        {firstTwoAssets.length > 0 ? (
          <AspectRatio ratio={1} pos="relative">
            {renderMedia(displayAsset)}
          </AspectRatio>
        ) : (
          <AspectRatio ratio={1}>
            <CustomImage src="/placeholder-image.png" alt="Placeholder" />
          </AspectRatio>
        )}
      </Card.Section>

      <Stack gap="2px" pt={"xs"} px={0}>
        <Text size="sm" fw={500} lineClamp={2} style={{ minHeight: "2.5rem" }}>
          {translation.name}
        </Text>

        <Stack gap="0" align="baseline">
          {isDiscounted && discountedPrice ? (
            <>
              <ProductPriceFormatter
                price={discountedPrice.price}
                size="sm"
                c="dimmed"
                td="line-through"
              />
              <ProductPriceFormatter
                price={discountedPrice.discountedPrice}
                size="md"
                fw={700}
              />
            </>
          ) : (
            <ProductPriceFormatter
              price={product.prices[0]?.price}
              size="md"
              fw={700}
            />
            // <Text size="md" fw={700}>
            //   ₺
            //   {product.prices[0]?.price.toLocaleString("tr-TR", {
            //     minimumFractionDigits: 2,
            //     maximumFractionDigits: 2,
            //   })}
            // </Text>
          )}
        </Stack>
      </Stack>
    </Card>
  );
};

export default CategoryPageProductCard;
