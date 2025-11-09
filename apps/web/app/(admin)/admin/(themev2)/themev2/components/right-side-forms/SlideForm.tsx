"use client";
import GlobalDropzone from "@/components/GlobalDropzone";
import { getAspectRatioLabel } from "@lib/helpers";
import { InputLabel, Select } from "@mantine/core";
import { Control, Controller, useWatch } from "@repo/shared";
import { AspectRatio, ThemeInputType } from "@repo/types";

interface SlideFormProps {
  control: Control<ThemeInputType>;
  componentIndex: number;
  slideIndex: number;
}

const SlideForm = ({ control, componentIndex, slideIndex }: SlideFormProps) => {
  const prefix = `components.${componentIndex}.sliders.${slideIndex}` as const;
  const data = useWatch({ control, name: prefix });

  return (
    <>
      <Controller
        control={control}
        name={`${prefix}.desktopView.file`}
        render={({ field, fieldState }) => (
          <div className="flex flex-col gap-1">
            <InputLabel>Desktop Görünümü</InputLabel>
            <GlobalDropzone
              {...field}
              multiple={false}
              maxSize={5 * 1024 * 1024}
              maxFiles={data?.desktopView?.existingAsset ? 0 : 1}
              onDrop={(files) => {
                if (!files.length) return;
                field.onChange(files[0]);
              }}
              accept={["IMAGE", "VIDEO"]}
              cols={1}
              error={fieldState.error?.message}
              existingImages={
                data?.desktopView?.existingAsset
                  ? [data.desktopView.existingAsset]
                  : []
              }
              existingImagesDelete={async (url) => {
                console.log("Delete desktop image:", url);
              }}
            />
          </div>
        )}
      />
      <Controller
        control={control}
        name={`${prefix}.desktopView.aspectRatio`}
        render={({ field, fieldState }) => (
          <Select
            {...field}
            label="Desktop Görünüm Aspect Ratio"
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
        name={`${prefix}.mobileView.file`}
        render={({ field, fieldState }) => (
          <div className="flex flex-col gap-1">
            <InputLabel>Mobil Görünümü</InputLabel>
            <GlobalDropzone
              {...field}
              multiple={false}
              maxSize={5 * 1024 * 1024}
              maxFiles={data?.mobileView?.existingAsset ? 0 : 1}
              onDrop={(files) => {
                if (!files.length) return;
                field.onChange(files[0]);
              }}
              accept={["IMAGE", "VIDEO"]}
              cols={1}
              error={fieldState.error?.message}
              existingImages={
                data?.mobileView?.existingAsset
                  ? [data.mobileView.existingAsset]
                  : []
              }
              existingImagesDelete={async (url) => {
                console.log("Delete mobile image:", url);
              }}
            />
          </div>
        )}
      />
      <Controller
        control={control}
        name={`${prefix}.mobileView.aspectRatio`}
        render={({ field, fieldState }) => (
          <Select
            {...field}
            label="Mobil Görünüm Aspect Ratio"
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

export default SlideForm;
