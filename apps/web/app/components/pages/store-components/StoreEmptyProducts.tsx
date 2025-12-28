"use client";

import { Box, Button, Stack, Text, Title } from "@mantine/core";
import { IconFilter2X, IconMoodEmpty } from "@tabler/icons-react";

interface EmptyProductsProps {
  hasFilters?: boolean;
  onClearFilters?: () => void;
}

const StoreEmptyProducts = ({
  hasFilters = false,
  onClearFilters,
}: EmptyProductsProps) => {
  return (
    <Box py={60}>
      <Stack align="center" gap="lg">
        <Box
          style={{
            width: 100,
            height: 100,
            borderRadius: "50%",
            backgroundColor: "var(--mantine-color-gray-1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {hasFilters ? (
            <IconFilter2X
              size={48}
              stroke={1.5}
              color="var(--mantine-color-gray-5)"
            />
          ) : (
            <IconMoodEmpty
              size={48}
              stroke={1.5}
              color="var(--mantine-color-gray-5)"
            />
          )}
        </Box>

        <Stack align="center" gap={4}>
          <Title order={4} c="dark.5">
            {hasFilters ? "Filtrelere Uygun Ürün Bulunamadı" : "Henüz Ürün Yok"}
          </Title>
          <Text c="dimmed" size="sm" ta="center" maw={300}>
            {hasFilters
              ? "Seçtiğiniz filtrelere uygun ürün bulunamadı. Filtreleri değiştirmeyi deneyin."
              : "Bu kategoride henüz ürün bulunmuyor."}
          </Text>
        </Stack>

        {hasFilters && onClearFilters && (
          <Button
            variant="light"
            leftSection={<IconFilter2X size={18} />}
            onClick={onClearFilters}
          >
            Filtreleri Temizle
          </Button>
        )}
      </Stack>
    </Box>
  );
};

export default StoreEmptyProducts;
