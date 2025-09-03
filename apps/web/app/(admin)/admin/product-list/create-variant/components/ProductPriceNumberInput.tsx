"use client";

import { NumberInput, NumberInputProps } from "@mantine/core";

type ProductPriceNumberInputProps = Omit<
  NumberInputProps,
  | "allowNegative"
  | "hideControls"
  | "max"
  | "decimalScale"
  | "thousandSeparator"
  | "decimalSeparator"
>;
const ProductPriceNumberInput = ({
  ...props
}: ProductPriceNumberInputProps) => {
  return (
    <NumberInput
      {...props}
      hideControls
      allowNegative={false}
      max={Number.MAX_SAFE_INTEGER}
      decimalScale={2}
      thousandSeparator="."
      decimalSeparator=","
    />
  );
};

export default ProductPriceNumberInput;
