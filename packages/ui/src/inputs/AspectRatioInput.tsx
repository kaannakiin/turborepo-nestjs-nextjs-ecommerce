import { Select, SelectProps } from "@mantine/core";
import { AspectRatio } from "@repo/types";
import { getAspectRatioLabel } from "../lib/type-helpers";

export type AspectRatioInputProps = Omit<SelectProps, "data">;

const AspectRatioInput = ({ ...props }: AspectRatioInputProps) => {
  return (
    <Select
      {...props}
      label={props?.label || "Aspect Ratio"}
      allowDeselect={false}
      data={Object.values(AspectRatio).map((aspectRatio) => ({
        value: aspectRatio,
        label: getAspectRatioLabel(aspectRatio),
      }))}
    />
  );
};

export default AspectRatioInput;
