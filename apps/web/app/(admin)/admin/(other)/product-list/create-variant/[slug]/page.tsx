"use client";

import GlobalLoadingOverlay from "@/components/GlobalLoadingOverlay";
import fetchWrapper from "@lib/wrappers/fetchWrapper";
import { useQuery } from "@repo/shared";
import {
  BrandSelectType,
  CategorySelectType,
  VariantProductZodType,
} from "@repo/types";
import { useParams } from "next/navigation";
import ProductErrorComponent from "../../components/ProductErrorComponent";
import ProductNotFound from "../../components/ProductNotFound";
import VariantProductForm from "../components/VariantProductForm";

const CreateVariantProductPage = () => {
  const { slug } = useParams();
  const id = slug as string;
  const isEditMode = id !== "new";

  const brandsQuery = useQuery({
    queryKey: ["admin-brands-select"],
    queryFn: async () => {
      const response = await fetchWrapper.get<BrandSelectType[]>(
        `/admin/products/brands/get-all-brands-without-query`
      );
      if (response.success) {
        return response.data || response;
      }
    },
    staleTime: 1000 * 60 * 5,
  });

  const categoriesQuery = useQuery({
    queryKey: ["admin-categories-select"],
    queryFn: async () => {
      const response = await fetchWrapper.get<CategorySelectType[]>(
        `/admin/products/categories/get-all-categories-without-query`
      );
      if (response.success) {
        return response.data || response;
      }
    },
    staleTime: 1000 * 60 * 5,
  });

  const productQuery = useQuery({
    queryKey: ["admin-variant-product", id],
    queryFn: async () => {
      const response = await fetchWrapper.get<VariantProductZodType>(
        `/admin/products/get-product-variant/${id}`
      );
      if (response.success) {
        return response.data || response;
      }
    },
    enabled: isEditMode,
    retry: 1,
    staleTime: 1000 * 60 * 5,
    select: (data: VariantProductZodType) => {
      if (!data) return data;

      const cleanData = structuredClone(data);

      if (cleanData.existingImages && cleanData.existingImages.length > 0) {
        cleanData.existingImages.sort((a, b) => a.order - b.order);

        cleanData.existingImages.forEach((img, index) => {
          img.order = index;
        });
      }

      if (
        cleanData.combinatedVariants &&
        cleanData.combinatedVariants.length > 0
      ) {
        cleanData.combinatedVariants.forEach((variant) => {
          if (variant.existingImages && variant.existingImages.length > 0) {
            variant.existingImages.sort((a, b) => a.order - b.order);

            variant.existingImages.forEach((img, index) => {
              img.order = index;
            });
          }
        });
      }

      return cleanData;
    },
  });

  const isLoading =
    brandsQuery.isLoading ||
    categoriesQuery.isLoading ||
    (isEditMode && productQuery.isLoading);

  if (isLoading) {
    return <GlobalLoadingOverlay visible={true} />;
  }

  if (brandsQuery.isError || !brandsQuery.data) {
    return <ProductErrorComponent message="Markalar yüklenirken hata oluştu" />;
  }
  if (categoriesQuery.isError || !categoriesQuery.data) {
    return (
      <ProductErrorComponent message="Kategoriler yüklenirken hata oluştu" />
    );
  }

  if (isEditMode) {
    if (productQuery.isError) {
      return (
        <ProductErrorComponent message="Ürün yüklenirken hata oluştu veya ürün bulunamadı." />
      );
    }

    if (!productQuery.data) {
      return (
        <ProductNotFound message="Aradığınız ürün varyantı sistemde mevcut değil veya silinmiş olabilir." />
      );
    }
  }

  return (
    <VariantProductForm
      brands={brandsQuery.data as BrandSelectType[]}
      categories={categoriesQuery.data as CategorySelectType[]}
      defaultValues={
        isEditMode ? (productQuery.data as VariantProductZodType) : undefined
      }
    />
  );
};

export default CreateVariantProductPage;
