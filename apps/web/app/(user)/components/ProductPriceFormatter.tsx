"use client";

import { getCurrencyIntlFormat } from "@lib/helpers";
import { Text, TextProps } from "@mantine/core";
import { $Enums } from "@repo/database";

interface ProductPriceFormatterProps extends TextProps {
  price: number;
  currency?: $Enums.Currency;
}
const ProductPriceFormatter = ({
  price,
  currency = "TRY",
  ...props
}: ProductPriceFormatterProps) => {
  if (!price) return null;
  return (
    <Text {...props}>
      {price.toLocaleString(getCurrencyIntlFormat(currency), {
        currency: currency,
        style: "currency",
      })}
    </Text>
  );
};

export default ProductPriceFormatter;
