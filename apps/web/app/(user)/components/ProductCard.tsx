"use client";

import { AspectRatio, Card, Stack, Text, Title } from "@mantine/core";
import { useHover } from "@mantine/hooks";
import { ProductPageDataType } from "@repo/types";
import { useRouter } from "next/navigation";
import { buildVariantOrProductUrl } from "../../../lib/helpers";
import CustomImage from "../../components/CustomImage";
import PriceFormatter from "./PriceFormatter";
import { Locale, Currency, AssetType } from "@repo/database/client";
import { Route } from "next";

const ProductCard = ({ product }: { product: ProductPageDataType }) => {
  const { hovered, ref } = useHover();
  const locale: Locale = "TR";
  const currency: Currency = "TRY";
  const { push } = useRouter();
  const productTranslation =
    product.translations.find((tr) => tr.locale === locale) ||
    product.translations[0];

  // const prices = product.isVariant
  //   ? product.variantCombinations?.[0]?.prices?.find(
  //       (p) => p.currency === currency
  //     ) || product.variantCombinations?.[0]?.prices?.[0]
  //   : product.prices?.find((p) => p.currency === currency) ||
  //     product.prices?.[0];

  const brandTranslation =
    product.brand?.translations.find((tr) => tr.locale === locale) || null;

  const getImages = () => {
    let assetList: {
      url: string;
      type: AssetType;
    }[] = [];

    // if (product.isVariant && product.variantCombinations?.length > 0) {
    //   const variantAssets =
    //     product.variantCombinations[0]?.assets.map((as) => ({
    //       url: as.asset.url,
    //       type: as.asset.type,
    //     })) || [];
    //   assetList = [...variantAssets];
    // }

    if (assetList.length < 2) {
      const productAssets =
        product.assets.map((as) => ({
          url: as.asset.url,
          type: as.asset.type,
        })) || [];
      assetList = [...assetList, ...productAssets];
    }

    return {
      firstImage: assetList[0] || null,
      secondImage: assetList[1] || null,
    };
  };

  const { firstImage: first, secondImage: second } = getImages();

  // const url =
  //   buildVariantOrProductUrl(
  //     product.translations,
  //     product.isVariant ? product.variantCombinations?.[0]?.options : undefined,
  //     locale
  //   ) || "#";

  return (
    <Card
      className="bg-transparent cursor-pointer"
      // onClick={() => push(url as Route)}
    >
      <Card.Section inheritPadding>
        {(first || second) && (
          <AspectRatio
            ratio={1}
            className="w-full h-full"
            pos={"relative"}
            ref={ref}
          >
            {!hovered ? (
              <CustomImage
                className="rounded-md"
                src={first?.url}
                alt={`${first.url} - image`}
              />
            ) : (
              <CustomImage
                src={second?.url || first?.url}
                className="rounded-md"
                alt={`${second?.url || first?.url} - image`}
              />
            )}
          </AspectRatio>
        )}
      </Card.Section>
      <Stack gap={"2px"} my={"xs"}>
        <Title order={5}>{productTranslation.name}</Title>
        {brandTranslation && (
          <Text fw={500} fz={"md"} tt={"capitalize"} c={"primary.9"}>
            {brandTranslation.name}
          </Text>
        )}
        {/* {prices.discountedPrice ? (
          <div className="flex flex-row gap-2 items-center">
            <PriceFormatter
              c={"dimmed"}
              price={prices.price}
              td={"line-through"}
              fz={"md"}
              fw={500}
            />
            <PriceFormatter price={prices.discountedPrice} fz={"md"} fw={700} />
          </div>
        ) : (
          <PriceFormatter price={prices.price} />
        )} */}
      </Stack>
    </Card>
  );
};

export default ProductCard;
