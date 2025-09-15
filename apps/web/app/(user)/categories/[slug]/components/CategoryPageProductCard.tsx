"use client";
import { AspectRatio, Card, Group, Indicator, Text } from "@mantine/core";
import { useHover } from "@mantine/hooks";
import { $Enums, CategoryPageProductsReturnType } from "@repo/types";
import { useRouter } from "next/navigation";
import CustomImage from "../../../../components/CustomImage";
import ProductPriceFormatter from "../../../components/ProductPriceFormatter";

interface CategoryPageProductCardProps {
  product: CategoryPageProductsReturnType["products"][number];
  locale?: $Enums.Locale;
  currency?: $Enums.Currency;
}

const CategoryPageProductCard = ({
  product,
  locale,
  currency,
}: CategoryPageProductCardProps) => {
  const { hovered, ref } = useHover();

  const {
    firstAsset,
    productBrand,
    productId,
    productPrices,
    productSlug,
    productStock,
    productTranslation,
    secondAsset,
    combinationInfo,
  } = product;

  const getDisplayImage = () => {
    if (combinationInfo) {
      const variantFirstAsset = combinationInfo.variantFirstAsset?.asset;
      const variantSecondAsset = combinationInfo.variantSecondAsset?.asset;

      if (hovered) {
        return (
          variantSecondAsset ||
          variantFirstAsset ||
          secondAsset?.asset ||
          firstAsset?.asset
        );
      } else {
        return variantFirstAsset || firstAsset?.asset;
      }
    }

    const primaryAsset = hovered
      ? secondAsset?.asset || firstAsset?.asset
      : firstAsset?.asset;
    return primaryAsset;
  };

  const getPrice = (): {
    discountedPrice: number | null;
    basePrice: number;
  } | null => {
    if (combinationInfo) {
      if (!combinationInfo.variantPrices.length) return null;

      const variantPriceObj =
        combinationInfo.variantPrices.find(
          (price) => price.currency === currency
        ) || combinationInfo.variantPrices[0];

      if (!variantPriceObj) return null;

      return {
        discountedPrice: variantPriceObj.discountedPrice || null,
        basePrice: variantPriceObj.price,
      };
    }

    if (!productPrices || !productPrices.length) return null;

    const priceObj =
      productPrices.find((price) => price.currency === currency) ||
      productPrices[0];

    if (!priceObj) return null;

    return {
      discountedPrice: priceObj.discountedPrice || null,
      basePrice: priceObj.price,
    };
  };

  const getProductBrandTranslation = () => {
    return (
      productBrand?.translations.find((tr) => tr.locale === locale) ||
      productBrand?.translations[0] ||
      null
    );
  };

  const getProductTranslation = () => {
    return (
      productTranslation.find((tr) => tr.locale === locale) ||
      productTranslation[0] ||
      null
    );
  };

  const getVariantOptionName = () => {
    if (!combinationInfo?.variantGroups?.[0]?.options) return null;

    const variantOption = combinationInfo.variantGroups[0].options;
    const optionTranslation =
      variantOption.translations?.find((tr) => tr.locale === locale) ||
      variantOption.translations?.[0];

    return optionTranslation?.name || null;
  };

  const displayImage = getDisplayImage();
  const priceData = getPrice();
  const { discountedPrice, basePrice } = priceData || {
    discountedPrice: null,
    basePrice: 0,
  };

  const calculateDiscountPercentage = () => {
    if (!discountedPrice || !basePrice) return null;
    return Math.round(((basePrice - discountedPrice) / basePrice) * 100);
  };

  const discountPercentage = calculateDiscountPercentage();
  const { push } = useRouter();
  return (
    <Indicator
      inline
      onClick={() => push(`/${productSlug}`)}
      size={24}
      radius={0}
      label={discountPercentage ? `%${discountPercentage}` : ""}
      disabled={!discountPercentage}
      position="top-start"
      offset={16}
    >
      <Card p={0} pos={"relative"}>
        <Card.Section ref={ref} pos="relative">
          <AspectRatio ratio={1}>
            {displayImage ? (
              <CustomImage
                src={displayImage.url}
                className="rounded-none"
                alt="product-image"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <Text c="dimmed" size="sm">
                  Görsel Yok
                </Text>
              </div>
            )}
          </AspectRatio>
        </Card.Section>

        <div className="flex flex-col gap-[2px] p-2">
          {productBrand && (
            <Text tt="capitalize" fz="md" fw={700}>
              {getProductBrandTranslation()?.name || "Marka Yok"}
            </Text>
          )}

          <Group gap="xs" wrap="wrap" align="flex-end">
            <Text tt="capitalize" fz="sm" c="gray.7" fw={600}>
              {getProductTranslation()?.name || "Ürün Adı Yok"}
            </Text>

            {combinationInfo && getVariantOptionName() && (
              <Text fz="sm" c="gray.5" fw={500}>
                {getVariantOptionName()}
              </Text>
            )}
          </Group>

          <div className="flex flex-col gap-[2px]">
            {discountedPrice ? (
              <>
                <ProductPriceFormatter
                  price={basePrice}
                  fz="xs"
                  c="dimmed"
                  fw={500}
                  style={{ textDecoration: "line-through" }}
                />
                <ProductPriceFormatter
                  fz="sm"
                  fw={700}
                  price={discountedPrice}
                />
              </>
            ) : (
              <ProductPriceFormatter price={basePrice} fz="sm" fw={700} />
            )}
          </div>
        </div>
      </Card>
    </Indicator>
  );
};

export default CategoryPageProductCard;
