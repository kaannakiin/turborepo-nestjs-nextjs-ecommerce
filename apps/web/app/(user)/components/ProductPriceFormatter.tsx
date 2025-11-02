"use client";
import { getCurrencyIntlFormat } from "@lib/helpers";
import { Text, TextProps } from "@mantine/core";
import { $Enums, Prisma } from "@repo/database";

interface ProductPriceFormatterProps extends TextProps {
  price: number | Prisma.Decimal;
  currency?: $Enums.Currency;
}

const ProductPriceFormatter = ({
  price,
  currency = "TRY",
  ...props
}: ProductPriceFormatterProps) => {
  if (!price) return null;

  const numericPrice =
    price instanceof Prisma.Decimal
      ? parseFloat(price.toString())
      : typeof price === "number"
        ? price
        : parseFloat(String(price));

  if (isNaN(numericPrice)) return null;

  return (
    <Text {...props}>
      {numericPrice.toLocaleString(getCurrencyIntlFormat(currency), {
        currency: currency,
        style: "currency",
      })}
    </Text>
  );
};

export default ProductPriceFormatter;
