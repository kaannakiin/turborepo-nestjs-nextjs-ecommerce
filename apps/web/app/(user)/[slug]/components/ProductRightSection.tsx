"use client";

import ProductPriceFormatter from "@/(user)/components/ProductPriceFormatter";
import AddToCartButtonV2 from "@/components/AddToCartButtonV2";
import {
  Accordion,
  Avatar,
  Badge,
  Button,
  ColorSwatch,
  Group,
  Select,
  Stack,
  Title,
  Typography,
  UnstyledButton,
  rem,
} from "@mantine/core";
import { $Enums } from "@repo/database/client";
import { GetProductPageReturnType } from "@repo/types";
import { Route } from "next";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";

interface ProductRightSectionProps {
  selectedVariant:
    | GetProductPageReturnType["data"]["variantCombinations"][0]
    | null;
  variantGroups: GetProductPageReturnType["data"]["variantGroups"];
  otherDetails: Omit<
    GetProductPageReturnType["data"],
    "variantCombinations" | "variantGroups" | "assets"
  >;
  firstAsset: { url: string; type: $Enums.AssetType } | null;

  availableCombinations: GetProductPageReturnType["data"]["variantCombinations"];
  selectedOptionIdsFromUrl: Set<string>;
}

const ProductRightSection = ({
  selectedVariant,
  variantGroups,
  otherDetails,
  firstAsset,
  availableCombinations,
  selectedOptionIdsFromUrl,
}: ProductRightSectionProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const selectedOptionIdsForActive = useMemo(() => {
    if (!selectedVariant) return new Set();
    return new Set(
      selectedVariant.options.map(
        (opt) => opt.productVariantOption.variantOption.id
      )
    );
  }, [selectedVariant]);

  const handleOptionClick = (groupSlug: string, optionSlug: string) => {
    const currentParams = new URLSearchParams(
      Array.from(searchParams.entries())
    );
    currentParams.set(groupSlug, optionSlug);
    router.replace(`?${currentParams.toString()}` as Route, { scroll: false });
  };

  const optionToGroupMap = useMemo(() => {
    const map = new Map<string, string>();
    variantGroups?.forEach((group) => {
      const groupId = group.variantGroup.id;
      group.options.forEach((opt) => {
        map.set(opt.variantOption.id, groupId);
      });
    });
    return map;
  }, [variantGroups]);

  const isOptionDisabled = (
    optionIdToCheck: string,
    groupIdOfOption: string
  ): boolean => {
    const otherSelectedIds = new Set<string>();
    selectedOptionIdsFromUrl.forEach((selectedId) => {
      const groupIdOfSelected = optionToGroupMap.get(selectedId);
      if (groupIdOfSelected && groupIdOfSelected !== groupIdOfOption) {
        otherSelectedIds.add(selectedId);
      }
    });

    if (otherSelectedIds.size === 0) {
      return false;
    }

    const hasValidCombination = availableCombinations.some((combo) => {
      const comboOptionIds = new Set(
        combo.options.map((opt) => opt.productVariantOption.variantOption.id)
      );

      if (!comboOptionIds.has(optionIdToCheck)) {
        return false;
      }

      for (const otherId of otherSelectedIds) {
        if (!comboOptionIds.has(otherId)) {
          return false;
        }
      }

      return true;
    });

    return !hasValidCombination;
  };

  if (!otherDetails || !selectedVariant) {
    return null;
  }
  const translation = otherDetails.translations[0];
  if (!translation) {
    return null;
  }
  const variantPrice = selectedVariant.prices[0];
  if (!variantPrice) {
    return null;
  }
  return (
    <Stack gap={"xl"} className="max-w-xl ">
      <Stack gap={"xs"}>
        <Title order={1} fz={"xl"} tt={"capitalize"}>
          {translation?.name}
        </Title>

        {variantPrice &&
        variantPrice.discountedPrice &&
        variantPrice.discountedPrice < variantPrice.price ? (
          <Group gap={"xs"}>
            <Badge radius={0} size="xl" variant="filled" color="primary">
              {`%${Math.round(
                ((variantPrice.price - variantPrice.discountedPrice) /
                  variantPrice.price) *
                  100
              )}`}
            </Badge>
            <div className="flex-1 flex flex-col">
              <ProductPriceFormatter
                fz={"md"}
                fw={700}
                price={variantPrice.price}
              />
              <ProductPriceFormatter
                price={variantPrice.discountedPrice}
                fz={"xs"}
                className="line-through text-gray-500"
              />
            </div>
          </Group>
        ) : (
          <ProductPriceFormatter
            price={variantPrice.price}
            fz={"md"}
            fw={700}
          />
        )}
      </Stack>

      {variantGroups && variantGroups.length > 0 && (
        <Stack gap={"xl"}>
          {variantGroups.map((group) => {
            const groupTranslation = group.variantGroup.translations.find(
              (t) => t.locale === "TR"
            );
            if (!groupTranslation) return null;

            const groupType = group.variantGroup.type;

            return (
              <Stack gap={"xs"} key={group.id}>
                <Title fz={"md"} fw={700} tt={"capitalize"}>
                  {groupTranslation.name}
                </Title>
                {group.renderVisibleType === "DROPDOWN" ? (
                  (() => {
                    const selectData = group.options
                      .sort((a, b) => a.order - b.order)
                      .map((option) => {
                        const optionTranslation =
                          option.variantOption.translations.find(
                            (t) => t.locale === "TR"
                          );
                        if (!optionTranslation) return null;

                        const optionId = option.variantOption.id;

                        return {
                          value: optionTranslation.slug,
                          label: optionTranslation.name,
                          disabled: isOptionDisabled(
                            optionId,
                            group.variantGroup.id
                          ),
                        };
                      })
                      .filter(Boolean) as {
                      value: string;
                      label: string;
                      disabled: boolean;
                    }[];

                    const selectedOptionSlug = searchParams.get(
                      groupTranslation.slug
                    );

                    return (
                      <Select
                        data={selectData}
                        value={selectedOptionSlug}
                        onChange={(newOptionSlug) => {
                          if (newOptionSlug) {
                            handleOptionClick(
                              groupTranslation.slug,
                              newOptionSlug
                            );
                          }
                        }}
                        radius="0"
                        placeholder={`${groupTranslation.name} seçin`}
                      />
                    );
                  })()
                ) : (
                  <Group gap={"sm"} wrap="wrap">
                    {group.options.map((option) => {
                      const optionTranslation =
                        option.variantOption.translations.find(
                          (t) => t.locale === "TR"
                        );
                      if (!optionTranslation) return null;

                      const optionId = option.variantOption.id;
                      const isSelected =
                        selectedOptionIdsForActive.has(optionId);

                      const isDisabled = isOptionDisabled(
                        optionId,
                        group.variantGroup.id
                      );

                      if (groupType === "LIST") {
                        return (
                          <Button
                            key={optionId}
                            variant={isSelected ? "filled" : "outline"}
                            radius="0"
                            onClick={() =>
                              handleOptionClick(
                                groupTranslation.slug,
                                optionTranslation.slug
                              )
                            }
                            disabled={isDisabled}
                          >
                            {optionTranslation.name}
                          </Button>
                        );
                      }

                      if (groupType === "COLOR") {
                        const { asset, hexValue } = option.variantOption;
                        return (
                          <UnstyledButton
                            key={optionId}
                            onClick={() =>
                              handleOptionClick(
                                groupTranslation.slug,
                                optionTranslation.slug
                              )
                            }
                            disabled={isDisabled}
                            style={{
                              borderRadius: "50%",
                              padding: rem(3),
                              border: isSelected
                                ? `2px solid var(--mantine-primary-color-6)`
                                : "2px solid transparent",
                              transition: "border-color 150ms ease",
                              opacity: isDisabled ? 0.4 : 1,
                              cursor: isDisabled ? "not-allowed" : "pointer",
                            }}
                            aria-label={optionTranslation.name}
                          >
                            {asset ? (
                              <Avatar src={asset.url} size="md" />
                            ) : (
                              <ColorSwatch
                                color={hexValue || "#FFF"}
                                size={rem(32)}
                              />
                            )}
                          </UnstyledButton>
                        );
                      }

                      return (
                        <Badge
                          key={optionId}
                          variant={isSelected ? "filled" : "outline"}
                        >
                          {optionTranslation.name}
                        </Badge>
                      );
                    })}
                  </Group>
                )}
              </Stack>
            );
          })}

          {/* Sepet Butonu (Değişiklik yok) */}
          <AddToCartButtonV2
            data={{
              price: variantPrice.price,
              productId: otherDetails.id,
              productName: translation.name,
              productSlug: translation.slug,
              quantity: 1,
              whereAdded: "PRODUCT_PAGE",
              categories: otherDetails.categories.map((cat) => ({
                categorySlug: cat.category.id,
                categoryId: cat.category.id,
                name: cat.category.translations[0]?.name || "",
              })),
              discountedPrice: variantPrice.discountedPrice,
              productAsset: firstAsset,
              variantId: selectedVariant.id,
            }}
          />
        </Stack>
      )}

      {translation?.description &&
        translation.description.length > 0 &&
        translation.description !== "<p></p>" && (
          <Accordion variant="contained">
            <Accordion.Item value="description">
              <Accordion.Control>Ürün Açıklaması</Accordion.Control>
              <Accordion.Panel>
                <Typography>
                  <div
                    dangerouslySetInnerHTML={{
                      __html: translation.description,
                    }}
                  />
                </Typography>
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion>
        )}
    </Stack>
  );
};

export default ProductRightSection;
