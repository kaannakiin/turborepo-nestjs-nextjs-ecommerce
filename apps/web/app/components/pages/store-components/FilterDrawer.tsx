"use client";

import {
  Box,
  Button,
  Collapse,
  Divider,
  Drawer,
  Group,
  NumberInput,
  RangeSlider,
  ScrollArea,
  Stack,
  Text,
  UnstyledButton,
} from "@mantine/core";
import {
  VariantGroupRenderType,
  VariantGroupType,
} from "@repo/database/client";
import { FiltersResponse, TreeNode } from "@repo/types";
import { IconChevronDown, IconFilter2, IconX } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FilterData, PageType } from "./QueryFilters";
import BadgeRenderer from "./renderer-items/BadgeRenderer";
import CheckboxRenderer from "./renderer-items/CheckboxRenderer";
import ColorSwatchRenderer from "./renderer-items/ColorSwatchRenderer";

interface FilterDrawerProps {
  opened: boolean;
  onClose: () => void;
  filters: FiltersResponse;
  selectedData: FilterData;
  onApply: (data: FilterData) => void;
  onClear: () => void;
  pageType: PageType;
  treeNode?: TreeNode;
}

const FilterSection = ({
  title,
  count,
  children,
  defaultOpened = false,
}: {
  title: string;
  count?: number;
  children: React.ReactNode;
  defaultOpened?: boolean;
}) => {
  const [opened, setOpened] = useState(defaultOpened);

  useEffect(() => {
    if (count && count > 0) {
      setOpened(true);
    }
  }, [count]);

  return (
    <Box>
      <UnstyledButton
        onClick={() => setOpened(!opened)}
        style={{ width: "100%" }}
      >
        <Group justify="space-between" mb={opened ? "md" : "0"}>
          <Group gap="xs">
            <Text fw={500} size="sm" tt="uppercase" c="dimmed">
              {title}
            </Text>
          </Group>
          <IconChevronDown
            size={16}
            style={{
              transform: opened ? "rotate(180deg)" : "none",
              transition: "transform 200ms ease",
            }}
          />
        </Group>
      </UnstyledButton>

      <Collapse in={opened}>{children}</Collapse>

      <Divider my="md" />
    </Box>
  );
};

const flattenCategoryTree = (
  categories: TreeNode[],
  level = 0
): Array<{ category: TreeNode; level: number }> => {
  const result: Array<{ category: TreeNode; level: number }> = [];

  categories.forEach((category) => {
    result.push({ category, level });

    if (category.children && category.children.length > 0) {
      result.push(...flattenCategoryTree(category.children, level + 1));
    }
  });

  return result;
};

