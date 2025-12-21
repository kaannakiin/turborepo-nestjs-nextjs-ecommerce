"use client";

import GlobalLoadingOverlay from "@/components/GlobalLoadingOverlay";
import fetchWrapper, { ApiError } from "@lib/wrappers/fetchWrapper";
import { Alert, Button, Center, Group, Stack, Text } from "@mantine/core";
import { useQuery } from "@repo/shared";
import { BrandZodType } from "@repo/types";
import { IconAlertCircle } from "@tabler/icons-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import BrandForm from "../components/BrandForm";

const BrandFormPage = () => {
  const params = useParams();
  const router = useRouter();

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-brand-form", params.slug],
    queryFn: async () => {
      const res = await fetchWrapper.get<BrandZodType>(
        `/admin/products/brands/get-brand-form-value/${params.slug}`
      );

      if (!res.success) {
        const error = res as ApiError;
        throw new Error(error.error || "Failed to fetch brand data");
      }

      return res.data;
    },
    enabled: !!params.slug && params.slug !== "new",
  });

  if (params?.slug === "new") {
    return <BrandForm />;
  }

  if (error) {
    return (
      <Center h={400}>
        <Stack align="center" gap="md" maw={500}>
          <IconAlertCircle size={48} color="red" />
          <Text size="xl" fw={600}>
            Marka Yüklenemedi
          </Text>
          <Text c="dimmed" ta="center">
            Marka bilgileri yüklenirken bir hata oluştu. Lütfen tekrar deneyin.
          </Text>

          <Alert
            color="red"
            variant="light"
            w="100%"
            icon={<IconAlertCircle size={16} />}
          >
            {error instanceof Error
              ? error.message
              : "Bilinmeyen bir hata oluştu"}
          </Alert>

          <Group>
            <Button variant="light" onClick={() => router.back()}>
              Geri Dön
            </Button>
            <Button component={Link} href="/admin/product-list/brands">
              Markalar Listesi
            </Button>
          </Group>
        </Stack>
      </Center>
    );
  }

  if (isLoading) {
    return <GlobalLoadingOverlay />;
  }

  return <BrandForm defaultValues={data} />;
};

export default BrandFormPage;
