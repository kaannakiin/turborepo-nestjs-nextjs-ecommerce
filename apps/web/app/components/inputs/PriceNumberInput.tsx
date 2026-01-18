'use client';

import { NumberInput, NumberInputProps } from '@mantine/core';

type PriceNumberInputProps = Omit<
  NumberInputProps,
  | 'allowNegative'
  | 'hideControls'
  | 'max'
  | 'decimalScale'
  | 'thousandSeparator'
  | 'decimalSeparator'
>;
const PriceNumberInput = ({ ...props }: PriceNumberInputProps) => {
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

export default PriceNumberInput;
