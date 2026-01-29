import { Select, SelectProps } from "@mantine/core";
import { TextAlign } from "@repo/types";
import { getTextAlignLabel } from "../lib/type-helpers";

export type TextAlignSizeInputProps = Omit<SelectProps, "data">;
const MantineTextAlignSizeInput = ({ ...props }: TextAlignSizeInputProps) => {
  return (
    <Select
      {...props}
      data={Object.keys(TextAlign).map((key: TextAlign) => ({
        value: key,
        label: getTextAlignLabel(key),
      }))}
      allowDeselect={false}
    />
  );
};

export default MantineTextAlignSizeInput;
