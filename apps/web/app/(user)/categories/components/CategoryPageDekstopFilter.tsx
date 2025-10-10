import { ActionIcon, Badge, Group, Select } from "@mantine/core";
import {
  getIndexFromSortOption,
  getSortProductPageLabel,
  ProductPageSortOption,
} from "@repo/shared";
import { $Enums, CategoryPagePreparePageReturnData } from "@repo/types";
import { IconSortDescending, IconX } from "@tabler/icons-react";
import { ReadonlyURLSearchParams, useRouter } from "next/navigation";

interface CategoryPageDekstopFilterProps {
  variantGroups: CategoryPagePreparePageReturnData["variantGroups"];
  locale: $Enums.Locale;
  pageSearchParams: ReadonlyURLSearchParams;
}

const CategoryPageDekstopFilter = ({
  variantGroups,
  locale,
  pageSearchParams,
}: CategoryPageDekstopFilterProps) => {
  const { replace } = useRouter();
  const allFilterKeys = [
    ...variantGroups.flatMap(
      (vg) => vg.translations.find((t) => t.locale === locale)?.slug || []
    ),
  ];
  const hasFilters = allFilterKeys.some((key) => pageSearchParams.has(key));
  return (
    <Group justify="space-between" gap={"lg"}>
      <Group gap={"xs"} align="center">
        {hasFilters && (
          <>
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
                    opt.translations.find((t) => t.locale === locale)?.slug ===
                    optionSlug
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
          </>
        )}
      </Group>
      <Select
        variant="filled"
        size="xs"
        allowDeselect={false}
        rightSection={<IconSortDescending />}
        value={pageSearchParams.get("sort") || "0"}
        onChange={(value) => {
          if (!value) return;
          const searchParams = new URLSearchParams(pageSearchParams.toString());

          if (value === "0") {
            searchParams.delete("sort");
          } else {
            searchParams.set("sort", value);
          }

          replace(`?${searchParams.toString()}`);
        }}
        data={Object.values(ProductPageSortOption).map((sortOption) => ({
          label: getSortProductPageLabel(sortOption),
          value: getIndexFromSortOption(sortOption).toString(),
        }))}
      />
    </Group>
  );
};

export default CategoryPageDekstopFilter;
