"use client";
import { Anchor, Breadcrumbs } from "@mantine/core";
import { $Enums, GetCategoryPageReturnType } from "@repo/types";
import Link from "next/link";

interface CategoryBreadCrumbsListProps {
  category: GetCategoryPageReturnType["category"];
  locale?: $Enums.Locale;
}

const CategoryBreadCrumbsList = ({
  category,
  locale = "TR",
}: CategoryBreadCrumbsListProps) => {
  const homeItem = (
    <Anchor
      component={Link}
      href="/"
      size="sm"
      c="primary"
      className="hover:underline-offset-4"
    >
      Ana Sayfa
    </Anchor>
  );

  // Parent kategorileri level'a göre sırala (en yüksek level önce)
  const sortedParentCategories = category.parentCategories.sort(
    (a, b) => b.level - a.level
  );

  const parentItems = sortedParentCategories.map((parentCategory) => {
    const categoryTranslation =
      parentCategory.translations.find((t) => t.locale === locale) ||
      parentCategory.translations[0];

    const categoryName = categoryTranslation?.name || "Kategori";
    const categorySlug = categoryTranslation?.slug;

    if (!categorySlug) {
      return (
        <span
          key={parentCategory.id}
          style={{ color: "var(--mantine-color-dimmed)" }}
          className="hover:underline-offset-4"
        >
          {categoryName}
        </span>
      );
    }

    return (
      <Anchor
        key={parentCategory.id}
        component={Link}
        href={`/categories/${categorySlug}`}
        size="sm"
        c="primary"
        className="hover:underline-offset-4"
      >
        {categoryName}
      </Anchor>
    );
  });

  // Mevcut kategori
  const currentCategoryTranslation =
    category.translations.find((t) => t.locale === locale) ||
    category.translations[0];

  const currentItem = (
    <span style={{ fontWeight: 500 }}>
      {currentCategoryTranslation?.name || "Kategori"}
    </span>
  );

  const allItems = [homeItem, ...parentItems, currentItem];

  return (
    <Breadcrumbs
      separator=">"
      separatorMargin="xs"
      styles={{
        root: {
          padding: "8px 0",
        },
        breadcrumb: {
          fontSize: "14px",
        },
        separator: {
          marginLeft: "8px",
          marginRight: "8px",
          color: "var(--mantine-primary-color-5)",
        },
      }}
    >
      {allItems}
    </Breadcrumbs>
  );
};

export default CategoryBreadCrumbsList;
