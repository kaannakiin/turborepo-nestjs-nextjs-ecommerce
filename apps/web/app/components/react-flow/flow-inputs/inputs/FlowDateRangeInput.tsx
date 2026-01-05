import { DatePickerInput, DatePickerInputProps } from "@mantine/dates";

type FlowDateRangeInputProps = Pick<
  DatePickerInputProps<"range">,
  "value" | "onChange" | "label"
>;

const FlowDateRangeInput = (props: FlowDateRangeInputProps) => {
  return <DatePickerInput {...props} type="range" />;
};

export default FlowDateRangeInput;
