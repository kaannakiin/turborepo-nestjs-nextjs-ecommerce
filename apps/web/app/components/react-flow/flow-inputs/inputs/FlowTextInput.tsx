import { TextInput, TextInputProps } from "@mantine/core";

type FlowTextInputProps = Pick<
  TextInputProps,
  "value" | "onChange" | "label" | "leftSection" | "rightSection" | "onBlur"
>;

const FlowTextInput = (props: FlowTextInputProps) => {
  return <TextInput {...props} />;
};

export default FlowTextInput;
