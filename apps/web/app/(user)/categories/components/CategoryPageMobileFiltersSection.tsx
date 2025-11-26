import {
  ActionIcon,
  Badge,
  Checkbox,
  Divider,
  Drawer,
  Group,
  Stack,
  Text,
  UnstyledButton,
  useDrawersStack,
} from "@mantine/core";
import {
  getIndexFromSortOption,
  getSortProductPageLabel,
  ProductPageSortOption,
} from "@repo/shared";
import { CategoryPagePreparePageReturnData } from "@repo/types";
import { IconChevronRight, IconX } from "@tabler/icons-react";
import { ReadonlyURLSearchParams, useRouter } from "next/navigation";
import { $Enums } from "@repo/database/client";
interface CategoryPageMobileFilterProps {
  variantGroups: CategoryPagePreparePageReturnData["variantGroups"];
  locale: $Enums.Locale;
  brands: CategoryPagePreparePageReturnData["brands"];
  pageSearchParams: ReadonlyURLSearchParams;
}

const CategoryPageMobileFiltersSection = ({
  locale,
  pageSearchParams,
  variantGroups,
  brands,
}: CategoryPageMobileFilterProps) => {
  const { replace } = useRouter();
  const allFilterKeys = [
    "brand",
    ...variantGroups.flatMap(
      (vg) => vg.translations.find((t) => t.locale === locale)?.slug || []
    ),
  ];
  const hasFilters = allFilterKeys.some((key) => pageSearchParams.has(key));

  const stack = useDrawersStack([
    "filters-drawer",
    "sort-drawer",
    "brand",
    ...variantGroups.map(
      (vg) => vg.translations.find((t) => t.locale === locale)?.slug || ""
    ),
  ]);

  const currentSortIndex = pageSearchParams.get("sort") || "0";

  return (
    <>
      <Group className="w-full py-2 px-4 justify-between border-y border-black">
        <UnstyledButton
          className="flex-1"
          onClick={() => stack.open("filters-drawer")}
        >
          <Text fw={700} size="md" ta="center">
            Filtrele
          </Text>
        </UnstyledButton>
        <Divider orientation="vertical" color="black" size={"sm"} />
        <UnstyledButton
          className="flex-1"
          onClick={() => stack.open("sort-drawer")}
        >
          <Text fw={700} size="md" ta="center">
            Sırala
          </Text>
        </UnstyledButton>
      </Group>
      <Drawer
        {...stack.register("filters-drawer")}
        position="right"
        zIndex={100000}
        size="75%"
        classNames={{
          header: "border-b border-b-black",
          title: "flex-1",
        }}
        title={
          <Text fz={"lg"} fw={700}>
            Filtrele
          </Text>
        }
      >
        <Stack gap={0} py={"md"}>
          {hasFilters && (
            <Group gap={"xs"}>
              <Badge
                size="lg"
                color="black"
                variant="light"
                rightSection={
                  <ActionIcon
                    size="xs"
                    color="black"
                    variant="transparent"
                    onClick={() => {
                      replace(`?`);
                    }}
                  >
                    <IconX />
                  </ActionIcon>
                }
              >
                Filtreleri Temizle
              </Badge>
              {variantGroups.map((vg) => {
                const slug = vg.translations.find(
                  (t) => t.locale === locale
                )?.slug;
                if (!slug) return null;

                const selectedOptions =
                  pageSearchParams.get(slug)?.split(",") || [];

                return selectedOptions.map((optionSlug) => {
                  const option = vg.options.find(
                    (opt) =>
                      opt.translations.find((t) => t.locale === locale)
                        ?.slug === optionSlug
                  );

                  if (!option) return null;

                  const optionName = option.translations.find(
                    (t) => t.locale === locale
                  )?.name;

                  return (
                    <Badge
                      key={`${slug}-${optionSlug}`}
                      size="lg"
                      color="black"
                      variant="light"
                      rightSection={
                        <ActionIcon
                          size="xs"
                          color="black"
                          variant="transparent"
                          onClick={() => {
                            const searchParams = new URLSearchParams(
                              pageSearchParams.toString()
                            );

                            const currentOptions =
                              searchParams.get(slug)?.split(",") || [];
                            const newOptions = currentOptions.filter(
                              (opt) => opt !== optionSlug
                            );

                            if (newOptions.length === 0) {
                              searchParams.delete(slug);
                            } else {
                              searchParams.set(slug, newOptions.join(","));
                            }

                            replace(`?${searchParams.toString()}`);
                          }}
                        >
                          <IconX />
                        </ActionIcon>
                      }
                    >
                      {optionName}
                    </Badge>
                  );
                });
              })}
            </Group>
          )}
          {brands && brands.length > 0 && (
            <UnstyledButton
              onClick={() => stack.open("brand")}
              className="border-b border-b-gray-300"
            >
              <Group justify="space-between" py={"md"} px={"md"}>
                <Text fz={"md"} fw={600} tt="uppercase">
                  MARKA
                </Text>
                <IconChevronRight size={20} />
              </Group>
            </UnstyledButton>
          )}

          {/* Variant Group Filtreleri */}
          {variantGroups.map((vg, idx) => {
            const translation = vg.translations.find(
              (t) => t.locale === locale
            );
            if (!translation) return null;

            const selectedCount =
              pageSearchParams.get(translation.slug)?.split(",").length || 0;

            return (
              <UnstyledButton
                key={idx}
                onClick={() => stack.open(translation.slug)}
                className="border-b border-b-gray-300"
              >
                <Group justify="space-between" py={"md"} px={"md"}>
                  <Text fz={"md"} fw={600} tt="uppercase">
                    {translation.name}
                    {selectedCount > 0 && ` (${selectedCount})`}
                  </Text>
                  <IconChevronRight size={20} />
                </Group>
              </UnstyledButton>
            );
          })}
        </Stack>
      </Drawer>

      {/* Brand Detay Drawer */}
      <Drawer
        {...stack.register("brand")}
        position="right"
        size="75%"
        classNames={{
          header: "border-b border-b-black",
          title: "flex-1",
        }}
        zIndex={100000}
        title={
          <Group w="100%">
            <Text fz={"lg"} fw={700}>
              RENK
            </Text>
          </Group>
        }
      >
        <Stack gap={"md"} py={"md"} px={"md"}>
          {brands.map((brand) => {
            const selectedBrands =
              pageSearchParams.get("brand")?.split(",") || [];
            const brandTranslation = brand.translations.find(
              (t) => t.locale === locale
            );
            if (!brandTranslation) return null;
            const isChecked = selectedBrands.includes(brandTranslation.slug);

            return (
              <Checkbox
                color="black"
                key={brandTranslation.id}
                label={
                  <Text fz={"md"} fw={600}>
                    {brandTranslation.name}
                  </Text>
                }
                checked={isChecked}
                onChange={(event) => {
                  const searchParams = new URLSearchParams(
                    pageSearchParams.toString()
                  );
                  const currentBrands =
                    searchParams.get("brand")?.split(",") || [];

                  if (event.currentTarget.checked) {
                    currentBrands.push(brandTranslation.slug);
                  } else {
                    const index = currentBrands.indexOf(brandTranslation.slug);
                    if (index > -1) {
                      currentBrands.splice(index, 1);
                    }
                  }

                  if (currentBrands.length === 0) {
                    searchParams.delete("brand");
                  } else {
                    searchParams.set("brand", currentBrands.join(","));
                  }

                  replace(`?${searchParams.toString()}`);
                }}
              />
            );
          })}
        </Stack>
      </Drawer>

      {/* Variant Group Detay Drawers */}
      {variantGroups.map((vg, idx) => {
        const translation = vg.translations.find((t) => t.locale === locale);
        if (!translation) return null;

        return (
          <Drawer
            key={idx}
            zIndex={100000}
            {...stack.register(translation.slug)}
            position="right"
            size="75%"
            classNames={{
              header: "border-b border-b-black",
              title: "flex-1",
            }}
            title={
              <Group w="100%">
                <Text fz={"lg"} fw={700} tt="uppercase">
                  {translation.name}
                </Text>
              </Group>
            }
          >
            <Stack gap={"md"} py={"md"} px={"md"}>
              {vg.options.map((option) => {
                const optionTranslation = option.translations.find(
                  (t) => t.locale === locale
                );
                if (!optionTranslation) return null;

                const selectedOptions =
                  pageSearchParams.get(translation.slug)?.split(",") || [];
                const isChecked = selectedOptions.includes(
                  optionTranslation.slug
                );

                return (
                  <Checkbox
                    key={optionTranslation.id}
                    label={
                      <Text fz={"md"} fw={600}>
                        {optionTranslation.name}
                      </Text>
                    }
                    color="black"
                    checked={isChecked}
                    onChange={(event) => {
                      const searchParams = new URLSearchParams(
                        pageSearchParams.toString()
                      );
                      const currentOptions =
                        searchParams.get(translation.slug)?.split(",") || [];

                      if (event.currentTarget.checked) {
                        currentOptions.push(optionTranslation.slug);
                      } else {
                        const index = currentOptions.indexOf(
                          optionTranslation.slug
                        );
                        if (index > -1) {
                          currentOptions.splice(index, 1);
                        }
                      }

                      if (currentOptions.length === 0) {
                        searchParams.delete(translation.slug);
                      } else {
                        searchParams.set(
                          translation.slug,
                          currentOptions.join(",")
                        );
                      }

                      replace(`?${searchParams.toString()}`);
                    }}
                  />
                );
              })}
            </Stack>
          </Drawer>
        );
      })}

      {/* Sırala Drawer */}
      <Drawer
        {...stack.register("sort-drawer")}
        position="bottom"
        size={"md"}
        classNames={{
          header: "text-center border-b border-b-black",
        }}
        title={
          <Text fz={"md"} fw={700}>
            Sırala
          </Text>
        }
        zIndex={100000}
      >
        <Stack gap={0} py={"md"}>
          {Object.values(ProductPageSortOption).map((sortOption, idx) => {
            const sortIndex = getIndexFromSortOption(sortOption).toString();
            const isActive = currentSortIndex === sortIndex;
            const isLast =
              idx === Object.values(ProductPageSortOption).length - 1;

            return (
              <UnstyledButton
                key={idx}
                onClick={() => {
                  const searchParams = new URLSearchParams(
                    pageSearchParams.toString()
                  );

                  if (sortIndex === "0") {
                    searchParams.delete("sort");
                  } else {
                    searchParams.set("sort", sortIndex);
                  }

                  replace(`?${searchParams.toString()}`);
                  stack.close("sort-drawer");
                }}
                className={`${!isLast ? "border-b border-b-gray-300" : ""}`}
              >
                <Text
                  tt={"capitalize"}
                  fz={"md"}
                  py={"xs"}
                  c={isActive ? "black" : "dimmed"}
                  fw={isActive ? 600 : 400}
                >
                  {getSortProductPageLabel(sortOption)}
                </Text>
              </UnstyledButton>
            );
          })}
        </Stack>
      </Drawer>
    </>
  );
};

export default CategoryPageMobileFiltersSection;
