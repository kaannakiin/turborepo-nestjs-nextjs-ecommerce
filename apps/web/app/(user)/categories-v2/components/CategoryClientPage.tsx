"use client";

import { useTheme } from "@/(admin)/admin/(theme)/ThemeContexts/ThemeContext";
import { Breadcrumbs, Grid, Stack, Text } from "@mantine/core";
import { CategoryPagePreparePageReturnData } from "@repo/types";
import { IconChevronRight } from "@tabler/icons-react";
import Link from "next/link";
import CategoryPageFiltersSection from "./CategoryPageFiltersSection";
import CategoryProductList from "./CategoryProductList";

interface CategoryClientPageProps {
  id: string;
  allSearchParams: Record<string, string | string[]>;
  variantGroups: CategoryPagePreparePageReturnData["variantGroups"];
  brands: CategoryPagePreparePageReturnData["brands"];
  hiearchy: CategoryPagePreparePageReturnData["hiearchy"];
  category: CategoryPagePreparePageReturnData["category"];
}

const CategoryClientPage = ({
  allSearchParams,
  brands,
  category,
  hiearchy,
  variantGroups,
  id,
}: CategoryClientPageProps) => {
  const { media } = useTheme();
  return (
    <Stack
      gap={"lg"}
      p={"md"}
      className="w-full min-h-full max-w-[1250px] lg:mx-auto flex flex-1"
    >
      {hiearchy && (
        <Breadcrumbs
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

          {/* Parent Kategoriler */}
          {hiearchy.parentCategories &&
            hiearchy.parentCategories.length > 0 &&
            [...hiearchy.parentCategories]
              .sort((a, b) => a.level - b.level)
              .map((cat) => (
                <Link
                  key={cat.id}
                  href={`/categories-v2/${cat.slug}`}
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
        <Grid.Col
          className="h-full w-full"
          span={media === "desktop" ? 3 : media === "tablet" ? 3 : 12}
        >
          <CategoryPageFiltersSection
            allSearchParams={allSearchParams}
            brands={brands}
            variantGroups={variantGroups}
          />
        </Grid.Col>
        <Grid.Col
          className="h-full w-full"
          bg={"red.5"}
          span={media === "desktop" ? 9 : media === "tablet" ? 9 : 12}
        >
          <CategoryProductList
            categoryIds={[
              id,
              ...(hiearchy.childrenCategories &&
              hiearchy.childrenCategories.length > 0
                ? hiearchy.childrenCategories.map((cat) => cat.id)
                : []),
            ]}
          />
        </Grid.Col>
      </Grid>
    </Stack>
  );
};

export default CategoryClientPage;
