import { ColorInput, ColorInputProps } from "@mantine/core";

export type ColorPickerInputProps = Omit<ColorInputProps, "onChangeEnd">;

const ColorPickerInput = ({ onChange, ...props }: ColorPickerInputProps) => {
  return <ColorInput {...props} onChangeEnd={onChange} />;
};

export default ColorPickerInput;
