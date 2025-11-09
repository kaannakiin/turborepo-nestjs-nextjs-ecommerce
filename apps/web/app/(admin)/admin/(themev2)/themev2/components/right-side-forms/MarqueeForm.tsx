"use client";

import { ColorInput } from "@mantine/core";
import { Control, Controller } from "@repo/shared";
import { ThemeInputType } from "@repo/types";

interface MarqueeFormProps {
  control: Control<ThemeInputType>;
  index: number;
}

const MarqueeForm = ({ control, index }: MarqueeFormProps) => {
  return (
    <div>
      <Controller
        control={control}
        name={`components.${index}.backgroundColor`}
        render={({ field }) => <ColorInput />}
      />
    </div>
  );
};

export default MarqueeForm;
