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
import { $Enums, CategoryPagePreparePageReturnData } from "@repo/types";
import { IconX } from "@tabler/icons-react";
import { useRouter, useSearchParams } from "next/navigation";

interface CategoryPageFiltersSectionProps {
  allSearchParams: Record<string, string | string[]>;
  variantGroups: CategoryPagePreparePageReturnData["variantGroups"];
  brands: CategoryPagePreparePageReturnData["brands"];
}
const CategoryPageFiltersSection = ({
  allSearchParams,
  brands,
  variantGroups,
}: CategoryPageFiltersSectionProps) => {
  const locale: $Enums.Locale = "TR";
  const { replace } = useRouter();
  const searchParams = useSearchParams();
  const defaultOpenValues = variantGroups
    .map((vg) => {
      const translation = vg.translations.find((t) => t.locale === locale);
      return translation && allSearchParams[translation.slug]
        ? translation.slug
        : null;
    })
    .filter(Boolean) as string[];

  const hasFilters =
    Object.keys(allSearchParams).some((key) =>
      variantGroups.some((vg) =>
        vg.translations.some(
          (t) => t.locale === locale && t.slug === key && allSearchParams[key]
        )
      )
    ) || allSearchParams["brand"];

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
          >
            <Accordion.Item value="brands">
              <Accordion.Control>
                <Group align="center" gap={"xs"}>
                  <Text fz={"md"} fw={700}>
                    Markalar
                  </Text>
                  {allSearchParams["brand"] && (
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
                    const isChecked =
                      allSearchParams["brand"] === translation.slug ||
                      (Array.isArray(allSearchParams["brand"]) &&
                        (allSearchParams["brand"] as string[]).includes(
                          translation.slug
                        ));
                    return (
                      <Group
                        key={idx}
                        gap={"xs"}
                        className="w-full cursor-pointer"
                        align="center"
                        onClick={() => {
                          const pageParams = new URLSearchParams(
                            searchParams.toString()
                          );
                          if (isChecked) {
                            const currentValues = allSearchParams["brand"];
                            if (Array.isArray(currentValues)) {
                              const filteredValues = currentValues.filter(
                                (val) => val !== translation.slug
                              );
                              if (filteredValues.length > 0) {
                                pageParams.set(
                                  "brand",
                                  filteredValues.join(",")
                                );
                              } else {
                                pageParams.delete("brand");
                              }
                            } else {
                              pageParams.delete("brand");
                            }
                          } else {
                            const currentValues = allSearchParams["brand"];
                            if (currentValues) {
                              const existingValues = Array.isArray(
                                currentValues
                              )
                                ? currentValues
                                : [currentValues];
                              pageParams.set(
                                "brand",
                                [...existingValues, translation.slug].join(",")
                              );
                            } else {
                              pageParams.set("brand", translation.slug);
                            }
                          }
                          replace(`?${pageParams.toString()}`);
                        }}
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
            return (
              <Accordion
                key={index}
                defaultValue={defaultOpenValues}
                multiple
                variant="default"
                chevronIconSize={24}
                transitionDuration={200}
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
                      {allSearchParams[translation.slug] && (
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
                        const isChecked =
                          allSearchParams[translation.slug] ===
                            optionTranslation.slug ||
                          (Array.isArray(allSearchParams[translation.slug]) &&
                            (
                              allSearchParams[translation.slug] as string[]
                            ).includes(optionTranslation.slug));

                        return (
                          <Group
                            key={idx}
                            gap={"xs"}
                            className="w-full cursor-pointer"
                            align="center"
                            onClick={() => {
                              const pageParams = new URLSearchParams(
                                searchParams.toString()
                              );

                              if (isChecked) {
                                const currentValues =
                                  allSearchParams[translation.slug];

                                if (Array.isArray(currentValues)) {
                                  const filteredValues = currentValues.filter(
                                    (val) => val !== optionTranslation.slug
                                  );

                                  if (filteredValues.length > 0) {
                                    pageParams.set(
                                      translation.slug,
                                      filteredValues.join(",")
                                    );
                                  } else {
                                    pageParams.delete(translation.slug);
                                  }
                                } else {
                                  pageParams.delete(translation.slug);
                                }
                              } else {
                                const currentValues =
                                  allSearchParams[translation.slug];

                                if (currentValues) {
                                  const existingValues = Array.isArray(
                                    currentValues
                                  )
                                    ? currentValues
                                    : [currentValues];

                                  pageParams.set(
                                    translation.slug,
                                    [
                                      ...existingValues,
                                      optionTranslation.slug,
                                    ].join(",")
                                  );
                                } else {
                                  pageParams.set(
                                    translation.slug,
                                    optionTranslation.slug
                                  );
                                }
                              }

                              replace(`?${pageParams.toString()}`);
                            }}
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
              replace(`?`);
            }}
          >
            Filtreleri Temizle
          </Button>
        )}
      </>
    </Stack>
  );
};

export default CategoryPageFiltersSection;
