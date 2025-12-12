"use client";
import { fontSelectData } from "@lib/helpers";
import { ColorInput, NumberInput, Select } from "@mantine/core";
import { Control, Controller } from "@repo/shared";
import { ThemeInputType } from "@repo/types";

interface ThemeSettingsComponentProps {
  control: Control<ThemeInputType>;
}

const ThemeSettingsComponent = ({ control }: ThemeSettingsComponentProps) => {
  const prefix = `settings` as const;

  return (
    <>
      <Controller
        control={control}
        name={`${prefix}.primaryColor`}
        render={({ field: { onChange, ...field } }) => (
          <ColorInput
            {...field}
            label="Ana Renk"
            onChangeEnd={onChange}
            format="hex"
            size="sm"
          />
        )}
      />
      <Controller
        control={control}
        name={`${prefix}.secondaryColor`}
        render={({ field: { onChange, ...field } }) => (
          <ColorInput
            {...field}
            label="İkincil Renk"
            onChangeEnd={onChange}
            format="hex"
            size="sm"
          />
        )}
      />
      <Controller
        control={control}
        name={`${prefix}.primaryShade`}
        render={({ field, fieldState }) => (
          <NumberInput
            label="Primary Shade"
            min={0}
            max={9}
            allowDecimal={false}
            {...field}
            error={fieldState.error?.message}
          />
        )}
      />
      <Controller
        control={control}
        name={`${prefix}.font`}
        render={({ field, fieldState }) => (
          <Select
            label="Font"
            allowDeselect={false}
            {...field}
            error={fieldState.error?.message}
            data={fontSelectData}
          />
        )}
      />
    </>
  );
};

export default ThemeSettingsComponent;
