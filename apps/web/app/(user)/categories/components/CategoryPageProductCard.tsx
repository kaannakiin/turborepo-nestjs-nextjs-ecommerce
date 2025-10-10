"use client";
import CustomImage from "@/components/CustomImage";
import { AspectRatio, Box, Card } from "@mantine/core";
import { useHover } from "@mantine/hooks";
import { $Enums, GetCategoryProductsResponse } from "@repo/types";

interface CategoryPageProductCardProps {
  product: GetCategoryProductsResponse["products"][number];
}

const CategoryPageProductCard = ({ product }: CategoryPageProductCardProps) => {
  const { ref, hovered } = useHover();

  const isVariant =
    product.variantOptions &&
    product.variantOptions.length > 0 &&
    product.entryType === "VARIANT";

  // Variant ise variantAssets'ten, değilse productAssets'ten al ve order'a göre sırala
  const assets = isVariant
    ? [...(product.variantAssets || []), ...(product?.productAssets || [])]
    : product.productAssets;
  const sortedAssets = assets?.sort((a, b) => a.order - b.order) || [];
  const firstTwoAssets = sortedAssets.slice(0, 2);

  // Gösterilecek asset'i belirle (hover durumuna göre)
  const displayAsset =
    hovered && firstTwoAssets.length > 1
      ? firstTwoAssets[1]
      : firstTwoAssets[0];

  const renderMedia = (asset: {
    order: number;
    url: string;
    type: $Enums.AssetType;
  }) => {
    if (asset.type === "VIDEO") {
      return (
        <video
          src={asset.url}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
          autoPlay
          loop
          muted
          playsInline
        />
      );
    }

    return <CustomImage src={asset.url} alt={"Product image"} />;
  };

  return (
    <Card ref={ref} withBorder p="md">
      <Card.Section>
        {firstTwoAssets.length > 0 ? (
          <AspectRatio ratio={1} maw={400} pos={"relative"}>
            {renderMedia(displayAsset)}
          </AspectRatio>
        ) : (
          <AspectRatio ratio={1} maw={400}>
            <Box
              style={{
                position: "relative",
                width: "100%",
                height: "100%",
                overflow: "hidden",
              }}
            >
              <CustomImage src="/placeholder-image.png" alt="Placeholder" />
            </Box>
          </AspectRatio>
        )}
      </Card.Section>
    </Card>
  );
};

export default CategoryPageProductCard;
