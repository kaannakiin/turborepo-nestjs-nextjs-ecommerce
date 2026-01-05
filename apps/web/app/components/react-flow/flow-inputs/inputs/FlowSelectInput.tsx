import { Select, SelectProps } from "@mantine/core";

type FlowSelectInputProps = Pick<
  SelectProps,
  "data" | "value" | "onChange" | "placeholder" | "disabled" | "label"
>;
const FlowSelectInput = (props: FlowSelectInputProps) => {
  return <Select {...props} />;
};

export default FlowSelectInput;
