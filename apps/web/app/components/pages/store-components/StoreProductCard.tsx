"use client";

import PriceFormatter from "@/(user)/components/PriceFormatter";
import CustomImage from "@/components/CustomImage";
import {
  AspectRatio,
  Box,
  Card,
  Group,
  Stack,
  Text,
  Tooltip,
} from "@mantine/core";
import { UiProductType } from "@repo/types";
import { Route } from "next";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Product = UiProductType;
type Variant = Product["variants"][number];

interface StoreProductCardProps {
  product: Product;
  variant: Variant;
}

const StoreProductCard = ({ product, variant }: StoreProductCardProps) => {
  const router = useRouter();
  const [hoveredOptionIndex, setHoveredOptionIndex] = useState<number | null>(
    null
  );

  const productName = product.translations?.[0]?.name || variant.sku;
  const productSlug = product.translations?.[0]?.slug || product.id;
  const isVisibleAllCombinations = product.visibleAllCombinations;

  const price = variant.prices?.[0];
  const originalPrice = price?.price || 0;
  const discountedPrice = price?.discountedPrice;
  const hasDiscount = discountedPrice && discountedPrice < originalPrice;
  const discountPercentage = hasDiscount
    ? Math.round(((originalPrice - discountedPrice) / originalPrice) * 100)
    : 0;

  const displayPrice = discountedPrice || originalPrice;
  const currency = price?.currency || "TRY";

  const getPrimaryVariantGroup = () => {
    if (isVisibleAllCombinations) return null;

    const primaryGroup = product.variantGroups?.[0];
    if (!primaryGroup) return null;

    const groupType = primaryGroup.variantGroup.type;
    const renderType = primaryGroup.renderVisibleType;
    const groupSlug = primaryGroup.variantGroup.translations?.[0]?.slug || "";

    const options = primaryGroup.options.map((opt) => {
      const matchedVariant = product.variants.find((v) =>
        v.options?.some(
          (vOpt) =>
            vOpt.productVariantOption.variantOption.id === opt.variantOption.id
        )
      );

      return {
        optionId: opt.variantOption.id,
        name: opt.variantOption.translations?.[0]?.name || "",
        slug: opt.variantOption.translations?.[0]?.slug || "",
        hexValue: opt.variantOption.hexValue,
        optionAssetUrl: opt.variantOption.asset?.url,
        variantImageUrl:
          matchedVariant?.assets?.[0]?.asset?.url ||
          product.assets?.[0]?.asset?.url,
      };
    });

    const hasHexValues = options.some((opt) => opt.hexValue);
    const hasOptionAssets = options.some((opt) => opt.optionAssetUrl);

    let swatchType: "color" | "image" | null = null;

    if (groupType === "COLOR") {
      if (hasHexValues) {
        swatchType = "color";
      } else if (hasOptionAssets) {
        swatchType = "image";
      }
    } else if (groupType === "LIST") {
      if (renderType !== "DROPDOWN" && hasOptionAssets) {
        swatchType = "image";
      }
    }

    return {
      groupName: primaryGroup.variantGroup.translations?.[0]?.name || "",
      groupSlug,
      groupType,
      renderType,
      swatchType,
      optionCount: primaryGroup.options.length,
      options: options.map((opt) => ({
        ...opt,
        imageUrl: opt.optionAssetUrl || opt.variantImageUrl,
      })),
    };
  };

  const handleSwatchClick = (optionSlug: string) => {
    if (!primaryGroup) return;

    const params = new URLSearchParams();
    params.set(primaryGroup.groupSlug, optionSlug);

    router.push(`/${productSlug}?${params.toString()}` as Route);
  };

  const handleCardClick = () => {
    const params = new URLSearchParams();

    variant.options?.forEach((opt) => {
      const groupSlug =
        opt.productVariantOption.variantOption.variantGroup?.translations?.[0]
          ?.slug;
      const optionSlug =
        opt.productVariantOption.variantOption.translations?.[0]?.slug;

      if (groupSlug && optionSlug) {
        params.set(groupSlug, optionSlug);
      }
    });

    const queryString = params.toString();
    router.push(
      `/${productSlug}${queryString ? `?${queryString}` : ""}` as Route
    );
  };

  const getCurrentVariantOptionText = () => {
    if (!isVisibleAllCombinations) return null;

    const options = variant.options || [];
    if (options.length === 0) return null;

    return options
      .map(
        (opt) =>
          opt.productVariantOption.variantOption.translations?.[0]?.name || ""
      )
      .filter(Boolean)
      .join(" / ");
  };

  const getDisplayImage = () => {
    const primaryGroup = getPrimaryVariantGroup();

    if (hoveredOptionIndex !== null && primaryGroup) {
      const hoveredOption = primaryGroup.options[hoveredOptionIndex];
      if (hoveredOption?.imageUrl) {
        return hoveredOption.imageUrl;
      }
    }

    return variant.assets?.[0]?.asset?.url || product.assets?.[0]?.asset?.url;
  };

  const primaryGroup = getPrimaryVariantGroup();
  const currentOptionText = getCurrentVariantOptionText();
  const displayImage = getDisplayImage();

  const showSwatches =
    primaryGroup?.swatchType && primaryGroup.options.length > 1;

  return (
    <Card
      padding={0}
      radius="md"
      className="group cursor-pointer overflow-hidden"
      onClick={handleCardClick}
    >
      <AspectRatio ratio={1}>
        <Box className="relative   overflow-hidden">
          {hasDiscount && (
            <Box className="absolute top-2 right-2 z-10 bg-red-500 text-white px-2 py-1 text-xs font-semibold rounded">
              %{discountPercentage}
            </Box>
          )}

          <CustomImage
            src={displayImage || "/placeholder-product.png"}
            alt={productName}
            className="w-full h-full"
          />
        </Box>
      </AspectRatio>

      <Stack gap={4} p="md">
        <Text size="sm" fw={600} lineClamp={1} className="text-gray-900">
          {productName}
        </Text>

        <Text size="xs" c="dimmed" lineClamp={1}>
          {product.categories?.[0]?.category?.translations?.[0]?.name || "Ürün"}
        </Text>

        {primaryGroup && primaryGroup.optionCount > 0 && !showSwatches && (
          <Text size="xs" c="dimmed">
            {primaryGroup.optionCount} {primaryGroup.groupName}
          </Text>
        )}

        {currentOptionText && (
          <Text size="xs" c="dimmed" lineClamp={1}>
            {currentOptionText}
          </Text>
        )}

        {showSwatches && (
          <Box className="relative h-5 overflow-visible">
            <Text
              size="xs"
              c="dimmed"
              className="absolute inset-0 transition-all duration-300 ease-out opacity-100 group-hover:opacity-0"
            >
              {primaryGroup.optionCount} {primaryGroup.groupName}
            </Text>

            <Group
              gap={6}
              className="absolute inset-0 transition-all duration-300 ease-out opacity-0 group-hover:opacity-100"
              wrap="nowrap"
            >
              {primaryGroup.options.slice(0, 6).map((opt, index) => (
                <Tooltip
                  key={opt.optionId}
                  label={opt.name}
                  withArrow
                  position="top"
                  openDelay={200}
                >
                  <Box
                    component="button"
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      handleSwatchClick(opt.slug);
                    }}
                    onMouseEnter={() => setHoveredOptionIndex(index)}
                    onMouseLeave={() => setHoveredOptionIndex(null)}
                    className={`w-5 h-5 rounded-full border-2 transition-all duration-200 overflow-hidden flex-shrink-0
                      ${
                        hoveredOptionIndex === index
                          ? "border-gray-900 scale-125"
                          : "border-gray-300 hover:border-gray-500"
                      }`}
                  >
                    {primaryGroup.swatchType === "color" && opt.hexValue ? (
                      <Box
                        className="w-full h-full"
                        style={{ backgroundColor: opt.hexValue }}
                      />
                    ) : (
                      <CustomImage
                        src={
                          opt.optionAssetUrl ||
                          opt.imageUrl ||
                          "/placeholder-product.png"
                        }
                        alt={opt.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </Box>
                </Tooltip>
              ))}
              {primaryGroup.options.length > 6 && (
                <Text size="xs" c="dimmed" fw={500} className="flex-shrink-0">
                  +{primaryGroup.options.length - 6}
                </Text>
              )}
            </Group>
          </Box>
        )}

        <Group gap="xs" align="center" mt={4}>
          <PriceFormatter
            price={displayPrice}
            currency={currency}
            size="md"
            fw={700}
            className="text-gray-900"
          />
          {hasDiscount && (
            <PriceFormatter
              price={originalPrice}
              currency={currency}
              size="xs"
              td="line-through"
              c="dimmed"
            />
          )}
        </Group>
      </Stack>
    </Card>
  );
};

export default StoreProductCard;
