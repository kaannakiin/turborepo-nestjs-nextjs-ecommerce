"use client";
import ProductPriceFormatter from "@/(user)/components/ProductPriceFormatter";
import AddToCartButtonV2 from "@/components/AddToCartButtonV2";
import { calculateDiscountRate } from "@lib/helpers";
import {
  Accordion,
  AspectRatio,
  Badge,
  ColorSwatch,
  Group,
  Stack,
  Text,
  Title,
  Tooltip,
  Typography,
} from "@mantine/core";
import { slugify } from "@repo/shared";
import { $Enums, ProductPageDataType } from "@repo/types";
import { useRouter, useSearchParams } from "next/navigation";
import CustomImage from "../../../components/CustomImage";

interface ProductRightSectionProps {
  productId: string;
  groups: ProductPageDataType["variantGroups"];
  selectedVariant: ProductPageDataType["variantCombinations"][number];
  selectedVariantPrice:
    | ProductPageDataType["variantCombinations"][number]["prices"][number]
    | null;
  productTranslation: ProductPageDataType["translations"][number];
  selectedVariantTranslation:
    | ProductPageDataType["variantCombinations"][number]["translations"][number]
    | null;
}

const ProductRightSection = ({
  groups,
  selectedVariant,
  selectedVariantPrice,
  productId,
  productTranslation,
  selectedVariantTranslation,
}: ProductRightSectionProps) => {
  const locale: $Enums.Locale = "TR";

  const selectedOptionIds = selectedVariant.options.map(
    (option) => option.productVariantOptionId
  );

  const searchParams = useSearchParams();
  const { replace } = useRouter();

  const isOptionSelected = (optionId: string) => {
    return selectedOptionIds.includes(optionId);
  };

  const onClick = (
    group: ProductPageDataType["variantGroups"][number],
    option: ProductPageDataType["variantGroups"][number]["options"][number]
  ) => {
    const groupTranslation = group.variantGroup.translations.find(
      (tr) => tr.locale === locale
    )!;
    const optionTranslation = option.variantOption.translations.find(
      (tr) => tr.locale === locale
    )!;

    const paramKey = groupTranslation.slug || slugify(groupTranslation.name);
    const paramValue =
      optionTranslation.slug || slugify(optionTranslation.name);

    const newSearchParams = new URLSearchParams(searchParams.toString());

    const isSelected = isOptionSelected(option.id);

    if (isSelected) {
      // Eğer zaten seçiliyse, parametreyi kaldır
      newSearchParams.delete(paramKey);
    } else {
      // Seçili değilse, bu option'ı seç
      newSearchParams.set(paramKey, paramValue);
    }

    const queryString = newSearchParams.toString();
    replace(`?${queryString}`, { scroll: false });
  };

  return (
    <Stack gap={"lg"}>
      <Title order={1} tt={"capitalize"}>
        {productTranslation.name}
      </Title>
      {selectedVariantPrice && (
        <Group gap={"lg"}>
          {selectedVariantPrice.discountedPrice ? (
            <>
              <Badge
                variant="filled"
                radius={0}
                py={"lg"}
                size="lg"
                color={"red.7"}
              >
                <Text fw={700}>
                  {calculateDiscountRate(
                    selectedVariantPrice.price,
                    selectedVariantPrice.discountedPrice
                  )}
                </Text>
              </Badge>
              <Stack gap={"1px"}>
                <ProductPriceFormatter
                  price={selectedVariantPrice.price}
                  fz={"sm"}
                  fw={700}
                  c={"dimmed"}
                />
                <ProductPriceFormatter
                  price={selectedVariantPrice.discountedPrice}
                  fw={700}
                  fz={"xl"}
                />
              </Stack>
            </>
          ) : (
            <ProductPriceFormatter
              price={selectedVariantPrice.price}
              fw={700}
              fz={"xl"}
            />
          )}
        </Group>
      )}
      {groups.map((group) => {
        const groupTranslation =
          group.variantGroup.translations.find((tr) => tr.locale === locale) ||
          group.variantGroup.translations[0];

        return (
          <div key={group.id}>
            <Title order={5} tt={"capitalize"} mb="sm">
              {groupTranslation.name}
            </Title>
            <Group gap={"sm"} align="center">
              {group.options.map((option) => {
                const optionTranslation =
                  option.variantOption.translations.find(
                    (tr) => tr.locale === locale
                  ) || option.variantOption.translations[0];

                const isAssetExists =
                  option.variantOption.asset && option.variantOption.asset.url;

                const isSelected = isOptionSelected(option.id);

                if (group.variantGroup.type === "COLOR") {
                  if (isAssetExists) {
                    return (
                      <Tooltip
                        key={option.id}
                        label={optionTranslation.name}
                        position="top"
                        withArrow
                      >
                        <div
                          className={`cursor-pointer p-[1px] rounded-md ${
                            isSelected
                              ? "ring-2 ring-[var(--mantine-primary-color-5)]"
                              : ""
                          }`}
                          onClick={() => onClick(group, option)}
                        >
                          <AspectRatio
                            ratio={1}
                            style={{ width: 48, height: 48 }}
                          >
                            <CustomImage
                              src={option.variantOption.asset.url}
                              alt={optionTranslation.name}
                              className="rounded-md"
                            />
                          </AspectRatio>
                        </div>
                      </Tooltip>
                    );
                  } else if (option.variantOption.hexValue) {
                    // Asset yoksa hexValue ile ColorSwatch render et
                    return (
                      <Tooltip
                        key={option.id}
                        label={optionTranslation.name}
                        position="top"
                        withArrow
                      >
                        <div
                          className={`cursor-pointer p-[1px] rounded-full ${
                            isSelected
                              ? "ring-2 ring-[var(--mantine-primary-color-5)]"
                              : ""
                          }`}
                          onClick={() => onClick(group, option)}
                        >
                          <ColorSwatch
                            color={option.variantOption.hexValue}
                            size={48}
                          />
                        </div>
                      </Tooltip>
                    );
                  } else {
                    // Ne asset ne hexValue varsa fallback olarak badge
                    return (
                      <Badge
                        key={option.id}
                        onClick={() => onClick(group, option)}
                        variant={isSelected ? "filled" : "outline"}
                        size="md"
                        className="cursor-pointer"
                      >
                        {optionTranslation.name}
                      </Badge>
                    );
                  }
                } else {
                  return (
                    <Badge
                      key={option.id}
                      variant={isSelected ? "filled" : "outline"}
                      className="cursor-pointer"
                      size="xl"
                      py={"lg"}
                      onClick={() => onClick(group, option)}
                      radius={"sm"}
                    >
                      {optionTranslation.name}
                    </Badge>
                  );
                }
              })}
            </Group>
          </div>
        );
      })}
      <AddToCartButtonV2
        data={{
          price: selectedVariant.prices[0].price,
          productId: selectedVariant.productId,
          productName: productTranslation.name,
          productSlug: productTranslation.slug,
          quantity: 1,
          whereAdded: "PRODUCT_PAGE",
          categories: undefined,
          discountedPrice: selectedVariant.prices[0].discountedPrice,
          variantId: selectedVariant.id,
          productAsset: selectedVariant.assets[0]?.asset || null,
          variantOptions: selectedVariant.options.map((option) => {
            return {
              variantGroupName:
                option.productVariantOption.variantOption.variantGroup.translations.find(
                  (tr) => tr.locale === locale
                )?.name || "",
              variantGroupSlug:
                option.productVariantOption.variantOption.variantGroup.translations.find(
                  (tr) => tr.locale === locale
                )?.slug || "",
              optionName:
                option.productVariantOption.variantOption.translations.find(
                  (tr) => tr.locale === locale
                )?.name || "",
              optionSlug:
                option.productVariantOption.variantOption.translations.find(
                  (tr) => tr.locale === locale
                )?.slug || "",
              optionId: option.productVariantOptionId,
              variantOptionName:
                option.productVariantOption.variantOption.translations.find(
                  (tr) => tr.locale === locale
                )?.name || "",
              variantOptionAsset:
                option.productVariantOption.variantOption.asset || null,
              variantOptionHex:
                option.productVariantOption.variantOption.hexValue || null,
              variantOptionSlug:
                option.productVariantOption.variantOption.translations.find(
                  (tr) => tr.locale === locale
                )?.slug || "",
              variantOptionHexValue:
                option.productVariantOption.variantOption.hexValue || null,
            };
          }),
        }}
      />

      {(selectedVariantTranslation.description ||
        productTranslation.description) &&
        productTranslation.description !== "<p></p>" && (
          <Accordion
            mt="md"
            color="dimmed"
            defaultValue="description"
            variant="separated"
          >
            <Accordion.Item value="description">
              <Accordion.Control>
                <Title order={4}>Ürün Açıklaması</Title>
              </Accordion.Control>
              <Accordion.Panel>
                <Typography>
                  <div
                    dangerouslySetInnerHTML={{
                      __html:
                        selectedVariantTranslation?.description ||
                        productTranslation.description ||
                        "",
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
