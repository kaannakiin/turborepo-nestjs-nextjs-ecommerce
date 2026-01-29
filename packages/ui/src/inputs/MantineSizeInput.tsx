import { Select, SelectProps } from "@mantine/core";
import { MantineSize } from "@repo/types";
import { getMantineSizeLabel } from "../lib/type-helpers";

export type MantineSizeInputProps = Omit<SelectProps, "data">;

const MantineSizeInput = ({ ...props }: MantineSizeInputProps) => {
  return (
    <Select
      data={Object.keys(MantineSize).map((key) => ({
        value: key,
        label: getMantineSizeLabel(key as MantineSize),
      }))}
      allowDeselect={false}
      {...props}
    />
  );
};

export default MantineSizeInput;
