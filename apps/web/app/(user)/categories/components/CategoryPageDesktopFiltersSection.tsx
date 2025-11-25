"use client";

import {
  Accordion,
  Button,
  Checkbox,
  Group,
  Stack,
  Text,
  UnstyledButton,
} from "@mantine/core";
import { CategoryPagePreparePageReturnData } from "@repo/types";
import { $Enums } from "@repo/database/client";
import { IconX } from "@tabler/icons-react";
import { ReadonlyURLSearchParams, useRouter } from "next/navigation";

interface CategoryPageFiltersSectionProps {
  variantGroups: CategoryPagePreparePageReturnData["variantGroups"];
  brands: CategoryPagePreparePageReturnData["brands"];
  searchParams: ReadonlyURLSearchParams;
}
const handleFilterChange = (
  key: string,
  value: string,
  searchParams: ReadonlyURLSearchParams,
  replace: (url: string) => void
) => {
  const params = new URLSearchParams(searchParams.toString());
  const currentValues = params.get(key)?.split(",") || [];
  const isSelected = currentValues.includes(value);

  let newValues: string[];

  if (isSelected) {
    // Değer zaten seçiliyse, listeden çıkar
    newValues = currentValues.filter((v) => v !== value);
  } else {
    newValues = [...currentValues, value];
  }

  if (newValues.length > 0) {
    params.set(key, newValues.join(","));
  } else {
    params.delete(key);
  }

  // Her filtre değişiminde sayfayı 1'e sıfırla
  params.delete("page");

  replace(`?${params.toString()}`);
};
const CategoryPageDesktopFiltersSection = ({
  brands,
  variantGroups,
  searchParams,
}: CategoryPageFiltersSectionProps) => {
  const locale: $Enums.Locale = "TR";
  const { replace } = useRouter();

  const allFilterKeys = [
    "brand",
    ...variantGroups.flatMap(
      (vg) => vg.translations.find((t) => t.locale === locale)?.slug || []
    ),
  ];

  const hasFilters = allFilterKeys.some((key) => searchParams.has(key));

  if (
    (!brands || brands.length === 0) &&
    (!variantGroups || variantGroups.length === 0)
  ) {
    return null;
  }

  return (
    <Stack gap={"2px"} p={0} className="w-full  h-full">
      <>
        {brands && brands.length > 0 && (
          <Accordion
            variant="default"
            chevronIconSize={24}
            transitionDuration={200}
            classNames={{
              control: "hover:bg-transparent border-b ",
              item: "border-none",
              panel: "py-2",
            }}
            defaultValue={searchParams.has("brand") ? "brands" : null}
          >
            <Accordion.Item value="brands">
              <Accordion.Control>
                <Group align="center" gap={"xs"}>
                  <Text fz={"md"} fw={700}>
                    Markalar
                  </Text>
                  {searchParams.getAll("brand") && (
                    <UnstyledButton
                      fz={"xs"}
                      fw={500}
                      className="hover:underline hover:underline-offset-4"
                      onClick={(e) => {
                        e.stopPropagation();
                        const pageParams = new URLSearchParams(
                          searchParams.toString()
                        );
                        pageParams.delete("brand");
                        replace(`?${pageParams.toString()}`);
                      }}
                    >
                      (Temizle)
                    </UnstyledButton>
                  )}
                </Group>
              </Accordion.Control>
              <Accordion.Panel>
                <Stack gap={"xs"}>
                  {brands.map((brand, idx) => {
                    const translation = brand.translations.find(
                      (t) => t.locale === locale
                    );
                    if (!translation) return null;

                    const selectedBrands =
                      searchParams.get("brand")?.split(",") || [];
                    const isChecked = selectedBrands.includes(translation.slug);
                    return (
                      <Group
                        key={idx}
                        gap={"xs"}
                        className="w-full cursor-pointer"
                        align="center"
                        onClick={() =>
                          handleFilterChange(
                            "brand",
                            translation.slug,
                            searchParams,
                            replace
                          )
                        }
                      >
                        <Checkbox
                          color="black"
                          radius={"0"}
                          readOnly
                          checked={isChecked}
                        />
                        <Text fz={"md"} fw={600}>
                          {translation.name}
                        </Text>
                      </Group>
                    );
                  })}
                </Stack>
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion>
        )}
        {variantGroups &&
          variantGroups.length > 0 &&
          variantGroups.map((vg, index) => {
            const translation = vg.translations.find(
              (t) => t.locale === locale
            );
            if (!translation) return null;

            const filterKey = translation.slug;
            return (
              <Accordion
                key={index}
                multiple
                variant="default"
                chevronIconSize={24}
                transitionDuration={200}
                defaultValue={searchParams.has(filterKey) ? [filterKey] : []}
                classNames={{
                  control: "hover:bg-transparent border-b ",
                  item: "border-none",
                  panel: "py-2",
                }}
              >
                <Accordion.Item value={translation.slug}>
                  <Accordion.Control>
                    <Group align="center" gap={"xs"}>
                      <Text fz={"md"} fw={700}>
                        {translation.name}
                      </Text>
                      {searchParams.get(translation.slug) && (
                        <UnstyledButton
                          fz={"xs"}
                          fw={500}
                          className="hover:underline hover:underline-offset-4"
                          onClick={(e) => {
                            e.stopPropagation();
                            const pageParams = new URLSearchParams(
                              searchParams.toString()
                            );
                            pageParams.delete(translation.slug);
                            replace(`?${pageParams.toString()}`);
                          }}
                        >
                          (Temizle)
                        </UnstyledButton>
                      )}
                    </Group>
                  </Accordion.Control>
                  <Accordion.Panel>
                    <Stack gap={"xs"}>
                      {vg.options.map((option, idx) => {
                        const optionTranslation = option.translations.find(
                          (t) => t.locale === locale
                        );
                        if (!optionTranslation) return null;

                        const currentValues =
                          searchParams.get(filterKey)?.split(",") || [];
                        const isChecked = currentValues.includes(
                          optionTranslation.slug
                        );

                        return (
                          <Group
                            key={idx}
                            gap={"xs"}
                            className="w-full cursor-pointer"
                            align="center"
                            onClick={() =>
                              handleFilterChange(
                                filterKey,
                                optionTranslation.slug,
                                searchParams,
                                replace
                              )
                            }
                          >
                            <Checkbox
                              color="black"
                              radius={"0"}
                              readOnly
                              checked={isChecked}
                            />
                            <Text fz={"md"} fw={600}>
                              {optionTranslation.name}
                            </Text>
                          </Group>
                        );
                      })}
                    </Stack>
                  </Accordion.Panel>
                </Accordion.Item>
              </Accordion>
            );
          })}
        {hasFilters && (
          <Button
            variant="light"
            color="red"
            my={"xs"}
            fz={"md"}
            justify="center"
            rightSection={<IconX size={20} />}
            onClick={() => {
              // Sadece filtreleri temizle, diğer parametreler (örn: sort) kalabilir
              const params = new URLSearchParams(searchParams.toString());
              allFilterKeys.forEach((key) => params.delete(key));
              params.delete("page");
              replace(`?${params.toString()}`);
            }}
          >
            Filtreleri Temizle
          </Button>
        )}
      </>
    </Stack>
  );
};

export default CategoryPageDesktopFiltersSection;
