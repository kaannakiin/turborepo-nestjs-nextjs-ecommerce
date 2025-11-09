"use client";

import { NumberInput, Switch } from "@mantine/core";
import { Control, Controller } from "@repo/shared";
import { ThemeInputType } from "@repo/types";

interface SliderFormValues {
  control: Control<ThemeInputType>;
  index: number;
}
const SliderForm = ({ control, index }: SliderFormValues) => {
  const pathPrefix = `components.${index}.options` as const;
  return (
    <>
      <Controller
        control={control}
        name={`${pathPrefix}.autoPlay`}
        render={({ field: { value, ...field }, fieldState }) => (
          <Switch
            {...field}
            error={fieldState.error?.message}
            label="Otomatik Oynat"
            checked={value}
          />
        )}
      />
      <Controller
        control={control}
        name={`${pathPrefix}.autoPlayInterval`}
        render={({ field, fieldState }) => (
          <NumberInput
            {...field}
            min={1000}
            max={60000}
            hideControls
            allowDecimal={false}
            label="Otomatik Oynatma Aralığı (ms)"
            error={fieldState.error?.message}
          />
        )}
      />
      <Controller
        control={control}
        name={`${pathPrefix}.loop`}
        render={({ field: { value, ...field }, fieldState }) => (
          <Switch
            {...field}
            error={fieldState.error?.message}
            label="Döngü"
            checked={value}
          />
        )}
      />
      <Controller
        control={control}
        name={`${pathPrefix}.showIndicators`}
        render={({ field: { value, ...field }, fieldState }) => (
          <Switch
            {...field}
            error={fieldState.error?.message}
            label="Göstergeleri Göster"
            checked={value}
          />
        )}
      />
      <Controller
        control={control}
        name={`${pathPrefix}.showArrows`}
        render={({ field: { value, ...field }, fieldState }) => (
          <Switch
            {...field}
            error={fieldState.error?.message}
            label="Okları Göster"
            checked={value}
          />
        )}
      />
    </>
  );
};

export default SliderForm;
