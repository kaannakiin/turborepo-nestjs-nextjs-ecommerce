"use client";

import { Box, Card, Grid, Group, Skeleton, Stack, Text } from "@mantine/core";
import { DesignProductCarouselSchemaInputType } from "@repo/types";
import { IconCarouselHorizontal, IconPackage } from "@tabler/icons-react";
import { DesignPreviewProps } from "../types";

const ModernProductCarousel = ({
  data,
  isSelected,
  onSelect,
}: DesignPreviewProps<DesignProductCarouselSchemaInputType>) => {
  const productCount = data.products.length;
  const displayCount = Math.min(productCount, 4);

  return (
    <Card
      withBorder
      p={0}
      onClick={onSelect}
      style={{
        cursor: "pointer",
        borderColor: isSelected ? "var(--mantine-color-blue-6)" : undefined,
        borderWidth: isSelected ? 2 : 1,
        overflow: "hidden",
      }}
    >
      {/* Header */}
      {(data.title || data.subtitle) && (
        <Box p="md" pb="sm">
          {data.title && (
            <Text
              size={data.titleSize || "lg"}
              fw={600}
              style={{ color: data.titleColor || undefined }}
            >
              {data.title}
            </Text>
          )}
          {data.subtitle && (
            <Text
              size={data.subtitleSize || "sm"}
              c="dimmed"
              style={{ color: data.subtitleColor || undefined }}
            >
              {data.subtitle}
            </Text>
          )}
        </Box>
      )}

      {/* Products Preview */}
      <Box
        p="md"
        pt={data.title || data.subtitle ? 0 : "md"}
        style={{
          backgroundColor:
            data.backgroundColor || "var(--mantine-color-gray-0)",
        }}
      >
        {productCount > 0 ? (
          <Grid gutter="sm">
            {Array.from({ length: displayCount }).map((_, idx) => (
              <Grid.Col key={idx} span={3}>
                <Card withBorder p="xs" radius="sm">
                  <Skeleton height={60} mb="xs" />
                  <Skeleton height={8} width="80%" mb={4} />
                  <Skeleton height={8} width="50%" />
                  {data.showPrice && (
                    <Skeleton height={12} width="40%" mt="xs" />
                  )}
                </Card>
              </Grid.Col>
            ))}
          </Grid>
        ) : (
          <Stack align="center" py="xl" gap="xs">
            <IconPackage size={48} color="var(--mantine-color-gray-4)" />
            <Text size="sm" c="dimmed">
              Urun eklenmedi
            </Text>
          </Stack>
        )}
      </Box>

      {/* Info Bar */}
      <Box
        p="sm"
        style={{ borderTop: "1px solid var(--mantine-color-gray-2)" }}
      >
        <Group justify="space-between">
          <Group gap="xs">
            <IconCarouselHorizontal size={16} />
            <Text size="sm" fw={500}>
              {data.title || "Urun Slayti"}
            </Text>
          </Group>
          <Text size="xs" c="dimmed">
            {productCount} urun
          </Text>
        </Group>
      </Box>
    </Card>
  );
};

export default ModernProductCarousel;
