"use client";

import { Breadcrumbs, Grid, Stack, Text } from "@mantine/core";
import { CategoryPagePreparePageReturnData } from "@repo/types";
import { IconChevronRight } from "@tabler/icons-react";
import { Locale } from "@repo/database/client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import CategoryPageDekstopFilter from "./CategoryPageDekstopFilter";
import CategoryPageDesktopFiltersSection from "./CategoryPageDesktopFiltersSection";
import CategoryPageMobileFiltersSection from "./CategoryPageMobileFiltersSection";
import CategoryProductList from "./CategoryProductList";
import { Route } from "next";
import { useTheme } from "@/context/theme-context/ThemeContext";

interface CategoryClientPageProps {
  id: string;
  variantGroups: CategoryPagePreparePageReturnData["variantGroups"];
  brands: CategoryPagePreparePageReturnData["brands"];
  hiearchy: CategoryPagePreparePageReturnData["hiearchy"];
  category: CategoryPagePreparePageReturnData["category"];
}

const CategoryClientPage = ({
  brands,
  category,
  hiearchy,
  variantGroups,
  id,
}: CategoryClientPageProps) => {
  const { actualMedia: media } = useTheme();
  const locale: Locale = "TR";
  const pageSearchParams = useSearchParams();

  return (
    <Stack
      gap={"lg"}
      p={"md"}
      className="w-full min-h-full max-w-[1500px] lg:mx-auto flex flex-1"
    >
      {hiearchy && (
        <Breadcrumbs
          px={"md"}
          separator={<IconChevronRight size={16} />}
          classNames={{
            separator: "text-gray-400",
            breadcrumb: "text-sm",
          }}
        >
          <Link
            href="/"
            className="text-gray-600 hover:text-black transition-colors"
          >
            Ana Sayfa
          </Link>
          {hiearchy.parentCategories &&
            hiearchy.parentCategories.length > 0 &&
            [...hiearchy.parentCategories]
              .sort((a, b) => a.level - b.level)
              .map((cat) => (
                <Link
                  key={cat.id}
                  href={`/categories-v2/${cat.slug}` as Route}
                  className="text-gray-600 hover:text-black transition-colors"
                >
                  {cat.name}
                </Link>
              ))}

          {/* Mevcut Kategori */}
          {category && (
            <Text className="text-black font-medium">{category.name}</Text>
          )}
        </Breadcrumbs>
      )}
      <Grid className="h-full w-full" p={"xs"}>
        <Grid.Col className="h-full w-full" span={media === "desktop" ? 3 : 12}>
          {media === "desktop" ? (
            <CategoryPageDesktopFiltersSection
              brands={brands}
              variantGroups={variantGroups}
              searchParams={pageSearchParams}
            />
          ) : (
            <CategoryPageMobileFiltersSection
              locale={locale}
              pageSearchParams={pageSearchParams}
              variantGroups={variantGroups}
              brands={brands}
            />
          )}
        </Grid.Col>
        <Grid.Col className="h-full w-full" span={media === "desktop" ? 9 : 12}>
          <Stack gap={"lg"}>
            {media === "desktop" ? (
              <CategoryPageDekstopFilter
                locale={locale}
                pageSearchParams={pageSearchParams}
                variantGroups={variantGroups}
              />
            ) : null}
            <CategoryProductList
              searchParams={pageSearchParams}
              categoryIds={[
                id,
                ...(hiearchy.childrenCategories &&
                hiearchy.childrenCategories.length > 0
                  ? hiearchy.childrenCategories.map((cat) => cat.id)
                  : []),
              ]}
            />
          </Stack>
        </Grid.Col>
      </Grid>
    </Stack>
  );
};

export default CategoryClientPage;
