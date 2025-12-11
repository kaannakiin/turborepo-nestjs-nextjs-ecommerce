"use client";
import { getMantineFontWeightLabel, getMantineSizeLabel } from "@lib/helpers";
import { ColorInput, NumberInput, Select, Switch } from "@mantine/core";
import { Control, Controller } from "@repo/shared";
import { MantineFontWeight, MantineSize, ThemeInputType } from "@repo/types";

interface MarqueeFormProps {
  control: Control<ThemeInputType>;
  pageIndex: number;
  componentIndex: number;
}

const MarqueeForm = ({
  control,
  pageIndex,
  componentIndex,
}: MarqueeFormProps) => {
  const prefix =
    `pages.${pageIndex}.components.${componentIndex}.options` as const;
  return (
    <>
      <Controller
        control={control}
        name={`${prefix}.backgroundColor`}
        render={({ field: { onChange, ...field } }) => (
          <ColorInput
            onChangeEnd={onChange}
            {...field}
            label="Arka Plan Rengi"
          />
        )}
      />
      <Controller
        control={control}
        name={`${prefix}.textColor`}
        render={({ field: { onChange, ...field } }) => (
          <ColorInput onChangeEnd={onChange} {...field} label="Yazı Rengi" />
        )}
      />
      <Controller
        control={control}
        name={`${prefix}.speed`}
        render={({ field, fieldState }) => (
          <NumberInput
            {...field}
            label="Hız"
            description="Kayan yazının hızı (1-100)"
            min={1}
            max={100}
            hideControls
            allowDecimal={false}
            error={fieldState.error?.message}
          />
        )}
      />
      <Controller
        control={control}
        name={`${prefix}.pauseOnHover`}
        render={({ field: { value, ...field } }) => (
          <Switch checked={value} {...field} label="Hover'da Duraklat" />
        )}
      />
      <Controller
        control={control}
        name={`${prefix}.isReverse`}
        render={({ field: { value, ...field } }) => (
          <Switch checked={value} {...field} label="Ters Yön" />
        )}
      />
      <Controller
        control={control}
        name={`${prefix}.fontSize`}
        render={({ field, fieldState }) => (
          <Select
            {...field}
            label="Yazı Boyutu"
            error={fieldState.error?.message}
            data={Object.values(MantineSize).map((size) => ({
              value: size,
              label: getMantineSizeLabel(size),
            }))}
            allowDeselect={false}
          />
        )}
      />
      <Controller
        control={control}
        name={`${prefix}.paddingY`}
        render={({ field, fieldState }) => (
          <Select
            {...field}
            label="Dikey Boşluk"
            error={fieldState.error?.message}
            data={Object.values(MantineSize).map((size) => ({
              value: size,
              label: getMantineSizeLabel(size),
            }))}
            allowDeselect={false}
          />
        )}
      />
      <Controller
        control={control}
        name={`${prefix}.fontWeight`}
        render={({ field, fieldState }) => (
          <Select
            {...field}
            label="Yazı Kalınlığı"
            error={fieldState.error?.message}
            data={Object.values(MantineFontWeight).map((size) => ({
              value: size,
              label: getMantineFontWeightLabel(size),
            }))}
            allowDeselect={false}
          />
        )}
      />
    </>
  );
};

export default MarqueeForm;
