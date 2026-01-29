import { Select, SelectProps } from "@mantine/core";
import { MantineFontWeight } from "@repo/types";
import { getMantineFontWeightLabel } from "../lib/type-helpers";

type MantineFontWeightInputProps = Omit<SelectProps, "data">;
const MantineFontWeightInput = ({ ...props }: MantineFontWeightInputProps) => {
  return (
    <Select
      {...props}
      data={Object.keys(MantineFontWeight).map((key: MantineFontWeight) => ({
        value: key,
        label: getMantineFontWeightLabel(key),
      }))}
      allowDeselect={false}
    />
  );
};

export default MantineFontWeightInput;
