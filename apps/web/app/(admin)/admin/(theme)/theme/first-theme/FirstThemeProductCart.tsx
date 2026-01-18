'use client';
import Image from '@/components/Image';
import {
  AspectRatio,
  Badge,
  Box,
  Button,
  Card,
  Group,
  Stack,
  Text,
  useMantineTheme,
} from '@mantine/core';
import { useHover } from '@mantine/hooks';
import { ProductCart, AspectRatio as AspectType } from '@repo/types';
import { Route } from 'next';
import Link from 'next/link';
import { useMemo } from 'react';

interface FirstThemeProductCartProps {
  data: ProductCart;
  aspectRatio: AspectType;
  showAddToCartButton: boolean;
  showDiscountBadge?: boolean;
  badgeBackgroundColor?: string | null;
  badgeTextColor?: string | null;
}

const FirstThemeProductCart = ({
  data,
  aspectRatio = '1/1',
  showAddToCartButton = true,
  showDiscountBadge = true,
  badgeBackgroundColor,
  badgeTextColor,
}: FirstThemeProductCartProps) => {
  const theme = useMantineTheme();
  const { hovered, ref } = useHover();

  const primaryImage = data.images[0]?.url;
  const secondaryImage = data.images[1]?.url;

  const isHoverable = useMemo(() => {
    return !!primaryImage && !!secondaryImage;
  }, [primaryImage, secondaryImage]);

  const currentImage = isHoverable && hovered ? secondaryImage : primaryImage;

  const ratioValue = useMemo(() => {
    const parts = aspectRatio.split('/');
    if (parts.length === 2) {
      const num = parseFloat(parts[0]);
      const den = parseFloat(parts[1]);
      if (!isNaN(num) && !isNaN(den) && den !== 0) {
        return num / den;
      }
    }
    return 3 / 4;
  }, [aspectRatio]);

  // İndirim badge'i gösterilecek mi?
  const shouldShowDiscountBadge =
    showDiscountBadge && data.discountPrice !== null;

  if (!primaryImage) return null;

  return (
    <Card ref={ref} padding="0" radius="0">
      <Link
        href={data.url as Route}
        style={{ textDecoration: 'none', color: 'inherit' }}
      >
        <Box pos="relative">
          <AspectRatio ratio={ratioValue}>
            <Image
              src={currentImage}
              alt={data.name}
              className={`transition-all duration-300 ${isHoverable && hovered ? 'scale-105' : ''}`}
            />
          </AspectRatio>

          {shouldShowDiscountBadge && (
            <Badge
              pos="absolute"
              top={theme.spacing.xs}
              right={theme.spacing.xs}
              radius="sm"
              styles={{
                root: {
                  backgroundColor: badgeBackgroundColor || theme.colors.red[6],
                  color: badgeTextColor || 'white',
                },
              }}
            >
              İndirim
            </Badge>
          )}

          {showAddToCartButton && (
            <Button
              pos="absolute"
              bottom={theme.spacing.sm}
              right={theme.spacing.sm}
              size="xs"
              variant="filled"
              color="dark"
              className="opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              onClick={(e) => {
                e.preventDefault();
                console.log('Adding to cart:', data.id);
              }}
            >
              Sepete Ekle
            </Button>
          )}
        </Box>

        <Stack p="sm" gap={4}>
          <Text fw={500} lineClamp={1} size="sm" title={data.name}>
            {data.name}
          </Text>
          <Group gap={8}>
            {data.discountPrice ? (
              <>
                <Text fw={700} c="red" size="md">
                  {new Intl.NumberFormat('tr-TR', {
                    style: 'currency',
                    currency: 'TRY',
                  }).format(data.discountPrice)}
                </Text>
                <Text size="sm" c="dimmed" td="line-through">
                  {new Intl.NumberFormat('tr-TR', {
                    style: 'currency',
                    currency: 'TRY',
                  }).format(data.price)}
                </Text>
              </>
            ) : (
              <Text fw={700} size="md">
                {new Intl.NumberFormat('tr-TR', {
                  style: 'currency',
                  currency: 'TRY',
                }).format(data.price)}
              </Text>
            )}
          </Group>
        </Stack>
      </Link>
    </Card>
  );
};

export default FirstThemeProductCart;
