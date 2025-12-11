"use client";

import { getAspectRatioLabel } from "@lib/helpers";
import {
  ColorInput,
  NumberInput,
  Select,
  Switch,
  Textarea,
  TextInput,
} from "@mantine/core";
import { Control, Controller } from "@repo/shared";
import { AspectRatio, ThemeInputType } from "@repo/types";

interface ProductCarouselFormProps {
  control: Control<ThemeInputType>;
  pageIndex: number;
  componentIndex: number;
}

const ProductCarouselConfigForm = ({
  control,
  pageIndex,
  componentIndex,
}: ProductCarouselFormProps) => {
  const prefix = `pages.${pageIndex}.components.${componentIndex}` as const;
  return (
    <>
      <Controller
        control={control}
        name={`${prefix}.title`}
        render={({ field, fieldState }) => (
          <TextInput
            {...field}
            error={fieldState.error?.message}
            label="Başlık"
            placeholder="Bölüm Başlığı"
          />
        )}
      />
      <Controller
        control={control}
        name={`${prefix}.config.titleTextColor`}
        render={({ field: { onChange, ...field } }) => (
          <ColorInput {...field} onChangeEnd={onChange} />
        )}
      />
      <Controller
        control={control}
        name={`${prefix}.description`}
        render={({ field, fieldState }) => (
          <Textarea
            {...field}
            error={fieldState.error?.message}
            minRows={3}
            maxRows={3}
            label="Açıklama"
            placeholder="Bölüm Açıklaması"
          />
        )}
      />
      <Controller
        control={control}
        name={`${prefix}.config.descriptionTextColor`}
        render={({ field: { onChange, ...field } }) => (
          <ColorInput {...field} onChangeEnd={onChange} />
        )}
      />
      <Controller
        control={control}
        name={`${prefix}.config.slidesPerViewDesktop`}
        render={({ field, fieldState }) => (
          <NumberInput
            {...field}
            error={fieldState.error?.message}
            label="Masaüstü (Desktop) Görünümde Gösterilen Slayt Sayısı"
            min={1}
            max={6}
            decimalScale={0}
            allowNegative={false}
          />
        )}
      />
      <Controller
        control={control}
        name={`${prefix}.config.slidesPerViewTablet`}
        render={({ field, fieldState }) => (
          <NumberInput
            {...field}
            error={fieldState.error?.message}
            label="Tablet Görünümde Gösterilen Slayt Sayısı"
            min={1}
            max={4}
            decimalScale={0}
            allowNegative={false}
          />
        )}
      />
      <Controller
        control={control}
        name={`${prefix}.config.slidesPerViewMobile`}
        render={({ field, fieldState }) => (
          <NumberInput
            {...field}
            error={fieldState.error?.message}
            label="Mobil Görünümde Gösterilen Slayt Sayısı"
            min={1}
            max={2}
            decimalScale={0}
            allowNegative={false}
          />
        )}
      />

      <Controller
        control={control}
        name={`${prefix}.config.autoplay`}
        render={({ field: { value, ...field }, fieldState }) => (
          <Switch
            {...field}
            checked={value}
            error={fieldState.error?.message}
            label="Otomatik Oynatmayı Aç"
          />
        )}
      />
      <Controller
        control={control}
        name={`${prefix}.config.autoplaySpeed`}
        render={({ field, fieldState }) => (
          <NumberInput
            {...field}
            error={fieldState.error?.message}
            label="Otomatik Oynatma Hızı (ms)"
            description="Minimum 1000 milisaniye (1 saniye)"
            min={1000}
            decimalScale={0}
            allowNegative={false}
            hideControls
          />
        )}
      />
      <Controller
        control={control}
        name={`${prefix}.config.loop`}
        render={({ field: { value, ...field }, fieldState }) => (
          <Switch
            {...field}
            checked={value}
            error={fieldState.error?.message}
            label="Döngü (Loop) Kullan"
          />
        )}
      />
      <Controller
        control={control}
        name={`${prefix}.config.showArrows`}
        render={({ field: { value, ...field }, fieldState }) => (
          <Switch
            {...field}
            checked={value}
            error={fieldState.error?.message}
            label="Gezinme Oklarını Göster"
          />
        )}
      />
      <Controller
        control={control}
        name={`${prefix}.config.showDots`}
        render={({ field: { value, ...field }, fieldState }) => (
          <Switch
            {...field}
            checked={value}
            error={fieldState.error?.message}
            label="Gezinme Noktalarını (Dots) Göster"
          />
        )}
      />
      <Controller
        control={control}
        name={`${prefix}.config.showAddToCartButton`}
        render={({ field: { value, ...field }, fieldState }) => (
          <Switch
            {...field}
            checked={value}
            error={fieldState.error?.message}
            label="Sepete Ekle Butonunu Göster"
          />
        )}
      />

      <Controller
        control={control}
        name={`${prefix}.config.aspectRatio`}
        render={({ field, fieldState }) => (
          <Select
            {...field}
            label="Görsel Oranı (Aspect Ratio)"
            placeholder="Bir oran seçiniz"
            error={fieldState.error?.message}
            data={Object.values(AspectRatio).map((data) => ({
              value: data,
              label: getAspectRatioLabel(data),
            }))}
          />
        )}
      />
    </>
  );
};

export default ProductCarouselConfigForm;
