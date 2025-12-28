"use client";

import GlobalLoadingOverlay from "@/components/GlobalLoadingOverlay";
import fetchWrapper, { ApiError } from "@lib/wrappers/fetchWrapper";
import { Alert, Button } from "@mantine/core";
import { useQuery } from "@repo/shared";
import { CategoryZodType } from "@repo/types";
import { IconAlertCircle, IconRefresh } from "@tabler/icons-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import AdminCategoryForm from "../components/AdminCategoryForm";

const AdminCategoriesFormPage = () => {
  const params = useParams();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["admin-category-form", params.slug],
    queryFn: async () => {
      const res = await fetchWrapper.get<CategoryZodType>(
        `/admin/products/categories/get-category-form-value/${params.slug}`
      );

      if (!res.success) {
        const error = res as ApiError;
        throw new Error(error.error || "Failed to fetch category data");
      }

      return res.data;
    },
    enabled: !!params.slug && params.slug !== "new",
    retry: 1,
  });

  if (params?.slug === "new") {
    return <AdminCategoryForm />;
  }

  if (isLoading) {
    return <GlobalLoadingOverlay />;
  }

  if (error) {
    return (
      <>
        <Alert
          color="red"
          title="Kategori Yüklenemedi"
          icon={<IconAlertCircle />}
          mb="md"
        >
          {error instanceof Error
            ? error.message
            : "Kategori bilgileri yüklenirken bir hata oluştu"}
        </Alert>

        <Button.Group>
          <Button
            leftSection={<IconRefresh size={16} />}
            onClick={() => refetch()}
            variant="light"
          >
            Tekrar Dene
          </Button>
          <Button component={Link} href="/admin/product-list/categories">
            Kategoriler Listesi
          </Button>
        </Button.Group>
      </>
    );
  }

  return <AdminCategoryForm defaultValues={data} />;
};

export default AdminCategoriesFormPage;
