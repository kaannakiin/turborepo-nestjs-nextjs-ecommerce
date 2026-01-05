import { DateInputProps, DatePickerInput } from "@mantine/dates";

type FlowDateInputProps = Pick<DateInputProps, "value" | "onChange" | "label">;
const FlowDateInput = (props: FlowDateInputProps) => {
  return <DatePickerInput {...props} type="default" />;
};

export default FlowDateInput;