const FilterDrawer = ({
  opened,
  onClose,
  filters,
  selectedData,
  onApply,
  onClear,
  pageType,
  treeNode,
}: FilterDrawerProps) => {
  const router = useRouter();
  const [localData, setLocalData] = useState<FilterData>(selectedData);

  const [priceRange, setPriceRange] = useState<[number, number]>([
    localData.priceRange?.min || 0,
    localData.priceRange?.max || 10000,
  ]);

  useEffect(() => {
    if (opened) {
      setLocalData(selectedData);
      setPriceRange([
        selectedData.priceRange?.min || 0,
        selectedData.priceRange?.max || 10000,
      ]);
    }
  }, [opened, selectedData]);

  const handleToggle = (
    category: "categories" | "brands" | "tags",
    slug: string,
    checked: boolean
  ) => {
    setLocalData((prev) => {
      const current = prev[category] || [];
      const updated = checked
        ? [...current, slug]
        : current.filter((item) => item !== slug);
      return {
        ...prev,
        [category]: updated.length > 0 ? updated : undefined,
      };
    });
  };

  const handleCategoryClick = (slug: string) => {
    router.push(`/categories/${slug}`);
    onClose();
  };

  const handleVariantToggle = (
    groupSlug: string,
    optionSlug: string,
    checked: boolean
  ) => {
    setLocalData((prev) => {
      const currentOptions = prev.variants[groupSlug] || [];
      const newOptions = checked
        ? [...currentOptions, optionSlug]
        : currentOptions.filter((o) => o !== optionSlug);

      const newVariants = { ...prev.variants };
      if (newOptions.length > 0) {
        newVariants[groupSlug] = newOptions;
      } else {
        delete newVariants[groupSlug];
      }

      return { ...prev, variants: newVariants };
    });
  };

  const handlePriceRangeChange = (value: [number, number]) => {
    setPriceRange(value);
    setLocalData((prev) => ({
      ...prev,
      priceRange: {
        min: value[0],
        max: value[1],
      },
    }));
  };

  const handlePriceInputChange = (
    type: "min" | "max",
    value: number | string
  ) => {
    const numValue = typeof value === "string" ? parseFloat(value) : value;
    if (isNaN(numValue)) return;

    const newRange: [number, number] =
      type === "min" ? [numValue, priceRange[1]] : [priceRange[0], numValue];

    setPriceRange(newRange);
    setLocalData((prev) => ({
      ...prev,
      priceRange: {
        min: newRange[0],
        max: newRange[1],
      },
    }));
  };

  const selectedCount =
    (localData.categories?.length || 0) +
    (localData.brands?.length || 0) +
    (localData.tags?.length || 0) +
    Object.values(localData.variants).flat().length +
    (localData.priceRange?.min || localData.priceRange?.max ? 1 : 0);

  const childCategories = treeNode?.children || [];

  const flatCategories = flattenCategoryTree(childCategories);

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="left"
      size="md"
      title={
        <Group gap="xs">
          <IconFilter2 size={20} />
          <Text fw={600} size="lg">
            Filtreleme
          </Text>
        </Group>
      }
      styles={{
        header: {
          borderBottom: "1px solid var(--mantine-color-gray-3)",
          paddingBottom: "1rem",
        },
        body: {
          padding: 0,
        },
      }}
    >
      <Box
        style={{
          display: "flex",
          flexDirection: "column",
          height: "calc(100vh - 80px)",
        }}
      >
        <ScrollArea flex={1} type="scroll">
          <Box px="md" py="md">
            <Stack gap={0}>
              {pageType === "categories" && flatCategories.length > 0 && (
                <FilterSection title="Alt Kategoriler">
                  <Stack gap={0}>
                    {flatCategories.map(({ category, level }) => (
                      <button
                        key={category.id}
                        onClick={() => handleCategoryClick(category.slug)}
                        className="flex items-center w-full p-2 rounded-lg transition-colors hover:bg-gray-100 active:bg-gray-200 text-left"
                      >
                        <Text size="sm" lineClamp={1}>
                          {category.name}
                        </Text>
                      </button>
                    ))}
                  </Stack>
                </FilterSection>
              )}

              {pageType !== "categories" &&
                filters.categories &&
                filters.categories.length > 0 && (
                  <FilterSection
                    title="Kategoriler"
                    count={localData.categories?.length}
                  >
                    <CheckboxRenderer
                      items={filters.categories.map((cat) => ({
                        id: cat.id,
                        slug: cat.translations[0]?.slug,
                        name: cat.translations[0]?.name,
                        image: cat.image,
                      }))}
                      selectedSlugs={localData.categories || []}
                      onToggle={(slug, checked) =>
                        handleToggle("categories", slug, checked)
                      }
                    />
                  </FilterSection>
                )}

              {pageType !== "brands" &&
                filters.brands &&
                filters.brands.length > 0 && (
                  <FilterSection
                    title="Markalar"
                    count={localData.brands?.length}
                  >
                    <CheckboxRenderer
                      items={filters.brands.map((brand) => ({
                        id: brand.id,
                        slug: brand.translations[0]?.slug,
                        name: brand.translations[0]?.name,
                        image: brand.image,
                      }))}
                      selectedSlugs={localData.brands || []}
                      onToggle={(slug, checked) =>
                        handleToggle("brands", slug, checked)
                      }
                    />
                  </FilterSection>
                )}

              {pageType !== "tags" &&
                filters.tags &&
                filters.tags.length > 0 && (
                  <FilterSection
                    title="Etiketler"
                    count={localData.tags?.length}
                  >
                    <CheckboxRenderer
                      items={filters.tags.map((tag) => ({
                        id: tag.id,
                        slug: tag.translations[0]?.slug,
                        name: tag.translations[0]?.name,
                        color: tag.color,
                      }))}
                      selectedSlugs={localData.tags || []}
                      onToggle={(slug, checked) =>
                        handleToggle("tags", slug, checked)
                      }
                    />
                  </FilterSection>
                )}

              <FilterSection
                title="Fiyat Aralığı"
                count={
                  localData.priceRange?.min || localData.priceRange?.max ? 1 : 0
                }
              >
                <Stack gap="lg">
                  <RangeSlider
                    min={0}
                    max={10000}
                    step={100}
                    value={priceRange}
                    onChange={handlePriceRangeChange}
                    marks={[
                      { value: 0, label: "₺0" },
                      { value: 5000, label: "₺5K" },
                      { value: 10000, label: "₺10K" },
                    ]}
                    styles={{
                      markLabel: { fontSize: "12px" },
                    }}
                  />

                  <Group grow align="flex-end" gap="xs">
                    <NumberInput
                      label="Min"
                      placeholder="0"
                      min={0}
                      max={priceRange[1]}
                      value={priceRange[0]}
                      hideControls
                      onChange={(value) => handlePriceInputChange("min", value)}
                      styles={{ input: { textAlign: "center" } }}
                    />

                    <NumberInput
                      label="Max"
                      placeholder="10000"
                      min={priceRange[0]}
                      max={10000}
                      value={priceRange[1]}
                      hideControls
                      onChange={(value) => handlePriceInputChange("max", value)}
                      styles={{ input: { textAlign: "center" } }}
                    />
                  </Group>
                </Stack>
              </FilterSection>

              {filters.variantGroups.map((group) => {
                const groupSlug = group.translations[0]?.slug;
                const groupName = group.translations[0]?.name;

                if (!groupSlug || !groupName) return null;

                const selectedInGroup =
                  localData.variants[groupSlug]?.length || 0;

                const hasDropdownRender = group.productVariantGroups?.some(
                  (pvg) =>
                    pvg.renderVisibleType === VariantGroupRenderType.DROPDOWN
                );

                if (group.type === VariantGroupType.LIST) {
                  if (hasDropdownRender) {
                    return (
                      <FilterSection
                        key={group.id}
                        title={groupName}
                        count={selectedInGroup}
                      >
                        <CheckboxRenderer
                          items={group.options.map((opt) => ({
                            id: opt.id,
                            slug: opt.translations[0]?.slug,
                            name: opt.translations[0]?.name,
                          }))}
                          selectedSlugs={localData.variants[groupSlug] || []}
                          onToggle={(slug, checked) =>
                            handleVariantToggle(groupSlug, slug, checked)
                          }
                        />
                      </FilterSection>
                    );
                  }

                  return (
                    <FilterSection
                      key={group.id}
                      title={groupName}
                      count={selectedInGroup}
                    >
                      <BadgeRenderer
                        items={group.options.map((opt) => ({
                          id: opt.id,
                          slug: opt.translations[0]?.slug,
                          name: opt.translations[0]?.name,
                        }))}
                        selectedSlugs={localData.variants[groupSlug] || []}
                        onToggle={(slug, checked) =>
                          handleVariantToggle(groupSlug, slug, checked)
                        }
                      />
                    </FilterSection>
                  );
                }

                if (group.type === VariantGroupType.COLOR) {
                  const hasAsset = group.options.some((opt) => opt.asset);
                  const hasHexValue = group.options.some((opt) => opt.hexValue);

                  if (hasAsset || hasHexValue) {
                    return (
                      <FilterSection
                        key={group.id}
                        title={groupName}
                        count={selectedInGroup}
                      >
                        <ColorSwatchRenderer
                          options={group.options}
                          groupSlug={groupSlug}
                          selectedOptions={localData.variants[groupSlug] || []}
                          onToggle={handleVariantToggle}
                          showImages={hasAsset}
                        />
                      </FilterSection>
                    );
                  }
                }

                return null;
              })}
            </Stack>
          </Box>
        </ScrollArea>

        <Box
          p="md"
          style={{
            borderTop: "1px solid var(--mantine-color-gray-3)",
            backgroundColor: "white",
          }}
        >
          <Group grow>
            <Button
              variant="default"
              leftSection={<IconX size={16} />}
              onClick={onClear}
              disabled={selectedCount === 0}
            >
              Temizle
            </Button>
            <Button onClick={() => onApply(localData)} size="md">
              Filtreleri Uygula {selectedCount > 0 && `(${selectedCount})`}
            </Button>
          </Group>
        </Box>
      </Box>
    </Drawer>
  );
};

export default FilterDrawer;
