"use client";

import ProductPriceFormatter from "@/(user)/components/ProductPriceFormatter";
import AddToCartButtonV2 from "@/components/AddToCartButtonV2";
import {
  Accordion,
  Badge,
  Group,
  Stack,
  Title,
  Typography,
} from "@mantine/core";
import { $Enums, GetProductPageReturnType } from "@repo/types";

interface BasicProductRightSectionProps {
  otherDetails: Omit<
    GetProductPageReturnType["data"],
    "variantCombinations" | "variantGroups" | "assets"
  >;
  asset: { url: string; type: $Enums.AssetType } | null;
}
const BasicProductRightSection = ({
  otherDetails,
  asset,
}: BasicProductRightSectionProps) => {
  const translation = otherDetails.translations[0];
  const price = otherDetails.prices[0];

  return (
    <Stack gap={"xl"} className="max-w-xl ">
      <Stack gap={"xs"}>
        <Title order={1} fz={"xl"} tt={"capitalize"}>
          {translation?.name}
        </Title>
        {price &&
        price.discountedPrice &&
        price.discountedPrice < price.price ? (
          <Group gap={"xs"}>
            <Badge radius={0} size="xl" variant="filled" color="primary">
              {`%${Math.round(
                ((price.price - price.discountedPrice) / price.price) * 100
              )}`}
            </Badge>
            <div className="flex-1 flex flex-col">
              <ProductPriceFormatter
                fz={"xs"}
                price={price.discountedPrice}
                className="line-through text-gray-500"
              />
              <ProductPriceFormatter price={price.price} fz={"md"} fw={700} />
            </div>
          </Group>
        ) : (
          <ProductPriceFormatter price={price.price} fz={"md"} fw={700} />
        )}
      </Stack>
      <AddToCartButtonV2
        data={{
          price: price.price,
          productId: otherDetails.id,
          productName: translation.name,
          productSlug: translation.slug,
          quantity: 1,
          whereAdded: "PRODUCT_PAGE",
          discountedPrice: price.discountedPrice || null,
          productAsset: asset || null,
        }}
      />
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

export default BasicProductRightSection;
