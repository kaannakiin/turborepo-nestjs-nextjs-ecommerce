"use client";
import CustomImage from "@/components/CustomImage";
import { AspectRatio, Card } from "@mantine/core";
import { useHover } from "@mantine/hooks";
import { $Enums, GetCategoryProductsResponse } from "@repo/types";
import { useRouter } from "next/navigation";

interface CategoryPageProductCardProps {
  product: GetCategoryProductsResponse["products"][number];
}

const CategoryPageProductCard = ({ product }: CategoryPageProductCardProps) => {
  const { ref, hovered } = useHover();
  const { push } = useRouter();
  const isVariant =
    product.variantOptions &&
    product.variantOptions.length > 0 &&
    product.entryType === "VARIANT";

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

  const renderMedia = (asset: {
    order: number;
    url: string;
    type: $Enums.AssetType;
  }) => {
    if (asset.type === "VIDEO") {
      return (
        <video
          src={asset.url}
          className={`w-full h-full object-contain `}
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
    <Card ref={ref} withBorder p="md" onClick={() => push(`/${productSlug}`)}>
      <Card.Section>
        {firstTwoAssets.length > 0 ? (
          <AspectRatio ratio={1} maw={400} pos={"relative"}>
            {renderMedia(displayAsset)}
          </AspectRatio>
        ) : (
          <AspectRatio ratio={1} maw={400}>
            <CustomImage src="/placeholder-image.png" alt="Placeholder" />
          </AspectRatio>
        )}
      </Card.Section>
    </Card>
  );
};

export default CategoryPageProductCard;
