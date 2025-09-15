"use client";

import {
  Accordion,
  ActionIcon,
  Badge,
  Button,
  Card,
  Checkbox,
  Drawer,
  Grid,
  Group,
  Stack,
  ThemeIcon,
  UnstyledButton,
  useDrawersStack,
} from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { getSortProductPageLabel, ProductPageSortOption } from "@repo/shared";
import { $Enums, GetCategoryPageReturnType } from "@repo/types";
import { IconCheck, IconChevronRight, IconX } from "@tabler/icons-react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import CategoryProducts from "./CategoryProducts";

interface CategoryPageLeftSectionProps {
  categoryId: string;
  variantGroups: GetCategoryPageReturnType["variantGroups"];
  brands: GetCategoryPageReturnType["brands"];
  childCategories: GetCategoryPageReturnType["category"]["childCategories"];
  locale?: $Enums.Locale;
}

const CategoryPageContent = ({
  variantGroups,
  categoryId,
  locale = "TR",
  brands,
  childCategories,
}: CategoryPageLeftSectionProps) => {
  const { replace } = useRouter();
  const searchParams = useSearchParams();
  const [checkedSortValue, setCheckedSortValue] = useState<number>(
    parseInt(searchParams.get("o") as string) || 0
  );

  const stack = useDrawersStack([
    "main",
    "brands",
    "child-categories",
    ...(variantGroups && variantGroups.length > 0
      ? variantGroups.map(
          (vg) =>
            vg.translations.find((t) => t.locale === locale)?.slug ||
            vg.translations[0].slug
        )
      : []),
  ]);

  const [
    openedBottomDrawer,
    { open: openBottomDrawer, close: closeBottomDrawer },
  ] = useDisclosure();

  const isMobile = useMediaQuery("(max-width: 768px)");
  const isTablet = useMediaQuery("(max-width: 1024px)");

  const handleClick = (variantGroupSlug: string, variantOptionSlug: string) => {
    const params = new URLSearchParams(searchParams.toString());

    const currentValue = params.get(variantGroupSlug) || "";
    const currentOptions = currentValue ? currentValue.split(",") : [];

    if (currentOptions.includes(variantOptionSlug)) {
      const updatedOptions = currentOptions.filter(
        (opt) => opt !== variantOptionSlug
      );

      if (updatedOptions.length > 0) {
        params.set(variantGroupSlug, updatedOptions.join(","));
      } else {
        params.delete(variantGroupSlug);
      }
    } else {
      const updatedOptions = [...currentOptions, variantOptionSlug];
      params.set(variantGroupSlug, updatedOptions.join(","));
    }

    replace(`?${params.toString()}`);
  };

  const handleBrandClick = (brandSlug: string) => {
    const params = new URLSearchParams(searchParams.toString());

    const currentValue = params.get("brands") || "";
    const currentBrands = currentValue ? currentValue.split(",") : [];

    if (currentBrands.includes(brandSlug)) {
      const updatedBrands = currentBrands.filter(
        (brand) => brand !== brandSlug
      );

      if (updatedBrands.length > 0) {
        params.set("brands", updatedBrands.join(","));
      } else {
        params.delete("brands");
      }
    } else {
      const updatedBrands = [...currentBrands, brandSlug];
      params.set("brands", updatedBrands.join(","));
    }

    replace(`?${params.toString()}`);
  };

  const removeFilter = (
    type: "variant" | "brand",
    groupSlug: string,
    optionSlug?: string
  ) => {
    const params = new URLSearchParams(searchParams.toString());

    if (type === "brand") {
      const currentValue = params.get("brands") || "";
      const currentBrands = currentValue ? currentValue.split(",") : [];

      const updatedBrands = currentBrands.filter(
        (brand) => brand !== groupSlug
      );

      if (updatedBrands.length > 0) {
        params.set("brands", updatedBrands.join(","));
      } else {
        params.delete("brands");
      }
    } else if (optionSlug) {
      const currentValue = params.get(groupSlug) || "";
      const currentOptions = currentValue ? currentValue.split(",") : [];

      const updatedOptions = currentOptions.filter((opt) => opt !== optionSlug);

      if (updatedOptions.length > 0) {
        params.set(groupSlug, updatedOptions.join(","));
      } else {
        params.delete(groupSlug);
      }
    }

    replace(`?${params.toString()}`);
  };

  const clearAllFilters = () => {
    const params = new URLSearchParams();
    replace(`?${params.toString()}`);
  };

  const getActiveFilters = () => {
    const activeFilters: Array<{
      type: "variant" | "brand";
      groupSlug: string;
      groupName: string;
      optionSlug?: string;
      optionName: string;
    }> = [];

    // Variant grupları için aktif filtreler
    variantGroups.forEach((group) => {
      const groupTranslation =
        group.translations.find((t) => t.locale === locale) ||
        group.translations[0];
      const currentValue = searchParams.get(groupTranslation.slug) || "";
      const selectedOptions = currentValue ? currentValue.split(",") : [];

      selectedOptions.forEach((selectedOptionSlug) => {
        const option = group.options.find((opt) => {
          const optionTranslation =
            opt.translations.find((t) => t.locale === locale) ||
            opt.translations[0];
          return optionTranslation.slug === selectedOptionSlug;
        });

        if (option) {
          const optionTranslation =
            option.translations.find((t) => t.locale === locale) ||
            option.translations[0];
          activeFilters.push({
            type: "variant",
            groupSlug: groupTranslation.slug,
            groupName: groupTranslation.name,
            optionSlug: selectedOptionSlug,
            optionName: optionTranslation.name,
          });
        }
      });
    });

    // Brandlar için aktif filtreler
    const selectedBrandsValue = searchParams.get("brands") || "";
    const selectedBrands = selectedBrandsValue
      ? selectedBrandsValue.split(",")
      : [];

    selectedBrands.forEach((selectedBrandSlug) => {
      const brand = brands.find((b) => {
        const brandTranslation =
          b.translations.find((t) => t.locale === locale) || b.translations[0];
        return brandTranslation.slug === selectedBrandSlug;
      });

      if (brand) {
        const brandTranslation =
          brand.translations.find((t) => t.locale === locale) ||
          brand.translations[0];
        activeFilters.push({
          type: "brand",
          groupSlug: selectedBrandSlug,
          groupName: "Markalar",
          optionName: brandTranslation.name,
        });
      }
    });

    return activeFilters;
  };

  const isOptionSelected = (
    variantGroupSlug: string,
    variantOptionSlug: string
  ) => {
    const currentValue = searchParams.get(variantGroupSlug) || "";
    const currentOptions = currentValue ? currentValue.split(",") : [];
    return currentOptions.includes(variantOptionSlug);
  };

  const isBrandSelected = (brandSlug: string) => {
    const currentValue = searchParams.get("brands") || "";
    const currentBrands = currentValue ? currentValue.split(",") : [];
    return currentBrands.includes(brandSlug);
  };

  const getDefaultAccordionValues = () => {
    const openAccordions: string[] = [];

    // Variant grupları için
    variantGroups.forEach((group) => {
      const translation =
        group.translations.find((t) => t.locale === locale) ||
        group.translations[0];
      const hasSelectedOptions = searchParams.get(translation.slug);
      if (hasSelectedOptions) {
        openAccordions.push(translation.slug);
      }
    });

    // Brandlar için
    const hasSelectedBrands = searchParams.get("brands");
    if (hasSelectedBrands) {
      openAccordions.push("brands");
    }

    return openAccordions;
  };

  const renderFilterOptions = (group: (typeof variantGroups)[0]) => {
    const translation =
      group.translations.find((t) => t.locale === locale) ||
      group.translations[0];
    const type = group.type;

    if (group.options && group.options.length > 0 && type === "COLOR") {
      return (
        <Group gap={"lg"} wrap="wrap">
          {group.options.map((option) => {
            const optionTranslation =
              option.translations.find((t) => t.locale === locale) ||
              option.translations[0];

            const isSelected = isOptionSelected(
              translation.slug,
              optionTranslation.slug
            );

            return (
              <Badge
                tt={"capitalize"}
                variant={isSelected ? "filled" : "default"}
                radius={"sm"}
                color={"black"}
                size="xl"
                key={option.id}
                onClick={() => {
                  handleClick(translation.slug, optionTranslation.slug);
                }}
                style={{ cursor: "pointer" }}
              >
                {optionTranslation.name}
              </Badge>
            );
          })}
        </Group>
      );
    } else {
      return (
        <Stack gap={"md"} className="w-full">
          {group.options.map((option) => {
            const optionTranslation =
              option.translations.find((t) => t.locale === locale) ||
              option.translations[0];

            const isSelected = isOptionSelected(
              translation.slug,
              optionTranslation.slug
            );

            return (
              <Checkbox
                label={optionTranslation.name}
                key={option.id}
                size="md"
                color={"black"}
                variant="filled"
                checked={isSelected}
                onChange={() => {
                  handleClick(translation.slug, optionTranslation.slug);
                }}
                radius={"xs"}
                className="w-full"
                tt={"capitalize"}
              />
            );
          })}
        </Stack>
      );
    }
  };

  const renderBrandOptions = () => {
    return (
      <Stack gap={"md"} className="w-full">
        {brands.map((brand) => {
          const brandTranslation =
            brand.translations.find((t) => t.locale === locale) ||
            brand.translations[0];

          const isSelected = isBrandSelected(brandTranslation.slug);

          return (
            <Checkbox
              label={brandTranslation.name}
              key={brand.id}
              size="md"
              variant="filled"
              color="black"
              checked={isSelected}
              onChange={() => {
                handleBrandClick(brandTranslation.slug);
              }}
              radius={"xs"}
              className="w-full"
              tt={"capitalize"}
            />
          );
        })}
      </Stack>
    );
  };

  const renderChildCategoryOptions = () => {
    return (
      <Stack gap={"md"} className="w-full">
        {childCategories.map((child) => {
          const childTranslation =
            child.translations.find((t) => t.locale === locale) ||
            child.translations[0];

          return (
            <Link
              key={child.id}
              href={`/categories/${childTranslation.slug}`}
              className="text-black hover:text-[var(--mantine-primary-color-5)] hover:underline hover:underline-offset-4 transition-colors duration-200 capitalize text-sm font-medium"
            >
              {childTranslation.name}
            </Link>
          );
        })}
      </Stack>
    );
  };

  const ActiveFiltersDisplay = ({
    inDrawer = false,
  }: {
    inDrawer?: boolean;
  }) => {
    const activeFilters = getActiveFilters();

    return (
      <Stack gap="sm">
        <Group
          justify={activeFilters.length > 0 ? "space-between" : "flex-end"}
          align="center"
          wrap="nowrap"
        >
          {activeFilters.length > 0 && (
            <Group gap="xs" align="center" wrap="wrap">
              <Button
                variant="subtle"
                size="xs"
                onClick={() => {
                  clearAllFilters();
                  if (inDrawer) {
                    stack.closeAll();
                  }
                }}
                color="red"
              >
                Filtreleri Temizle
              </Button>
              {activeFilters.map((filter, index) => (
                <Badge
                  key={`${filter.type}-${filter.groupSlug}-${filter.optionSlug}-${index}`}
                  variant="outline"
                  size="lg"
                  color="black"
                  tt="capitalize"
                  rightSection={
                    <ActionIcon
                      size="xs"
                      variant="transparent"
                      color="black"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFilter(
                          filter.type,
                          filter.groupSlug,
                          filter.optionSlug
                        );
                      }}
                    >
                      <IconX size={18} />
                    </ActionIcon>
                  }
                >
                  {filter.optionName}
                </Badge>
              ))}
            </Group>
          )}
          <UnstyledButton
            onClick={openBottomDrawer}
            className="hover:underline hover:underline-offset-4 transition-all duration-200 mb-2"
          >
            Sırala
          </UnstyledButton>
        </Group>
      </Stack>
    );
  };

  return (
    <>
      <Grid>
        <Grid.Col
          span={{
            xs: 12,
            sm: 12,
            md: 3,
            lg: 3,
            xl: 3,
          }}
        >
          {!(isTablet || isMobile) ? (
            <Card px={0} className="gap-3">
              <Accordion
                multiple
                defaultValue={getDefaultAccordionValues()}
                classNames={{
                  content: "px-1 py-3",
                  control: "hover:bg-white",
                }}
              >
                {/* Alt Kategoriler Accordion */}
                {childCategories && childCategories.length > 0 && (
                  <Accordion.Item
                    classNames={{
                      item: "border-b border-b-black last:border-0",
                    }}
                    value="child-categories"
                  >
                    <Accordion.Control
                      value="child-categories"
                      tt={"capitalize"}
                      fw={700}
                      fz={"md"}
                      px={0}
                    >
                      Alt Kategoriler
                    </Accordion.Control>
                    <Accordion.Panel px={0}>
                      {renderChildCategoryOptions()}
                    </Accordion.Panel>
                  </Accordion.Item>
                )}

                {/* Markalar Accordion */}
                {brands && brands.length > 0 && (
                  <Accordion.Item
                    classNames={{
                      item: "border-b border-b-black last:border-0",
                    }}
                    value="brands"
                  >
                    <Accordion.Control
                      value="brands"
                      tt={"capitalize"}
                      fw={700}
                      fz={"md"}
                      px={0}
                    >
                      Markalar
                    </Accordion.Control>
                    <Accordion.Panel px={0}>
                      {renderBrandOptions()}
                    </Accordion.Panel>
                  </Accordion.Item>
                )}

                {/* Variant Grupları Accordion */}
                {variantGroups &&
                  variantGroups.length > 0 &&
                  variantGroups.map((group) => {
                    const translation =
                      group.translations.find((t) => t.locale === locale) ||
                      group.translations[0];

                    return (
                      <Accordion.Item
                        classNames={{
                          item: "border-b border-b-black last:border-0",
                        }}
                        key={group.id}
                        value={translation.slug}
                      >
                        <Accordion.Control
                          value={translation.slug}
                          tt={"capitalize"}
                          fw={700}
                          fz={"md"}
                          px={0}
                        >
                          {translation.name}
                        </Accordion.Control>
                        <Accordion.Panel px={0}>
                          {renderFilterOptions(group)}
                        </Accordion.Panel>
                      </Accordion.Item>
                    );
                  })}
              </Accordion>
            </Card>
          ) : (
            <>
              <Group
                grow
                gap={0}
                align="center"
                py={"sm"}
                className="border-y border-y-black"
              >
                <UnstyledButton
                  onClick={() => stack.open("main")}
                  style={{
                    textAlign: "center",
                    fontWeight: 600,
                    borderRight: "1px solid black",
                  }}
                >
                  Filtrele
                </UnstyledButton>
                <UnstyledButton
                  style={{
                    textAlign: "center",
                    fontWeight: 600,
                  }}
                  onClick={openBottomDrawer}
                >
                  Sırala
                </UnstyledButton>
              </Group>
              <Drawer.Stack>
                <Drawer
                  {...stack.register("main")}
                  position="right"
                  size={"75%"}
                  title="Filtrele"
                  closeButtonProps={{
                    size: "lg",
                    fw: 700,
                  }}
                  classNames={{
                    title: "text-lg font-bold capitalize ",
                    header: "border-b border-b-black",
                  }}
                >
                  <Stack gap={"md"} py={"xl"}>
                    <ActiveFiltersDisplay inDrawer={true} />

                    {childCategories && childCategories.length > 0 && (
                      <UnstyledButton
                        tt={"capitalize"}
                        fw={700}
                        onClick={() => stack.open("child-categories")}
                        className="w-full flex flex-row items-center justify-between border-b border-b-black pb-2"
                      >
                        Alt Kategoriler
                        <ThemeIcon
                          variant="transparent"
                          color="black"
                          size={"lg"}
                        >
                          <IconChevronRight size={24} stroke={2} />
                        </ThemeIcon>
                      </UnstyledButton>
                    )}

                    {brands && brands.length > 0 && (
                      <UnstyledButton
                        tt={"capitalize"}
                        fw={700}
                        onClick={() => stack.open("brands")}
                        className="w-full flex flex-row items-center justify-between border-b border-b-black pb-2"
                      >
                        Markalar
                        <ThemeIcon
                          variant="transparent"
                          color="black"
                          size={"lg"}
                        >
                          <IconChevronRight size={24} stroke={2} />
                        </ThemeIcon>
                      </UnstyledButton>
                    )}

                    {/* Variant Groups Drawer Buttons */}
                    {variantGroups &&
                      variantGroups.length > 0 &&
                      variantGroups.map((vg) => {
                        const translation =
                          vg.translations.find((t) => t.locale === locale) ||
                          vg.translations[0];
                        return (
                          <UnstyledButton
                            tt={"capitalize"}
                            fw={700}
                            key={vg.id}
                            onClick={() => stack.open(translation.slug)}
                            className="w-full flex flex-row items-center justify-between border-b border-b-black pb-2"
                          >
                            {translation.name}
                            <ThemeIcon
                              variant="transparent"
                              color="black"
                              size={"lg"}
                            >
                              <IconChevronRight size={24} stroke={2} />
                            </ThemeIcon>
                          </UnstyledButton>
                        );
                      })}
                  </Stack>
                </Drawer>

                {/* Child Categories Drawer */}
                {childCategories && childCategories.length > 0 && (
                  <Drawer
                    position="right"
                    size={"75%"}
                    title="Alt Kategoriler"
                    closeButtonProps={{
                      size: "lg",
                      fw: 700,
                    }}
                    classNames={{
                      title: "text-lg font-bold capitalize text-black",
                      header: "border-b border-b-black",
                    }}
                    {...stack.register("child-categories")}
                  >
                    <Stack py="lg">{renderChildCategoryOptions()}</Stack>
                  </Drawer>
                )}

                {/* Brands Drawer */}
                {brands && brands.length > 0 && (
                  <Drawer
                    position="right"
                    size={"75%"}
                    title="Markalar"
                    closeButtonProps={{
                      size: "lg",
                      fw: 700,
                    }}
                    classNames={{
                      title: "text-lg font-bold capitalize text-black",
                      header: "border-b border-b-black",
                    }}
                    {...stack.register("brands")}
                  >
                    <Stack py="lg">{renderBrandOptions()}</Stack>
                  </Drawer>
                )}

                {/* Variant Groups Drawers */}
                {variantGroups &&
                  variantGroups.length > 0 &&
                  variantGroups.map((group) => {
                    const translation =
                      group.translations.find((t) => t.locale === locale) ||
                      group.translations[0];

                    if (!translation) return null;

                    return (
                      <Drawer
                        position="right"
                        size={"75%"}
                        title={translation.name}
                        closeButtonProps={{
                          size: "lg",
                          fw: 700,
                        }}
                        classNames={{
                          title: "text-lg font-bold capitalize text-black",
                          header: "border-b border-b-black",
                        }}
                        key={group.id}
                        {...stack.register(translation.slug)}
                      >
                        <Stack py="lg">{renderFilterOptions(group)}</Stack>
                      </Drawer>
                    );
                  })}
              </Drawer.Stack>
            </>
          )}
        </Grid.Col>
        <Grid.Col
          span={{
            xs: 12,
            sm: 12,
            md: 9,
            lg: 9,
            xl: 9,
          }}
        >
          {!(isTablet || isMobile) && <ActiveFiltersDisplay />}

          <CategoryProducts categoryId={categoryId} />
        </Grid.Col>
      </Grid>
      <Drawer
        opened={openedBottomDrawer}
        onClose={closeBottomDrawer}
        position="bottom"
        size={isTablet || isMobile ? "50%" : "50%"}
        title="Sıralama"
        classNames={{
          title: "text-lg font-bold text-black",
          header: "border-b border-b-black",
        }}
        closeButtonProps={{
          size: "lg",
          fw: 700,
        }}
      >
        <Stack gap={"xs"} py="md">
          {Object.values(ProductPageSortOption).map((option, index) => {
            return (
              <UnstyledButton
                key={index}
                className="w-full flex flex-row items-center justify-between px-2 py-3 hover:bg-gray-50 rounded-md transition-colors"
                onClick={() => {
                  setCheckedSortValue(index);
                  const params = new URLSearchParams(searchParams.toString());
                  params.set("o", index.toString());
                  replace(`?${params.toString()}`);
                  closeBottomDrawer();
                }}
              >
                <span className="text-sm font-medium">
                  {getSortProductPageLabel(option)}
                </span>
                {checkedSortValue === index && (
                  <ThemeIcon size="sm" variant="transparent" c="black">
                    <IconCheck size={18} />
                  </ThemeIcon>
                )}
              </UnstyledButton>
            );
          })}
        </Stack>
      </Drawer>
    </>
  );
};

export default CategoryPageContent;
