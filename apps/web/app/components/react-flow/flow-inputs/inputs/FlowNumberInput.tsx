import { NumberInput, NumberInputProps } from "@mantine/core";

type FlowNumberInputProps = Pick<
  NumberInputProps,
  "value" | "onChange" | "label" | "min" | "max"
>;

const FlowNumberInput = (props: FlowNumberInputProps) => {
  return <NumberInput hideControls {...props} />;
};

export default FlowNumberInput;
