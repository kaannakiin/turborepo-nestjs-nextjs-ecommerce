// components/pages/store-components/NotFoundPage.tsx

"use client";

import { Box, Button, Container, Stack, Text, Title } from "@mantine/core";
import {
  IconBox,
  IconCategory,
  IconSearch,
  IconTag,
} from "@tabler/icons-react";
import { Route } from "next";
import Link from "next/link";

export type NotFoundType = "category" | "brand" | "tag" | "search" | "empty";

interface NotFoundPageProps {
  type: NotFoundType;
  title?: string;
  showHomeButton?: boolean;
  showSearchButton?: boolean;
}

const config: Record<
  NotFoundType,
  {
    icon: typeof IconCategory;
    defaultTitle: string;
    defaultDescription: string;
    color: string;
  }
> = {
  category: {
    icon: IconCategory,
    defaultTitle: "Kategori Bulunamadı",
    defaultDescription:
      "Aradığınız kategori mevcut değil veya kaldırılmış olabilir.",
    color: "blue",
  },
  brand: {
    icon: IconBox,
    defaultTitle: "Marka Bulunamadı",
    defaultDescription:
      "Aradığınız marka mevcut değil veya kaldırılmış olabilir.",
    color: "violet",
  },
  tag: {
    icon: IconTag,
    defaultTitle: "Etiket Bulunamadı",
    defaultDescription:
      "Aradığınız etiket mevcut değil veya kaldırılmış olabilir.",
    color: "teal",
  },
  search: {
    icon: IconSearch,
    defaultTitle: "Sonuç Bulunamadı",
    defaultDescription:
      "Arama kriterlerinize uygun ürün bulunamadı. Farklı filtreler deneyebilirsiniz.",
    color: "orange",
  },
  empty: {
    icon: IconBox,
    defaultTitle: "Ürün Bulunamadı",
    defaultDescription:
      "Bu sayfada henüz ürün bulunmuyor. Daha sonra tekrar kontrol edebilirsiniz.",
    color: "gray",
  },
};

const StoreNotFound = ({
  type,
  title,
  showHomeButton = true,
  showSearchButton = true,
}: NotFoundPageProps) => {
  const { icon: Icon, defaultTitle, defaultDescription, color } = config[type];

  return (
    <Container size="sm" py={80}>
      <Stack align="center" gap="xl">
        <Box
          style={{
            width: 120,
            height: 120,
            borderRadius: "50%",
            backgroundColor: `var(--mantine-color-${color}-0)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon
            size={56}
            stroke={1.5}
            color={`var(--mantine-color-${color}-5)`}
          />
        </Box>

        <Stack align="center" gap="xs">
          <Title order={2} ta="center" c="dark.6">
            {title || defaultTitle}
          </Title>
        </Stack>

        <Stack gap="sm" align="center" mt="md">
          {showHomeButton && (
            <Button
              component={Link}
              href="/"
              variant="filled"
              size="md"
              radius="md"
            >
              Ana Sayfaya Dön
            </Button>
          )}
          {showSearchButton && (
            <Button
              component={Link}
              href={"/search" as Route}
              variant="light"
              size="md"
              radius="md"
            >
              Ürün Ara
            </Button>
          )}
        </Stack>
      </Stack>
    </Container>
  );
};

export default StoreNotFound;
