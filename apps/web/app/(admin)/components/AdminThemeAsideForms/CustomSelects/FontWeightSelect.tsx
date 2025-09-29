import { getMantineFontWeightLabel } from "@lib/helpers";
import { Select, SelectProps } from "@mantine/core";
import { MantineFontWeight } from "@repo/types";

const FontWeightSelect = ({ ...props }: Omit<SelectProps, "data">) => {
  return (
    <Select
      {...props}
      label="Yazı Ağırlığı"
      allowDeselect={false}
      data={Object.values(MantineFontWeight).map((weight) => ({
        value: weight,
        label: getMantineFontWeightLabel(weight),
      }))}
    />
  );
};

export default FontWeightSelect;
