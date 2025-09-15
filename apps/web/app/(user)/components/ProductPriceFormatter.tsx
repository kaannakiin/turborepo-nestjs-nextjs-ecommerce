"use client";

import { Text, TextProps } from "@mantine/core";
import { getCurrencyIntlFormat } from "../../../lib/helpers";
import { $Enums } from "@repo/types";

interface ProductPriceFormatterProps extends TextProps {
  price: number;
}
const ProductPriceFormatter = ({
  price,
  ...props
}: ProductPriceFormatterProps) => {
  const currency: $Enums.Currency = "TRY";
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
