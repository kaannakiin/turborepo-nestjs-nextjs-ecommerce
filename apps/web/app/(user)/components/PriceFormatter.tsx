"use client";
import { getCurrencyIntlFormat } from "@lib/helpers";
import { Text, TextProps } from "@mantine/core";
import { Prisma, Currency } from "@repo/database/client";

interface PriceFormatterProps extends TextProps {
  price: number | InstanceType<typeof Prisma.Decimal>;
  currency?: Currency;
}

const PriceFormatter = ({
  price,
  currency = "TRY",
  ...props
}: PriceFormatterProps) => {
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

export default PriceFormatter;
