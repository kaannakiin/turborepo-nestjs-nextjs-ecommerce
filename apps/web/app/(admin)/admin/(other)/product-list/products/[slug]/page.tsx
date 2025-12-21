"use client";

import GlobalLoadingOverlay from "@/components/GlobalLoadingOverlay";
import fetchWrapper, { ApiError } from "@lib/wrappers/fetchWrapper";
import { Alert, Center, Text } from "@mantine/core";
import { useQuery } from "@repo/shared";
import { BaseProductZodType, VariantProductZodType } from "@repo/types";
import { IconAlertCircle } from "@tabler/icons-react";
import { useParams, useSearchParams } from "next/navigation";
import BasicProductForm from "../components/BasicProductForm";
import VariantProductForm from "../components/VariantProductForm";

function isVariantProduct(
  product: BaseProductZodType | VariantProductZodType
): product is VariantProductZodType {
  return (product as VariantProductZodType).combinatedVariants !== undefined;
}

const AdminProductFormPage = () => {
  const params = useParams();
  const searchParams = useSearchParams();

  const isCreateMode = params.slug === "new";

  const isCreateVariantMode =
    isCreateMode && searchParams.get("variant") === "true";

  const {
    isLoading,
    isError,
    error,
    data: product,
  } = useQuery({
    queryKey: ["admin-product", params.slug],
    queryFn: async () => {
      const response = await fetchWrapper.get<{
        success: boolean;
        product?: VariantProductZodType | BaseProductZodType;
      }>("/admin/products/get-product/" + params.slug);

      if (!response.success) {
        const error = response as ApiError;
        throw new Error(error.error || "Failed to fetch product");
      }
      return response.data.product;
    },

    enabled: !isCreateMode && !!params.slug,
    retry: 1,
  });

  if (isLoading) {
    return <GlobalLoadingOverlay />;
  }

  if (isError) {
    return (
      <Center h={400}>
        <Alert
          variant="light"
          color="red"
          title="Hata Oluştu"
          icon={<IconAlertCircle />}
        >
          {error instanceof Error ? error.message : "Ürün verisi yüklenemedi."}
        </Alert>
      </Center>
    );
  }

  if (isCreateMode) {
    if (isCreateVariantMode) {
      return <VariantProductForm />;
    }

    return <BasicProductForm />;
  }

  if (!product) {
    return <Text c="red">Ürün bulunamadı.</Text>;
  }

  if (isVariantProduct(product)) {
    return <VariantProductForm defaultValues={product} />;
  }

  return <BasicProductForm defaultValues={product} />;
};

export default AdminProductFormPage;
