'use client';

import PriceFormatter from '@/(user)/components/PriceFormatter';
import Image from '@/components/Image';
import {
  buildSwatchUrlParams,
  buildVariantUrlParams,
  calculatePriceInfo,
  getCurrentVariantOptionText,
  getDisplayImage,
  getPrimaryVariantGroup,
  shouldShowSwatches,
} from '@lib/product-helper';
import {
  AspectRatio,
  Box,
  Card,
  Group,
  Stack,
  Text,
  Tooltip,
} from '@mantine/core';
import { UiProductType } from '@repo/types';
import { Route } from 'next';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

type Product = UiProductType;
type Variant = Product['variants'][number];

interface StoreProductCardProps {
  product: Product;
  variant: Variant;
}

const StoreProductCard = ({ product, variant }: StoreProductCardProps) => {
  const router = useRouter();
  const [hoveredOptionIndex, setHoveredOptionIndex] = useState<number | null>(
    null,
  );

  const productName = product.translations?.[0]?.name || variant.sku;
  const productSlug = product.translations?.[0]?.slug || product.id;

  const primaryGroup = useMemo(
    () => getPrimaryVariantGroup(product),
    [product],
  );
  const priceInfo = useMemo(() => calculatePriceInfo(variant), [variant]);

  const currentOptionText = useMemo(
    () => getCurrentVariantOptionText(product, variant),
    [product, variant],
  );

  const showSwatches = useMemo(
    () => shouldShowSwatches(primaryGroup),
    [primaryGroup],
  );

  const displayImage = getDisplayImage(
    product,
    variant,
    primaryGroup,
    hoveredOptionIndex,
  );

  const handleSwatchClick = (optionSlug: string) => {
    if (!primaryGroup) return;
    const params = buildSwatchUrlParams(primaryGroup, optionSlug);
    router.push(`/${productSlug}?${params.toString()}` as Route);
  };

  const handleCardClick = () => {
    const params = buildVariantUrlParams(variant);
    const queryString = params.toString();
    router.push(
      `/${productSlug}${queryString ? `?${queryString}` : ''}` as Route,
    );
  };

  return (
    <Card
      padding={0}
      radius="md"
      className="group cursor-pointer overflow-hidden"
      onClick={handleCardClick}
    >
      <AspectRatio ratio={1}>
        <Box className="relative overflow-hidden">
          {priceInfo.hasDiscount && (
            <Box className="absolute top-2 right-2 z-10 bg-red-500 text-white px-2 py-1 text-xs font-semibold rounded">
              %{priceInfo.discountPercentage}
            </Box>
          )}

          <Image
            src={displayImage || '/placeholder-product.png'}
            alt={productName}
            className="w-full h-full transition-opacity duration-200"
          />
        </Box>
      </AspectRatio>

      <Stack gap={4} p="md">
        <Text size="sm" fw={600} lineClamp={1} className="text-gray-900">
          {productName}
        </Text>

        <Text size="xs" c="dimmed" lineClamp={1}>
          {product.categories?.[0]?.category?.translations?.[0]?.name || 'Ürün'}
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

        {showSwatches && primaryGroup && (
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
              {primaryGroup.options.slice(0, 6).map((opt, index) => {
                const isHovered = hoveredOptionIndex === index;
                const hasHex = opt.hexValue;
                const hasOptionImage = opt.optionAssetUrl;

                return (
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
                      className={`size-6 rounded-full border-2 transition-all duration-200 overflow-hidden flex-shrink-0
                        ${
                          isHovered
                            ? 'border-gray-900 scale-110'
                            : 'border-gray-300 hover:border-gray-500'
                        }`}
                    >
                      {hasHex ? (
                        <Box
                          className="w-full h-full"
                          style={{ backgroundColor: opt.hexValue! }}
                        />
                      ) : hasOptionImage ? (
                        <Image
                          src={opt.optionAssetUrl!}
                          alt={opt.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Box className="w-full h-full bg-gray-200" />
                      )}
                    </Box>
                  </Tooltip>
                );
              })}
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
            price={priceInfo.displayPrice}
            currency={priceInfo.currency}
            size="md"
            fw={700}
            className="text-gray-900"
          />
          {priceInfo.hasDiscount && (
            <PriceFormatter
              price={priceInfo.originalPrice}
              currency={priceInfo.currency}
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
