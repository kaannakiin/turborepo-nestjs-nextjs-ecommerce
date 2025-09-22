import { Stack } from "@mantine/core";
import { QueryClient } from "@repo/shared";
import { $Enums, GetCategoryPageReturnType } from "@repo/types";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchWrapper } from "../../../../lib/fetchWrapper";
import { Params, SearchParams } from "../../../../types/GlobalTypes";
import CategoryPageContent from "./components/CategoryPageContent";
import CategoryBreadCrumbsList from "./components/CategoryBreadCrumbsList";
const locale: $Enums.Locale = "TR";
const queryClient = new QueryClient();
const getCategoryData = async (
  slug: string,
  allSearchParams: Record<string, string | string[]> = {}
) => {
  const category = await queryClient.fetchQuery({
    queryKey: ["category-page", slug],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      Object.entries(allSearchParams).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach((v) => searchParams.append(key, v));
        } else {
          searchParams.append(key, value);
        }
      });
      const res = await fetchWrapper.get(
        `/users/categories/get-category-page/${slug}?${searchParams.toString()}`
      );
      if (res.error) {
        return null;
      }
      return res.data as GetCategoryPageReturnType;
    },
  });
  if (!category) {
    return notFound();
  }
  return category;
};

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}): Promise<Metadata> {
  const { slug } = await params;
  const pageSearchParams = await searchParams;
  const allSearchParams: Record<string, string | string[]> = Object.fromEntries(
    Object.entries(pageSearchParams)
      .filter(([key]) => key !== "page" && key !== "o")
      .map(([key, value]) => {
        if (Array.isArray(value)) {
          return [key, value];
        }
        return [key, value.split(",")];
      })
  );

  if (!slug) {
    return notFound();
  }
  const categoryData = await getCategoryData(slug, allSearchParams);
  if (!categoryData) {
    return notFound();
  }
  const mainTranslation = categoryData.category.translations.find(
    (t) => t.locale === locale
  );
  if (mainTranslation) {
    return {
      title: mainTranslation.metaTitle || mainTranslation.name || "Kategori",
      description:
        mainTranslation.metaDescription ||
        mainTranslation.description ||
        mainTranslation.name,
    };
  }

  return {};
}

const CategoriesPage = async ({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) => {
  const { slug } = await params;
  const pageSearchParams = await searchParams;
  const allSearchParams: Record<string, string | string[]> = Object.fromEntries(
    Object.entries(pageSearchParams).map(([key, value]) => {
      if (Array.isArray(value)) {
        return [key, value];
      }
      return [key, value.split(",")];
    })
  );

  if (!slug) {
    return notFound();
  }
  const categoryData = await getCategoryData(slug, allSearchParams);
  if (!categoryData) {
    return notFound();
  }
  return (
    <Stack
      gap={"lg"}
      px={"md"}
      className="w-full min-h-full max-w-[1250px] lg:mx-auto flex my-4"
    >
      <CategoryBreadCrumbsList category={categoryData.category} />
      <CategoryPageContent
        categoryId={categoryData.category.id}
        childCategories={categoryData.category.childCategories}
        variantGroups={categoryData.variantGroups}
        brands={categoryData.brands}
      />
    </Stack>
  );
};

export default CategoriesPage;
