"use client";

import { getAspectRatioLabel } from "@lib/helpers";
import { NumberInput, Select, Switch } from "@mantine/core";
import { Control, Controller } from "@repo/shared";
import { AspectRatio, ThemeInputType } from "@repo/types";

interface SliderFormValues {
  control: Control<ThemeInputType>;
  pageIndex: number;
  componentIndex: number;
}
const AsideSliderForm = ({
  control,
  pageIndex,
  componentIndex,
}: SliderFormValues) => {
  const pathPrefix =
    `pages.${pageIndex}.components.${componentIndex}.options` as const;
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
      <Controller
        control={control}
        name={`${pathPrefix}.aspectRatio`}
        render={({ field, fieldState }) => (
          <Select
            {...field}
            label="Aspect Ratio"
            error={fieldState.error?.message}
            data={Object.values(AspectRatio).map((key) => ({
              value: key,
              label: getAspectRatioLabel(key),
            }))}
            allowDeselect={false}
          />
        )}
      />
      <Controller
        control={control}
        name={`${pathPrefix}.mobileAspectRatio`}
        render={({ field, fieldState }) => (
          <Select
            {...field}
            label="Mobil Aspect Ratio"
            error={fieldState.error?.message}
            data={Object.values(AspectRatio).map((key) => ({
              value: key,
              label: getAspectRatioLabel(key),
            }))}
            allowDeselect={false}
          />
        )}
      />
    </>
  );
};

export default AsideSliderForm;
