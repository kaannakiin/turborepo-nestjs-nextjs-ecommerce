"use client";

import { getMantineSizeLabel } from "@lib/helpers";
import { Select, SelectProps } from "@mantine/core";
import { MantineSize } from "@repo/types";

const FontSizeSelect = ({ ...props }: Omit<SelectProps, "data">) => {
  return (
    <Select
      {...props}
      label={props.label || "Yazı Boyutu"}
      allowDeselect={props.allowDeselect || false}
      data={Object.values(MantineSize).map((size) => ({
        value: size,
        label: getMantineSizeLabel(size),
      }))}
    />
  );
};

export default FontSizeSelect;
